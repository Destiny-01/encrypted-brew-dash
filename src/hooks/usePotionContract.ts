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
  /**
   * TODO: Step 2 - Implement Contract Reading
   * 1. Use publicClient.readContract() to call getAllHighestGuesses()
   * 2. Extract players and their encrypted guess handles
   * 3. Use fetchPublicDecryption() to decrypt all handles at once
   * 4. Map the results to player addresses and scores
   * 5. Return the leaderboard array
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient) return [];
    
    // TODO: Implement leaderboard fetching
    // Hint: Use publicClient.readContract() and fetchPublicDecryption()
    
    // Mock data for development (remove when implementing)
    return [
      { player: "0x1234567890123456789012345678901234567890", guess: 150 },
      { player: "0xabcdef0123456789abcdef0123456789abcdef01", guess: 120 },
      { player: "0x9876543210987654321098765432109876543210", guess: 90 },
    ];
    
    /* ORIGINAL CODE FOR DOCUMENTATION:
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
    */
  }, [publicClient, toast]);

  // ---------------------------
  // Writes
  // ---------------------------
  /**
   * TODO: Step 3 & 4 - Implement Transaction Submission with FHE
   * This combines multiple concepts:
   * 
   * 1. CLIENT-SIDE ENCRYPTION (Step 4):
   *    - Use encryptValue() to encrypt the potion IDs
   *    - Pad the vault code to exactly 5 values (contract requirement)
   *    - Get encrypted handles and proof
   * 
   * 2. TRANSACTION SUBMISSION (Step 3):
   *    - Use walletClient.writeContract() to call the compute() function
   *    - Pass the encrypted handles and proof as function arguments
   *    - Wait for transaction confirmation with waitForTransactionReceipt()
   * 
   * 3. EVENT PARSING (Step 3):
   *    - Decode the ComputeResult event from transaction logs
   *    - Extract the encrypted result handle and isHighest flag
   * 
   * 4. PRIVATE DECRYPTION (Step 4):
   *    - Use requestUserDecryption() to decrypt the result
   *    - Requires user signature (MetaMask popup)
   *    - Return decrypted score and isHighest flag
   * 
   * 5. ERROR HANDLING (Step 5):
   *    - Handle user rejection (wallet popup closed)
   *    - Handle transaction failures
   *    - Provide helpful error messages via toasts
   */
  const submitPotion = useCallback(async (vaultCode: number[]) => {
    if (!address || !walletClient || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit.",
        variant: "destructive",
      });
      throw new Error("Wallet not connected");
    }
    
    // TODO: Implement full potion submission flow
    // This is the most complex function - take it step by step!
    
    // Mock response for development (remove when implementing)
    toast({
      title: "🧪 Mock Brewing",
      description: "This is a mock response. Implement the real flow!",
    });
    
    // Simulate a random score
    const mockScore = Math.floor(Math.random() * 200) + 50;
    return { 
      decrypted: mockScore.toString(), 
      isHighest: Math.random() > 0.7 
    };
    
    /* ORIGINAL CODE FOR DOCUMENTATION:
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
    */
  }, [address, walletClient, publicClient, toast]);

  return {
    isLoading,
    fetchLeaderboard,
    submitPotion,
  };
}
