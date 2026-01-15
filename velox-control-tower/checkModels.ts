import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD5tWz-mi37hBWAZdRgkLigKzameLIPIFY"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log("🔍 Scanning for available Gemini models...");
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
    
    // We access the underlying API to list models
    // Note: The SDK doesn't always have a clean 'listModels' helper exposed easily in all versions, 
    // so we will try the simplest fetch if the SDK fails, but let's try the SDK method first if available.
    // Actually, for immediate results, we can just use a standard fetch to the endpoint.
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();

    if (data.models) {
        console.log("\n✅ AVAILABLE MODELS FOR YOU:");
        data.models.forEach((m: any) => {
            if (m.name.includes("1.5")) { // Only show relevant 1.5 models
                console.log(`- ${m.name.replace('models/', '')}`); 
                console.log(`  (Supports: ${m.supportedGenerationMethods.join(', ')})`);
            }
        });
    } else {
        console.error("❌ No models found. Raw response:", data);
    }

  } catch (error) {
    console.error("❌ Error listing models:", error);
  }
}

listModels();