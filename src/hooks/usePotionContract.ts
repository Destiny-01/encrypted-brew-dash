/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { ethers } from "ethers";
import { decodeEventLog } from "viem";
import contractData from "@/config/Potion.json";
import {
  encryptValue,
  requestUserDecryption,
  fetchPublicDecryption,
} from "@/lib/fhe";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";

interface ContractType {
  address: string;
  abi: any[];
}
const contract: ContractType = contractData as any;

export const contractConfig = {
  address: contract.address as `0x${string}`,
  abi: contract.abi,
};

export function usePotionContract() {
  const { address } = useAccount();
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------
  // Reads
  // ---------------------------
  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient) return [];
    
    try {
      setIsLoading(true);

      const result = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: "getAllHighestGuesses",
        args: [],
      } as any);

      const [players, guesses] = result as [string[], string[]];

      if (guesses.length === 0) return [];

      // decrypt via your FHE helpers
      const decryptedMap = await fetchPublicDecryption(guesses);
      return players.map((player, idx) => ({
        player,
        guess: Number(decryptedMap[guesses[idx]]),
      }));
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      toast({
        title: "Failed to load leaderboard",
        description: "Unable to fetch leaderboard data. Please refresh the page.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, toast]);

  // ---------------------------
  // Writes
  // ---------------------------
  const submitPotion = useCallback(async (vaultCode: number[]) => {
    if (!address || !walletClient || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit.",
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
        title: "⚡ Encrypting potion...",
        description: "Securing your brew with FHE encryption.",
      });

      // Ensure handles and proof are properly formatted as hex strings
      const formatHandle = (handle: any): `0x${string}` => {
        if (typeof handle === 'string') {
          return handle.startsWith('0x') ? handle as `0x${string}` : `0x${handle}`;
        }
        // Convert Uint8Array or Buffer to hex
        const hexString = Array.from(new Uint8Array(handle))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        return `0x${hexString}`;
      };

      // Use wagmi's writeContract through walletClient
      const hash = await walletClient.writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: "compute",
        args: [
          formatHandle(encryptedVault.handles[0]),
          formatHandle(encryptedVault.handles[1]),
          formatHandle(encryptedVault.handles[2]),
          formatHandle(encryptedVault.handles[3]),
          formatHandle(encryptedVault.handles[4]),
          formatHandle(encryptedVault.inputProof),
        ],
        account: address,
      } as any);

      toast({
        title: "📡 Transaction submitted",
        description: "Waiting for blockchain confirmation...",
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Extract ComputeResult from logs using viem
      let value: string | null = null;
      let isHighest: boolean | null = null;
      
      for (const log of receipt.logs ?? []) {
        try {
          const decoded: any = decodeEventLog({
            abi: contractConfig.abi,
            data: log.data,
            topics: (log as any).topics,
          });
          
          if (decoded.eventName === "ComputeResult") {
            value = decoded.args.value;
            isHighest = decoded.args.isHighest;
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

      // Create signer for decryption
      const provider = new ethers.BrowserProvider(walletClient.transport as any);
      const signer = await provider.getSigner();

      const decrypted = await requestUserDecryption(
        contractConfig.address,
        signer,
        value
      );

      return { decrypted, isHighest };
    } catch (err: any) {
      console.error("Error submitting potion:", err);
      const errorMsg = err.message || "";
      toast({
        title: "❌ Failed to submit potion",
        description: errorMsg.includes("rejected") || errorMsg.includes("denied")
          ? "Transaction was rejected by user."
          : "Transaction failed. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, toast]);

  return {
    isLoading,
    fetchLeaderboard,
    submitPotion,
  };
}
