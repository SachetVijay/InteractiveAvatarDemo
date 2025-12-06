const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = "AIzaSyAdz8EXkl00tFcgm7U84HBQw08o0M9m_mo"; // User provided key
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There isn't a direct listModels method on the client instance in some versions, 
    // but let's try to just generate content with a known stable model or check documentation.
    // Actually, the SDK doesn't expose listModels directly in the main helper, 
    // but we can try to use the model we think exists and see if it works locally.
    
    console.log("Trying gemini-1.5-flash...");
    const result1 = await model.generateContent("Hello");
    console.log("gemini-1.5-flash works:", result1.response.text());
  } catch (error) {
    console.error("gemini-1.5-flash failed:", error.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Trying gemini-pro...");
    const result2 = await model2.generateContent("Hello");
    console.log("gemini-pro works:", result2.response.text());
  } catch (error) {
    console.error("gemini-pro failed:", error.message);
  }
}

listModels();
