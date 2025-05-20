export async function POST() {
  try {
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Required parameters for the streaming token
        avatar_id: "Ann_Therapist_public",
        quality: "high",
        voice_id: "eleven_flash_v2_5",
        language: "en"
      })
    });

    const responseData = await res.json();
    console.log("API Response:", {
      status: res.status,
      statusText: res.statusText,
      data: responseData
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${JSON.stringify(responseData)}`);
    }

    if (!responseData.data?.token) {
      throw new Error("No token received in response");
    }

    return new Response(responseData.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    return new Response(
      error instanceof Error ? error.message : "Failed to retrieve access token", 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
