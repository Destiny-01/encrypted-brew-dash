# 🧪 Potion Brew - Web3 + FHE Tutorial

Welcome to the Potion Brew tutorial! This project teaches you how to build a Web3 application with Fully Homomorphic Encryption (FHE) using:
- **RainbowKit + Wagmi** for wallet connection
- **Viem** for Ethereum interactions
- **Zama FHE SDK** for encrypted computations

## 📚 Tutorial Structure

### Step 1: Wallet Connection Basics
Learn how to connect users' wallets and display account information.

### Step 2: Smart Contract Reading
Read data from the blockchain and display a leaderboard.

### Step 3: Smart Contract Writing
Submit transactions and handle the full transaction lifecycle.

### Step 4: FHE Integration
Add privacy-preserving computations with Fully Homomorphic Encryption.

### Step 5: Advanced Features
Implement production-ready error handling and UX improvements.

---

## 🚀 Step 1: Wallet Connection Basics

### Files to Implement:
- `src/lib/wagmi.ts`
- `src/components/WalletConnect.tsx`

### What You'll Learn:
- Configure Wagmi with WalletConnect Project ID
- Use RainbowKit's ConnectButton.Custom
- Display wallet address and ETH balance
- Format addresses for better UX

### Implementation Guide:

#### 1.1 Configure Wagmi (`src/lib/wagmi.ts`)

```typescript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

// Get your project ID from https://cloud.walletconnect.com/
const projectId = "your-project-id-here";

export const config = getDefaultConfig({
  appName: "Potion Brew",
  projectId,
  chains: [sepolia], // Ethereum Sepolia testnet
  ssr: false,
});
```

