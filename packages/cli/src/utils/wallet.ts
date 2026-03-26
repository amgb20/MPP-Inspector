import {
  createWalletClient,
  createPublicClient,
  http,
  type WalletClient,
  type PublicClient,
  type Chain,
  type Account,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CHAINS } from "./chains.js";

export interface MppWallet {
  readonly client: WalletClient;
  readonly publicClient: PublicClient;
  readonly account: Account;
  readonly address: string;
}

function buildChain(chainId: number): Chain {
  const config = CHAINS[chainId];
  const name = config?.name ?? `Chain ${chainId}`;
  const rpcUrl = config?.rpcUrl ?? "";

  return {
    id: chainId,
    name,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
  } as Chain;
}

export function createMppWallet(privateKey: string, chainId: number, rpcUrl?: string): MppWallet {
  const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(key as `0x${string}`);

  const chain = buildChain(chainId);
  const transport = http(rpcUrl ?? CHAINS[chainId]?.rpcUrl);

  const client = createWalletClient({ account, chain, transport });
  const publicClient = createPublicClient({ chain, transport });

  return {
    client,
    publicClient,
    account,
    address: account.address,
  };
}

export async function getBalance(wallet: MppWallet): Promise<string> {
  try {
    const balance = await wallet.publicClient.getBalance({ address: wallet.account.address });
    return formatEther(balance);
  } catch {
    return "unknown";
  }
}

export function resolvePrivateKey(optionValue?: string): string | undefined {
  if (optionValue) return optionValue;
  return process.env.MPP_PRIVATE_KEY;
}

export class NonceManager {
  private currentNonce: number | null = null;
  private pending: Array<{ resolve: (n: number) => void }> = [];
  private acquiring = false;

  constructor(private readonly wallet: MppWallet) {}

  async acquireNonce(): Promise<number> {
    if (this.currentNonce === null) {
      if (this.acquiring) {
        return new Promise<number>((resolve) => {
          this.pending.push({ resolve });
        });
      }
      this.acquiring = true;
      try {
        this.currentNonce = await this.wallet.publicClient.getTransactionCount({
          address: this.wallet.account.address,
        });
      } finally {
        this.acquiring = false;
      }
      for (const waiter of this.pending) {
        this.currentNonce++;
        waiter.resolve(this.currentNonce - 1);
      }
      this.pending = [];
      const nonce = this.currentNonce;
      this.currentNonce++;
      return nonce;
    }

    const nonce = this.currentNonce;
    this.currentNonce++;
    return nonce;
  }
}
