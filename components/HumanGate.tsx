import { useEffect, useState } from "react";
import Turnstile from "react-turnstile";

import { Button } from "./Button";

const siteKey = "0x4AAAAAABepMIGHsoVlS0fd"; // ✅ Your Cloudflare Site Key

export default function HumanGate({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  const [verified, setVerified] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0); // Forcing remount

  // Ensures a fresh instance when component mounts
  useEffect(() => {
    setWidgetKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Are you human?</h1>

      <Turnstile
        key={widgetKey}
        sitekey={siteKey}
        theme="light"
        onVerify={(token) => {
          setVerified(true);
          onVerify(token);
        }}
      />

      {!verified && (
        <p className="text-sm mt-4 text-gray-400">Secured by Cloudflare</p>
      )}
    </div>
  );
}
