import fs from "fs";
import path from "path";
import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";

let proxies: { protocol: string; host: string; port: number }[] = [];

try {
  const proxyFilePath = path.join(process.cwd(), "proxies.txt");
  if (fs.existsSync(proxyFilePath)) {
    const data = fs.readFileSync(proxyFilePath, "utf8");
    const lines = data.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const protocol = parts[0].toLowerCase();
        const host = parts[1];
        const port = parseInt(parts[2], 10);
        if ((protocol === "http" || protocol === "socks4" || protocol === "socks5") && host && !isNaN(port)) {
          proxies.push({ protocol, host, port });
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to load proxies:", e);
}

export class ProxySession {
  private agent: any = null;

  constructor() {
    if (proxies.length > 0) {
      const proxy = proxies[Math.floor(Math.random() * proxies.length)];
      const url = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
      if (proxy.protocol.startsWith("socks")) {
        this.agent = new SocksProxyAgent(url);
      } else {
        this.agent = new HttpsProxyAgent(url);
      }
    }
  }

  private configureAgent(agent: any) {
    if (agent && typeof agent === 'object') {
      // Try to set rejectUnauthorized on the agent
      try {
        agent.options = agent.options || {};
        agent.options.rejectUnauthorized = false;
      } catch (e) {
        // Ignore if agent doesn't support this
      }
    }
  }

  async fetch(url: string, options: any = {}) {
    const axiosConfig: AxiosRequestConfig = {
      url,
      method: options.method || "GET",
      headers: options.headers,
      data: options.body,
      timeout: 10000,
      maxRedirects: options.redirect === "manual" ? 0 : 5,
      validateStatus: () => true, // don't throw on 4xx/5xx
    };

    if (this.agent) {
      // Configure agent to ignore SSL errors
      this.configureAgent(this.agent);
      axiosConfig.httpsAgent = this.agent;
      axiosConfig.httpAgent = this.agent;
      axiosConfig.proxy = false; // Don't use axios's built-in proxy
    }

    if (options.signal) {
      axiosConfig.signal = options.signal;
    }

    try {
      const res = await axios(axiosConfig);
      
      return {
        status: res.status,
        headers: {
          getSetCookie: () => {
            const sc = res.headers["set-cookie"];
            if (Array.isArray(sc)) return sc;
            if (typeof sc === "string") return [sc];
            return [];
          }
        },
        text: async () => {
          if (typeof res.data === "object") return JSON.stringify(res.data);
          return String(res.data);
        },
        json: async () => {
          if (typeof res.data === "string") return JSON.parse(res.data);
          return res.data;
        },
      };
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === "ECONNABORTED") {
        const err = new Error("Connection timed out");
        err.name = "TimeoutError";
        throw err;
      }
      throw e;
    }
  }
}

export async function proxyFetch(url: string, options: any = {}) {
  const session = new ProxySession();
  return session.fetch(url, options);
}
