import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error("GOOGLE_API_KEY is missing");
        return new Response("Google API Key is missing", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const { messages, currentSynopsis } = await req.json();
        console.log("Received synopsis request. Messages count:", messages?.length);

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid messages format", { status: 400 });
        }

        const prompt = `
    You are a helpful assistant that summarizes conversations in real-time.
    Your task is to generate a concise, bulleted synopsis of the conversation so far.
    
    Rules:
    - Keep the synopsis to a maximum of 5-7 bullet points.
    - If the conversation is just starting, provide a brief context.
    - Update the existing synopsis based on the new messages.
    - Use clear and professional language.
    - Return ONLY the bullet points, one per line, starting with "- ".

    Current Synopsis:
    ${currentSynopsis ? currentSynopsis.join("\n") : "None"}

    New Messages:
    ${messages.map((m: any) => `${m.sender}: ${m.content}`).join("\n")}

    Please update the synopsis.
    `;

        console.log("Calling Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini response:", text);
        const bulletPoints = text
            ?.split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.trim().substring(2));

        return new Response(JSON.stringify({ synopsis: bulletPoints }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error generating synopsis:", error);
        return new Response("Failed to generate synopsis", { status: 500 });
    }
}
