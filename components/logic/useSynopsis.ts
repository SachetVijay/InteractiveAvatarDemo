import { useState, useEffect, useRef } from "react";
import { useStreamingAvatarContext } from "./context";
import { useDebounceFn } from "ahooks";

export const useSynopsis = () => {
    const { messages, sessionState } = useStreamingAvatarContext();
    const [synopsis, setSynopsis] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const previousMessagesLength = useRef(0);

    const generateSynopsis = async () => {
        if (messages.length === 0 || messages.length === previousMessagesLength.current) return;

        // Only generate if we have new messages and enough context (e.g., at least 2 messages)
        if (messages.length < 2) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/generate-synopsis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages,
                    currentSynopsis: synopsis,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.synopsis && Array.isArray(data.synopsis)) {
                    setSynopsis(data.synopsis);
                    previousMessagesLength.current = messages.length;
                }
            }
        } catch (error) {
            console.error("Failed to generate synopsis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const { run: debouncedGenerate } = useDebounceFn(generateSynopsis, {
        wait: 2000, // Wait 2 seconds after the last message update
    });

    useEffect(() => {
        if (sessionState === "inactive") {
            setSynopsis([]);
            previousMessagesLength.current = 0;
        } else {
            debouncedGenerate();
        }
    }, [messages, sessionState, debouncedGenerate]);

    return { synopsis, isLoading };
};
