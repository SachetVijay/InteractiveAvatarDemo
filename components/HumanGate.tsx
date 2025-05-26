import { useState } from "react";
import Turnstile from "react-turnstile";

import { Button } from "./Button";

const siteKey = "0x4AAAAAABepMIGHsoVlS0fd"; // ✅ Your Cloudflare Site Key

export default function HumanGate({ onVerify }: { onVerify: (token: string) => void }) {
  const [verified, setVerified] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Are you human?</h1>

      <Turnstile
        sitekey={siteKey}
        onVerify={(token) => {
          setVerified(true);
          onVerify(token); // pass token to parent
        }}
        theme="light"
      />

      {!verified && (
        <p className="text-sm mt-4 text-gray-400">Secured by Cloudflare</p>
      )}
    </div>
  );
}
