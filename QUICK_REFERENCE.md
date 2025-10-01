# 🚀 Quick Reference Guide

## Essential Code Snippets

### Wagmi Hooks

```typescript
// Get connected wallet address
const { address, isConnected } = useAccount();

// Get ETH balance
const { data: balance } = useBalance({ address });

// Get public client (for reading)
const publicClient = usePublicClient();

// Get wallet client (for writing)
const { data: walletClient } = useWalletClient();
```

### Reading from Contract

```typescript
const result = await publicClient.readContract({
  address: "0x...",
  abi: contractAbi,
  functionName: "getFunctionName",
  args: [arg1, arg2],
});
```

### Writing to Contract

```typescript
const hash = await walletClient.writeContract({
  address: "0x...",
  abi: contractAbi,
  functionName: "setFunctionName",
  args: [arg1, arg2],
  account: address,
});

// Wait for confirmation
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

### Decoding Events

```typescript
import { decodeEventLog } from "viem";

const decoded = decodeEventLog({
  abi: contractAbi,
  data: log.data,
  topics: log.topics,
});

console.log(decoded.eventName); // Event name
console.log(decoded.args); // Event arguments
```

### FHE Encryption

```typescript
// Initialize (once at app start)
await initializeFHE();

// Encrypt values
const encrypted = await encryptValue(
  contractAddress,
  userAddress,
  [value1, value2, value3]
);

// Access handles and proof
encrypted.handles[0]; // First encrypted value
encrypted.inputProof; // Proof for verification
```

### FHE Decryption

```typescript
// Private decryption (requires user signature)
const decrypted = await requestUserDecryption(
  contractAddress,
  signer,
  encryptedHandle
);

// Public decryption (for leaderboard data)
const results = await fetchPublicDecryption([handle1, handle2, handle3]);
console.log(results[handle1]); // Decrypted value
```

### Toast Notifications

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success
toast({
  title: "Success!",
  description: "Operation completed.",
});

// Error
toast({
  title: "Error",
  description: "Something went wrong.",
  variant: "destructive",
});

// Info
toast({
  title: "Loading...",
  description: "Please wait...",
});
```

### Error Handling Pattern

```typescript
try {
  // Your operation
  const result = await someAsyncOperation();
  
  toast({
    title: "Success!",
    description: "Operation completed.",
  });
  
  return result;
} catch (err: any) {
  const errorMsg = err.message || "";
  
  if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
    toast({
      title: "Cancelled",
      description: "Transaction was rejected.",
    });
  } else {
    toast({
      title: "Error",
      description: errorMsg || "Operation failed.",
      variant: "destructive",
    });
  }
  
  throw err; // Re-throw if caller needs to handle
}
```

### Format Utilities

```typescript
// Format address
const formatAddress = (addr: string) => 
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Format balance
const formatBalance = (balance: any) =>
  balance 
    ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}` 
    : "0.000 ETH";

// Format number with commas
const formatNumber = (num: number) => num.toLocaleString();
```

### Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleOperation = async () => {
  setIsLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setIsLoading(false); // Always reset
  }
};

// In JSX
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Hex Formatting for FHE

```typescript
const formatHandle = (handle: any): `0x${string}` => {
  if (typeof handle === 'string') {
    return handle.startsWith('0x') 
      ? handle as `0x${string}` 
      : `0x${handle}`;
  }
  
  // Convert Uint8Array to hex
  const hexString = Array.from(new Uint8Array(handle))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hexString}`;
};
```

### EIP-712 Signature

```typescript
// Using ethers signer
const signature = await signer.signTypedData(
  domain,    // EIP-712 domain
  types,     // Type definitions
  message    // Actual message data
);
```

### Create Ethers Signer from Wagmi

```typescript
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(walletClient.transport as any);
const signer = await provider.getSigner();
```

---

## Common Patterns

### Safe Contract Call

```typescript
const safeContractCall = async () => {
  if (!publicClient || !address) {
    toast({
      title: "Not Connected",
      description: "Please connect your wallet.",
      variant: "destructive",
    });
    return null;
  }

  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "getData",
    });
    return result;
  } catch (error) {
    console.error("Contract call failed:", error);
    return null;
  }
};
```

### Transaction with Loading State

```typescript
const submitTransaction = async () => {
  if (!walletClient || !address) {
    throw new Error("Wallet not connected");
  }

  setIsLoading(true);
  
  try {
    toast({ title: "Submitting...", description: "Confirm in wallet" });
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "submit",
      args: [data],
      account: address,
    });
    
    toast({ title: "Confirming...", description: "Waiting for blockchain" });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    toast({ title: "Success!", description: "Transaction confirmed" });
    
    return receipt;
  } catch (error: any) {
    if (error.message?.includes("rejected")) {
      toast({ title: "Cancelled", description: "You rejected the transaction" });
    } else {
      toast({ 
        title: "Failed", 
        description: "Transaction failed", 
        variant: "destructive" 
      });
    }
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

---

## Debugging Tips

### Check Wallet Connection
```typescript
console.log("Connected:", isConnected);
console.log("Address:", address);
console.log("Wallet Client:", walletClient);
console.log("Public Client:", publicClient);
```

### Check Contract Call
```typescript
try {
  const result = await publicClient.readContract({...});
  console.log("Contract result:", result);
} catch (error) {
  console.error("Contract error:", error);
}
```

### Check FHE State
```typescript
import { getFhevmInstance } from "@/lib/fhe";

const relayer = await getFhevmInstance();
console.log("FHE Relayer:", relayer);
```

### Check Transaction Receipt
```typescript
console.log("Transaction hash:", hash);
console.log("Receipt:", receipt);
console.log("Logs:", receipt.logs);
console.log("Status:", receipt.status); // 1 = success, 0 = failed
```

---

## Type Definitions

```typescript
// Leaderboard Entry
interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
}

// User Stats
interface UserStats {
  address: string;
  highestScore: number;
  currentRank: number;
}

// Contract Config
interface ContractType {
  address: string;
  abi: any[];
}

// FHE Encrypted Result
interface EncryptedResult {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

// Transaction Receipt
interface Receipt {
  hash: string;
  status: "success" | "reverted";
  logs: Log[];
  blockNumber: bigint;
  gasUsed: bigint;
}
```

---

## Environment Setup

### Required Dependencies

```json
{
  "@rainbow-me/rainbowkit": "^2.2.8",
  "wagmi": "^2.17.5",
  "viem": "^2.37.9",
  "@tanstack/react-query": "^5.83.0",
  "@zama-fhe/relayer-sdk": "^0.2.0",
  "ethers": "^6.15.0"
}
```

### Configuration Files

**tailwind.config.ts** - Already configured  
**vite.config.ts** - Already configured  
**tsconfig.json** - Already configured  

---

## Useful Links

- [Viem Docs](https://viem.sh/)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Zama FHE Docs](https://docs.zama.ai/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)

---

## Contract ABI Location

The contract ABI is located at:
```
src/config/Potion.json
```

Import it with:
```typescript
import contractData from "@/config/Potion.json";
```

---

## Next Steps After Implementation

1. ✅ Test wallet connection
2. ✅ Test reading leaderboard
3. ✅ Test submitting potions
4. ✅ Test FHE encryption/decryption
5. ✅ Handle all error cases
6. ✅ Test on Sepolia testnet
7. 🚀 Deploy to production

---

**Pro Tip:** Keep your browser console open while developing to catch errors early!
