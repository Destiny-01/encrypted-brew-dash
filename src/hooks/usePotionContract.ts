/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { Contract, ethers } from "ethers";
import contractData from "@/config/Potion.json";
import {
  encryptValue,
  requestUserDecryption,
  fetchPublicDecryption,
} from "@/lib/fhe";
import { useAccount } from "wagmi";

interface ContractType {
  address: string;
  abi: any[];
}
// Contract address - replace with actual deployed address
const contract: ContractType = contractData as any;

// Contract configuration
export const contractConfig = {
  address: contract.address,
  abi: contract.abi,
};

export function usePotionContract() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [potionContract, setPotionContract] = useState<Contract | null>(null);
  const [isContractReady, setIsContractReady] = useState(false);

  // Internal initializer to avoid race on first page load
  const initContractIfNeeded = async (): Promise<Contract> => {
    if (potionContract) return potionContract;
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("Wallet provider not available");
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const instance = new Contract(
      contractConfig.address,
      contractConfig.abi,
      provider
    ) as any;
    setPotionContract(instance);
    setIsContractReady(true);
    return instance as unknown as Contract;
  };

  // Initialize contract once after mount (best-effort)
  useEffect(() => {
    (async () => {
      try {
        await initContractIfNeeded();
      } catch {
        // ignore; fetchers will attempt init again
      }
    })();
    // no cleanup needed
  }, []);

  // Read Functions
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);

      const instance = await initContractIfNeeded();

      const result = await (instance as any).getAllHighestGuesses();
      const [players, guesses] = result as [string[], string[]];
      // Decrypt public guesses (bytes32 handles -> numbers)
      const decryptedMap = await fetchPublicDecryption(guesses);
      const items = players.map((player, idx) => ({
        player,
        guess: Number(decryptedMap[guesses[idx]]),
      }));
      console.log({ items });

      return items;
    } catch (error: any) {
      console.error("Error fetching room:", error);
      if (error?.value === "0x") {
        return null;
      }
      toast({
        title: "Failed to load room",
        description: "Could not fetch room data from contract.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Write Functions
  const submitPotion = async (vaultCode: number[]) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a room.",
        variant: "destructive",
      });
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);

      // Encrypt vault using crypto module
      const encryptedVault = await encryptValue(
        contractConfig.address,
        address,
        vaultCode
      );

      toast({
        title: "⚡ Encrypting vault...",
        description: "Securing your code with FHE encryption.",
      });

      // Ensure contract & signer
      const signer = await new ethers.BrowserProvider(
        (window as any).ethereum
      ).getSigner();
      const instance = await initContractIfNeeded();
      const contractWithSigner = (instance as any).connect(signer) as any;
      const tx = await contractWithSigner.compute(
        ...encryptedVault.handles,
        encryptedVault.inputProof
      );

      toast({
        title: "📡 Transaction submitted...",
        description: "Waiting for blockchain confirmation.",
      });

      const receipt = await tx.wait();

      // Parse ComputeResult event from logs (ethers v6)
      const iface = new ethers.Interface(contractConfig.abi as any);
      let value: string | null = null;
      let isHighest: boolean | null = null;
      for (const log of receipt.logs ?? []) {
        try {
          const parsed = iface.parseLog({ topics: log.topics, data: log.data });
          if (parsed?.name === "ComputeResult") {
            // ABI says inputs: value (bytes32/euint16), isHighest (bool)
            const rawValue = parsed.args?.[0];
            const rawIsHighest = parsed.args?.[1];
            value = rawValue;
            isHighest = rawIsHighest;
            break;
          }
        } catch {
          continue;
        }
      }

      if (value == null || isHighest == null) {
        throw new Error("ComputeResult event not found in transaction logs");
      }
      console.log({ value, isHighest });
      toast({
        title: "📡 Transaction successful",
        description: "Decrypting the output",
      });
      const decrypted = await requestUserDecryption(
        contractConfig.address,
        signer,
        value
      );
      console.log({ decrypted });

      return decrypted;
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast({
        title: "❌ Failed to create room",
        description: error.message || "Transaction failed or was rejected.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    contract: potionContract,

    // Write Functions
    fetchLeaderboard,
    submitPotion,
  };
}