**Resources:**
- [Get WalletConnect Project ID](https://cloud.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/react/getting-started)
- [RainbowKit Setup](https://www.rainbowkit.com/docs/installation)

#### 1.2 Display Connected Wallet (`src/components/WalletConnect.tsx`)

The `ConnectedWalletDisplay` component needs to:
1. Use `useAccount()` to get wallet address
2. Use `useBalance()` to fetch ETH balance
3. Format address as "0x1234...5678"
4. Format balance as "0.123 ETH"

```typescript
function ConnectedWalletDisplay({ account }: { account: any }) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatBalance = (bal: any) =>
    bal ? `${parseFloat(bal.formatted).toFixed(3)} ${bal.symbol}` : "0.000 ETH";

  // ... rest of component (already implemented)
}
```

**Key Concepts:**
- **useAccount()**: Wagmi hook for wallet state
- **useBalance()**: Fetch native token balance
- **Address formatting**: UX best practice for displaying addresses

---

## 📖 Step 2: Smart Contract Reading

### Files to Implement:
- `src/hooks/usePotionContract.ts` (fetchLeaderboard function)

### What You'll Learn:
- Use `publicClient.readContract()` for view functions
- Decode contract return values
- Integrate FHE public decryption
- Handle loading states

### Implementation Guide:

#### 2.1 Fetch Leaderboard Data

Replace the mock data in `fetchLeaderboard`:

```typescript
const fetchLeaderboard = useCallback(async () => {
  if (!publicClient) return [];
  
  try {
    setIsLoading(true);

    // 1. Call the contract's view function
    const result = await publicClient.readContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: "getAllHighestGuesses",
      args: [],
    } as any);

    // 2. Destructure the result
    const [players, guesses] = result as [string[], string[]];

    if (guesses.length === 0) return [];

    // 3. Decrypt the encrypted guesses (Step 4)
    const decryptedMap = await fetchPublicDecryption(guesses);
    
    // 4. Map to leaderboard entries
    return players.map((player, idx) => ({
      player,
      guess: Number(decryptedMap[guesses[idx]]),
    }));
  } catch (err: any) {
    console.error("Error fetching leaderboard:", err);
    toast({
      title: "Failed to load leaderboard",
      description: "Unable to fetch leaderboard data.",
      variant: "destructive",
    });
    return [];
  } finally {
    setIsLoading(false);
  }
}, [publicClient, toast]);
```

**Key Concepts:**
- **publicClient**: Viem client for read-only operations
- **readContract()**: Call view/pure functions without gas
- **Type casting**: Handle contract return values
- **Error handling**: Always catch and display errors

**Resources:**
- [Viem Public Client](https://viem.sh/docs/clients/public.html)
- [Reading Contracts](https://viem.sh/docs/contract/readContract.html)

---

## ✍️ Step 3: Smart Contract Writing

### Files to Implement:
- `src/hooks/usePotionContract.ts` (submitPotion function)

### What You'll Learn:
- Use `walletClient.writeContract()` for transactions
- Wait for transaction confirmation
- Decode event logs from receipts
- Handle user rejections

### Implementation Guide:

#### 3.1 Submit Potion Transaction

Replace the mock implementation in `submitPotion`:

```typescript
const submitPotion = useCallback(async (vaultCode: number[]) => {
  if (!address || !walletClient || !publicClient) {
    throw new Error("Wallet not connected");
  }
  
  try {
    setIsLoading(true);

    // STEP 1: Encrypt the vault code (implemented in Step 4)
    const encryptedVault = await encryptValue(
      contractConfig.address,
      address,
      vaultCode
    );

    toast({
      title: "⚡ Encrypting potion...",
      description: "Securing your brew with FHE encryption.",
    });

    // STEP 2: Format handles as hex strings
    const formatHandle = (handle: any): `0x${string}` => {
      if (typeof handle === 'string') {
        return handle.startsWith('0x') ? handle as `0x${string}` : `0x${handle}`;
      }
      const hexString = Array.from(new Uint8Array(handle))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return `0x${hexString}`;
    };

    // STEP 3: Submit transaction
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
      description: "Waiting for confirmation...",
    });

    // STEP 4: Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // STEP 5: Decode ComputeResult event from logs
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

    if (value == null) {
      throw new Error("ComputeResult not found in logs");
    }

    // STEP 6: Decrypt the result (implemented in Step 4)
    const provider = new ethers.BrowserProvider(walletClient.transport as any);
    const signer = await provider.getSigner();

    const decrypted = await requestUserDecryption(
      contractConfig.address,
      signer,
      value
    );

    return { decrypted, isHighest };
    
  } catch (err: any) {
    // Handle user rejection gracefully
    const errorMsg = err.message || "";
    if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
      toast({
        title: "❌ Transaction Cancelled",
        description: "You rejected the transaction.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "❌ Transaction Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    throw err;
  } finally {
    setIsLoading(false);
  }
}, [address, walletClient, publicClient, toast]);
```

**Key Concepts:**
- **walletClient**: Viem client for write operations
- **writeContract()**: Submit transactions (requires gas)
- **waitForTransactionReceipt()**: Wait for confirmation
- **decodeEventLog()**: Parse event data from logs
- **Error handling**: Distinguish user rejections from failures

**Resources:**
- [Viem Wallet Client](https://viem.sh/docs/clients/wallet.html)
- [Writing Contracts](https://viem.sh/docs/contract/writeContract.html)
- [Decoding Events](https://viem.sh/docs/contract/decodeEventLog.html)

---

## 🔐 Step 4: FHE Integration

### Files to Implement:
- `src/lib/fhe.ts` (all functions)
- `src/App.tsx` (FHE initialization)

### What You'll Learn:
- Initialize Zama FHE SDK
- Encrypt data client-side
- Request private decryption with EIP-712 signatures
- Decrypt public data for leaderboards

### Implementation Guide:

#### 4.1 Initialize FHE SDK (`src/lib/fhe.ts`)

```typescript
export async function initializeFHE() {
  try {
    if (!relayer) {
      await initSDK(); // Initialize Zama SDK
      relayer = await createInstance(SepoliaConfig); // Create relayer instance
    }
    return relayer;
  } catch (error) {
    console.error("Failed to initialize FHEVM relayer SDK:", error);
    throw new Error("Failed to initialize FHE encryption");
  }
}

export async function getFhevmInstance() {
  if (!relayer) {
    await initializeFHE();
  }
  return relayer;
}
```

#### 4.2 Client-Side Encryption

```typescript
export async function encryptValue(
  contractAddress: string,
  address: string,
  plainDigits: number[]
) {
  if (!relayer) throw new Error("Relayer not initialized");

  // Create encrypted input handle
  const inputHandle = relayer.createEncryptedInput(contractAddress, address);
  
  // Add each digit as uint8
  for (const d of plainDigits) {
    inputHandle.add8(d);
  }
  
  // Encrypt and return ciphertext blob
  const ciphertextBlob = await inputHandle.encrypt();
  return ciphertextBlob;
}
```

#### 4.3 Private Decryption with EIP-712

```typescript
export async function requestUserDecryption(
  contractAddress: string,
  signer: Signer,
  ciphertextHandle: string
) {
  if (!relayer) throw new Error("Relayer not initialized");

  // 1. Generate keypair for this request
  const keypair = relayer.generateKeypair();
  
  // 2. Setup decryption parameters
  const handleContractPairs: HandleContractPair[] = [
    { handle: ciphertextHandle, contractAddress }
  ];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10";
  const contractAddresses = [contractAddress];

  // 3. Create EIP-712 typed data
  const eip712 = relayer.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );

  // 4. Request user signature (MetaMask popup)
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );

  // 5. Decrypt with relayer
  const result = await relayer.userDecrypt(
    handleContractPairs,
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    await signer.getAddress(),
    startTimeStamp,
    durationDays
  );

  return result[ciphertextHandle];
}
```

#### 4.4 Public Decryption for Leaderboards

```typescript
export async function fetchPublicDecryption(handles: string[]): Promise<any> {
  if (!relayer) throw new Error("Relayer not initialized");
  return relayer.publicDecrypt(handles);
}
```

#### 4.5 Initialize in App (`src/App.tsx`)

Uncomment the initialization code:

```typescript
const App = () => {
  const [fheReady, setFheReady] = useState(false);

  useEffect(() => {
    initializeFHE()
      .then(() => {
        console.log("FHE initialized successfully");
        setFheReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize FHE:", err);
      });
  }, []);

  if (!fheReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-magic-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing encryption...</p>
        </div>
      </div>
    );
  }

  return (/* ... rest of app */);
};
```

**Key Concepts:**
- **FHE SDK**: Must be initialized before use
- **Client-side encryption**: Encrypt sensitive data before sending
- **EIP-712**: Standard for typed data signing
- **Public vs Private decryption**: Leaderboard vs personal scores

**Resources:**
- [Zama FHE Documentation](https://docs.zama.ai/fhevm)
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)

---

## 🎯 Step 5: Advanced Features

### What You'll Learn:
- Production-ready error handling
- Loading states and optimistic updates
- Transaction lifecycle management
- User feedback with toasts

### Best Practices:

#### 5.1 Error Handling Patterns

```typescript
try {
  // Operation
} catch (err: any) {
  const errorMsg = err.message || "";
  
  // Distinguish error types
  if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
    // User cancelled - don't show as error
    toast({ title: "Cancelled", description: "You rejected the request." });
  } else if (errorMsg.includes("insufficient funds")) {
    // Specific guidance
    toast({ title: "Insufficient Balance", description: "You need more ETH." });
  } else {
    // Generic error
    toast({ title: "Error", description: "Please try again.", variant: "destructive" });
  }
}
```

#### 5.2 Loading State Management

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitPotion(selectedPotions);
  } finally {
    setIsSubmitting(false); // Always reset, even on error
  }
};
```

#### 5.3 Progressive Toast Updates

```typescript
// Step 1: Encrypting
toast({ title: "🔐 Encrypting...", description: "Securing your data" });

// Step 2: Transaction
toast({ title: "📡 Submitting...", description: "Confirm in wallet" });

// Step 3: Confirmation
toast({ title: "⏳ Confirming...", description: "Waiting for blockchain" });

// Step 4: Success
toast({ title: "✅ Success!", description: "Transaction complete" });
```

---

## 🧪 Testing Your Implementation

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Get test ETH:**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Get free test ETH for transactions

### Testing Checklist

- [ ] Wallet connects successfully
- [ ] Address and balance display correctly
- [ ] Leaderboard loads without errors
- [ ] Can select potions (1-5)
- [ ] Brew button is disabled until potions selected
- [ ] Encryption toast appears
- [ ] MetaMask prompts for transaction
- [ ] Can cancel transaction gracefully
- [ ] Transaction success shows score
- [ ] Leaderboard updates after successful brew
- [ ] High score detection works
- [ ] All error cases handled properly

---

## 📚 Additional Resources

### Documentation
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Zama FHE Docs](https://docs.zama.ai/fhevm)

### Tools
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

### Community
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [Zama Discord](https://discord.gg/zama)
- [Wagmi Discussions](https://github.com/wagmi-dev/wagmi/discussions)

---

## 🐛 Common Issues & Solutions

### Issue: "Relayer not initialized"
**Solution:** Ensure `initializeFHE()` is called in `App.tsx` before any FHE operations.

### Issue: "User rejected transaction"
**Solution:** This is normal - users can cancel. Handle gracefully with appropriate toast.

### Issue: "Insufficient funds"
**Solution:** Get test ETH from Sepolia faucet.

### Issue: "Cannot read properties of undefined"
**Solution:** Check that wallet is connected before calling contract functions.

### Issue: "Invalid project ID"
**Solution:** Get a valid project ID from WalletConnect Cloud.

---

## 🎓 Learning Objectives

By completing this tutorial, you will understand:

✅ How to integrate wallet connection with RainbowKit  
✅ How to read from smart contracts with Viem  
✅ How to write to smart contracts and handle transactions  
✅ How to work with Fully Homomorphic Encryption  
✅ How to decode events from transaction logs  
✅ How to handle errors and provide good UX  
✅ How to work with EIP-712 signatures  
✅ How to build production-ready Web3 applications  

---

## 🚀 Next Steps

After completing this tutorial, consider:

1. **Deploy to mainnet** (with real funds considerations)
2. **Add more complex FHE computations**
3. **Implement additional features** (teams, tournaments, etc.)
4. **Optimize gas costs** (batch operations, etc.)
5. **Add social features** (sharing scores, challenges)

---

## 📝 License

MIT License - See LICENSE file for details

---

**Happy Building! 🧪✨**

If you get stuck, review the original code in the comments marked with `ORIGINAL CODE FOR DOCUMENTATION`.
