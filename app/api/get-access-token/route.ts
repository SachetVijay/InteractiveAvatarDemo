export async function POST(req: Request) {
  try {
    const { "cf-turnstile-response": turnstileToken } = await req.json();

    if (!turnstileToken) {
      return new Response("Missing Turnstile token", { status: 400 });
    }

    // 🔐 Verify Turnstile token with Cloudflare
    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret:
            process.env.TURNSTILE_SECRET_KEY ||
            "0x4AAAAAABepMC2we5cTlcbYMnNekZ58TnM",
          response: turnstileToken,
        }),
      },
    );

    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success) {
      console.error("Turnstile verification failed:", turnstileData);
      return new Response("Failed bot check", { status: 403 });
    }

    // ✅ Verified — continue to HeyGen token fetch
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing from .env");
    }

    const baseApiUrl = "https://api.heygen.com";

    console.log("Making request to HeyGen API...");
    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_id: "Ann_Therapist_public",
        quality: "high",
        voice_id: "eleven_flash_v2_5",
        language: "en",
      }),
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(`API request failed: ${JSON.stringify(responseData)}`);
    }

    if (!responseData.data?.token) {
      throw new Error("No token received in response");
    }

    return new Response(responseData.data.token, { status: 200 });
  } catch (error) {
    console.error("Detailed error:", error);
    return new Response(
      error instanceof Error ? error.message : "Failed to retrieve access token",
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
