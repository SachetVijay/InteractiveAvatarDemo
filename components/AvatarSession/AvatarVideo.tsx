import React, { forwardRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

interface AvatarVideoProps {
  onStop: () => void;
}

export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
  ({ onStop }, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <>
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-3 left-3 bg-black text-white rounded-lg px-3 py-2">
          Connection Quality: {connectionQuality}
        </div>
      )}
      {isLoaded && (
        <Button
          className="absolute top-3 right-3 !p-2 bg-zinc-700 bg-opacity-50 z-10"
          onClick={() => {
            stopAvatar();
            onStop();
          }}
        >
          <CloseIcon />
        </Button>
      )}
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      >
        <track kind="captions" />
      </video>
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
          Loading...
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
