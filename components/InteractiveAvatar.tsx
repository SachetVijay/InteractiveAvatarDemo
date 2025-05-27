import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import logo from "../public/logo.svg";

import { Button } from "./Button";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

// ⏱️ Fixed session duration (2 minutes)
const SESSION_DURATION_MS = 2 * 60 * 1000;

declare global {
  interface Window {
    datafast?: {
      track: (event: string, metadata?: Record<string, any>) => void;
    };
  }
}

function InteractiveAvatar({ turnstileToken }: { turnstileToken: string }) {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const mediaStream = useRef<HTMLVideoElement>(null);

  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"hi" | "en" | null>(null);

  const getAvatarConfig = (): StartAvatarRequest => ({
    quality: AvatarQuality.High,
    avatarName: "Ann_Therapist_public",
    knowledgeId: "9ec7cfe8b1c34f29ac5a45acb3e26deb",
    voice: {
      rate: 1.0,
      emotion: VoiceEmotion.EXCITED,
      model: ElevenLabsModel.eleven_flash_v2_5,
    },
    language: selectedLanguage ?? "en", // fallback just in case
    voiceChatTransport: VoiceChatTransport.LIVEKIT,
    sttSettings: {
      provider: STTProvider.DEEPGRAM,
    },
  });

  const trackEvent = (event: string, metadata?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.datafast?.track) {
      window.datafast.track(event, metadata);
    }
  };

  // Get token from API
  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "cf-turnstile-response": turnstileToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Token fetch error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Failed to get access token: ${errorText}`);
      }
      const token = await response.text();

      console.log("Successfully received token");

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  // Start session + timer
  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      trackEvent("avatar_session_start", {
        language: selectedLanguage,
        type: isVoiceChat ? "voice" : "text", // 📊
      });

      console.log("Starting session...");
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });

      await startAvatar(getAvatarConfig());

      if (isVoiceChat) {
        await startVoiceChat();
      }

      const timeout = setTimeout(() => {
        stopAvatar();
        setShowModal(true);
        trackEvent("avatar_session_end", { language: selectedLanguage }); // 📊
      }, SESSION_DURATION_MS);

      setSessionTimeout(timeout);
    } catch (error) {
      console.error("Error starting avatar session:", error);
      alert("Failed to start session. Please check the console for details.");
    }
  });

  // Clean up session and timer
  useUnmount(() => {
    stopAvatar();
    if (sessionTimeout) clearTimeout(sessionTimeout);
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <img alt="logo" className="w-auto h-8 mb-4" src={logo.src} />
              <h2 className="text-2xl font-semibold text-white">
                Onboarding by Interactive Avatar
              </h2>
              <p className="text-zinc-400 text-center">
                Start a conversation with Ann, your Onboarding Assistant
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <>
              {!selectedLanguage ? (
                <div className="flex flex-col gap-3 text-white items-center">
                  <p className="text-lg">Choose a language to continue:</p>
                  <div className="flex flex-row gap-4">
                    <Button
                      onClick={() => {
                        setSelectedLanguage("en");
                        trackEvent("language_selected", { language: "en" });
                      }}
                    >
                      English
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedLanguage("hi");
                        trackEvent("language_selected", { language: "hi" });
                      }}
                    >
                      हिन्दी
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-4">
                  <Button onClick={() => startSessionV2(true)}>Start Voice Chat</Button>
                  <Button onClick={() => startSessionV2(false)}>Start Text Chat</Button>
                </div>
              )}
            </>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>

      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}

      {/* 🪟 Modal after session ends */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4 text-black">
              Your session has ended
            </h3>
            <p className="mb-6 text-zinc-700">
              Thank you for speaking with Ann. If you’d like to continue,
              schedule a call with Abhishek.
            </p>
            <a
              href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2fHa3EsJRXhs1oZjgk3bj16fUy1rm4qTW0cJa1iy7aMhQv9jp05pyy8M8yykPnNbEuULZqWpvL" // 🔗 Replace with real link
              rel="noopener noreferrer"
              target="_blank"
              onClick={() => trackEvent("schedule_call_click")}
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Schedule a Call with Abhishek
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveAvatar;
