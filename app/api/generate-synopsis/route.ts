import OpenAI from "openai";

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("OPENAI_API_KEY is missing");
        return new Response("OpenAI API Key is missing", { status: 500 });
    }

    const openai = new OpenAI({
        apiKey: apiKey,
    });
    try {
        const { messages, currentSynopsis } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid messages format", { status: 400 });
        }

        const systemPrompt = `
    You are a helpful assistant that summarizes conversations in real-time.
    Your task is to generate a concise, bulleted synopsis of the conversation so far.
    
    Rules:
    - Keep the synopsis to a maximum of 5-7 bullet points.
    - If the conversation is just starting, provide a brief context.
    - Update the existing synopsis based on the new messages.
    - Use clear and professional language.
    - Return ONLY the bullet points, one per line, starting with "- ".
    `;

        const userPrompt = `
    Current Synopsis:
    ${currentSynopsis ? currentSynopsis.join("\n") : "None"}

    New Messages:
    ${messages.map((m: any) => `${m.sender}: ${m.content}`).join("\n")}

    Please update the synopsis.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });

        const result = completion.choices[0].message.content;
        const bulletPoints = result
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
