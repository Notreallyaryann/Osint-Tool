import { checkInstagram } from "./services/email/footprint/social/instagram";
import { checkFacebook } from "./services/email/footprint/social/facebook";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Session ID present:", !!process.env.INSTAGRAM_SESSION_ID);
  
  console.log("Testing Instagram...");
  const igResult = await checkInstagram("aryanpatel998493@gmail.com");
  console.log("IG Result:", JSON.stringify(igResult, null, 2));

  console.log("Testing Facebook...");
  const fbResult = await checkFacebook("aryanpatel998493@gmail.com");
  console.log("FB Result:", JSON.stringify(fbResult, null, 2));
}

main().catch(console.error);
