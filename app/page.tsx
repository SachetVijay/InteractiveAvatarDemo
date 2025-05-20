"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { StreamingAvatarProvider } from "@/components/logic";

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-950">
      <div className="w-[1350px] flex flex-col items-center justify-center">
        <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
          <InteractiveAvatar />
        </StreamingAvatarProvider>
      </div>
    </div>
  );
}
