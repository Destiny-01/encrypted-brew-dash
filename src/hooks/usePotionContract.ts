/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useToast } from "./use-toast";
import { Contract, ethers } from "ethers";
import contractData from "@/config/Potion.json";
import {
  encryptValue,
  requestUserDecryption,
  fetchPublicDecryption,
} from "@/lib/fhe";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface ContractType {
  address: string;
  abi: any[];
}
const contract: ContractType = contractData as any;

export const contractConfig = {
  address: contract.address,
  abi: contract.abi,
};

export function usePotionContract() {
  const { address } = useAccount();
  const { toast } = useToast();

  // wagmi gives you both read & write clients
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);

  // Contract instance for reads (ethers wrapper around wagmi's RPC)
  const readContract = useMemo(() => {
    if (!publicClient) return null;
    const rpc = new ethers.JsonRpcProvider(publicClient.transport.url);
    return new ethers.Contract(contractConfig.address, contractConfig.abi, rpc);
  }, [publicClient]);

  // Helper: contract with signer for writes
  const getSignerContract = async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    const provider = new ethers.BrowserProvider(walletClient.transport as any);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );

    return { contract, signer };
  };

  // ---------------------------
  // Reads
  // ---------------------------
  const fetchLeaderboard = async () => {
    if (!readContract) return [];
    try {
      setIsLoading(true);

      const playersAndGuesses = await readContract.getAllHighestGuesses();
      const [players, guesses] = playersAndGuesses as [string[], string[]];

      // decrypt via your FHE helpers
      const decryptedMap = await fetchPublicDecryption(guesses);
      return players.map((player, idx) => ({
        player,
        guess: Number(decryptedMap[guesses[idx]]),
      }));
    } catch (err: any) {
      console.error("Error fetching room:", err);
      toast({
        title: "Failed to load room",
        description: "Could not fetch room data from contract.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  // Writes
  // ---------------------------
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

      const encryptedVault = await encryptValue(
        contractConfig.address,
        address,
        vaultCode
      );

      toast({
        title: "⚡ Encrypting vault...",
        description: "Securing your code with FHE.",
      });

      const { contract: contractWithSigner, signer } =
        await getSignerContract();
      const tx = await contractWithSigner.compute(
        ...encryptedVault.handles,
        encryptedVault.inputProof
      );

      toast({
        title: "📡 Transaction submitted...",
        description: "Waiting for confirmation.",
      });
      const receipt = await tx.wait();

      // Extract ComputeResult from logs
      const iface = new ethers.Interface(contractConfig.abi as any);
      let value: string | null = null;
      let isHighest: boolean | null = null;
      for (const log of receipt.logs ?? []) {
        try {
          const parsed = iface.parseLog({ topics: log.topics, data: log.data });
          if (parsed?.name === "ComputeResult") {
            value = parsed.args?.[0];
            isHighest = parsed.args?.[1];
            break;
          }
        } catch {
          continue;
        }
      }

      if (value == null) throw new Error("ComputeResult not found in logs");

      toast({
        title: "📡 Transaction successful",
        description: "Decrypting output...",
      });
      const decrypted = await requestUserDecryption(
        contractConfig.address,
        signer,
        value
      );

      return { decrypted, isHighest };
    } catch (err: any) {
      console.error("Error creating room:", err);
      toast({
        title: "❌ Failed to create room",
        description: err.message || "Transaction failed or was rejected.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchLeaderboard,
    submitPotion,
  };
}
