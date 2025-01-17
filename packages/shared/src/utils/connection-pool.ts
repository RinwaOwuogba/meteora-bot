import { Connection } from '@solana/web3.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class ConnectionPool {
  private rpcEndpoints: string[];
  private proxies: string[];
  private options: {
    poolSize: number;
    useMultiRPC: boolean;
    useMultiProxy: boolean;
  };
  private pool: Connection[];
  private currentIndex: number;

  constructor(rpcEndpoints: string[], proxyList: string[], options = {}) {
    this.rpcEndpoints = rpcEndpoints;
    this.proxies = proxyList.map(this.formatProxy);
    this.options = {
      poolSize: (options as any).poolSize || 5, // Ensure options is type-asserted
      useMultiRPC: (options as any).useMultiRPC || false,
      useMultiProxy: (options as any).useMultiProxy || false,
    };

    this.pool = [];
    this.currentIndex = 0;

    this.initializePool();
  }

  private formatProxy(proxy: string): string {
    const [ip, port, user, pass] = proxy.split(':');
    return `http://${user}:${pass}@${ip}:${port}`;
  }

  private createConnection(index: number): Connection {
    const rpcUrl = this.options.useMultiRPC
      ? this.rpcEndpoints[index % this.rpcEndpoints.length]
      : this.rpcEndpoints[0];

    const fetchOptions: Record<string, any> = {
      fetch: (url: string, options: any) => {
        if (this.options.useMultiProxy) {
          const proxyUrl = this.proxies[index % this.proxies.length];
          options.agent = new HttpsProxyAgent(proxyUrl);
        }
        return fetch(url, options);
      },
    };

    return new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 120000,
      ...fetchOptions,
    });
  }

  private initializePool(): void {
    for (let i = 0; i < this.options.poolSize; i++) {
      this.pool.push(this.createConnection(i));
    }
  }

  public getConnection(): Connection {
    const connection = this.pool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.pool.length;
    return connection;
  }
}
