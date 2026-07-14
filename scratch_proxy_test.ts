import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";

async function main() {
  const proxyUrl = "socks4://45.95.233.237:1081"; // from user list
  const agent = new SocksProxyAgent(proxyUrl);

  try {
    const res = await axios.get("https://api.ipify.org?format=json", {
      httpsAgent: agent,
      timeout: 10000,
    });
    console.log("Success:", res.data);
  } catch (e) {
    console.error("Fetch failed", (e as Error).message);
  }
}
main();
