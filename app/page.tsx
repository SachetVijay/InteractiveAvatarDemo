"use client";

import { useState } from "react";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { StreamingAvatarProvider } from "@/components/logic";
import HumanGate from "@/components/HumanGate";

export default function App() {
  const [verified, setVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleVerified = (token: string) => {
    setTurnstileToken(token);
    setVerified(true);
  };

  return verified && turnstileToken ? (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-950">
      <div className="w-[1350px] flex flex-col items-center justify-center">
        <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
          <InteractiveAvatar turnstileToken={turnstileToken} />
        </StreamingAvatarProvider>
      </div>
    </div>
  ) : (
    <HumanGate onVerify={handleVerified} />
  );
}
