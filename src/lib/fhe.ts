/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createInstance,
  FhevmInstance,
  HandleContractPair,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/bundle";
import { Signer } from "ethers";
import { initSDK } from "@zama-fhe/relayer-sdk/bundle";

let relayer: FhevmInstance | null = null;

/**
 * Initialize the FHE relayer SDK
 * Must be called before any encryption/decryption operations
 */
export async function initializeFHE() {
  try {
    if (!relayer) {
      await initSDK();
      relayer = await createInstance(SepoliaConfig);
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

/**
 * Encrypt potion values using FHE
 * @param contractAddress - The smart contract address
 * @param address - User's wallet address
 * @param plainDigits - Array of numbers to encrypt (potion IDs)
 * @returns Encrypted ciphertext blob with handles and proof
 */
export async function encryptValue(
  contractAddress: string,
  address: string,
  plainDigits: number[]
) {
  if (!relayer) throw new Error("Relayer not initialized");

  const inputHandle = relayer.createEncryptedInput(contractAddress, address);
  for (const d of plainDigits) {
    inputHandle.add8(d);
  }
  
  const ciphertextBlob = await inputHandle.encrypt();
  return ciphertextBlob;
}

/**
 * Request user decryption of encrypted result
 * Uses EIP-712 signature for authentication
 * @param contractAddress - The smart contract address
 * @param signer - Ethers signer for EIP-712 signature
 * @param ciphertextHandle - The encrypted value handle from contract
 * @returns Decrypted value
 */
export async function requestUserDecryption(
  contractAddress: string,
  signer: Signer,
  ciphertextHandle: string
) {
  if (!relayer) throw new Error("Relayer not initialized");

  const keypair = relayer.generateKeypair();
  const handleContractPairs: HandleContractPair[] = [
    {
      handle: ciphertextHandle,
      contractAddress: contractAddress,
    },
  ];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10"; // String for consistency
  const contractAddresses = [contractAddress];

  const eip712 = relayer.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );

  const signature = await signer.signTypedData(
    eip712.domain,
    {
      UserDecryptRequestVerification:
        eip712.types.UserDecryptRequestVerification,
    },
    eip712.message
  );

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

  const decryptedValue = result[ciphertextHandle];

  return decryptedValue;
}

/**
 * Fetch public decryption for leaderboard scores
 * @param handles - Array of encrypted value handles
 * @returns Mapping of handles to decrypted values
 */
export async function fetchPublicDecryption(handles: string[]): Promise<any> {
  if (!relayer) throw new Error("Relayer not initialized");
  return relayer.publicDecrypt(handles);
}
