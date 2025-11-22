import { CreateMLCEngine, MLCEngineInterface } from "@mlc-ai/web-llm";

let engine: MLCEngineInterface | null = null;
let isInitializing = false;

// Initialize the LLM engine
async function initializeLLM() {
  if (engine || isInitializing) return;

  isInitializing = true;

  try {
    self.postMessage({
      status: "loading",
      message: "Loading language model...",
    });

    engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f32_1-MLC", {
      initProgressCallback: (progress) => {
        self.postMessage({
          status: "progress",
          progress: Math.round(progress.progress * 100),
        });
      },
    });

    self.postMessage({
      status: "ready",
      message: "Language model ready!",
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      error: error instanceof Error ? error.message : "Failed to load model",
    });
  } finally {
    isInitializing = false;
  }
}

// Extract ideas from transcription
async function extractIdeas(transcription: string) {
  if (!engine) {
    throw new Error("LLM engine not initialized");
  }

  try {
    self.postMessage({
      status: "processing",
      message: "Analyzing your idea...",
    });

    const prompt = `You are an assistant that extracts and refines key ideas from voice transcriptions.

Your task:
Write a main sentance of this issey and explain the main idea in your own words
Write a title the main idea of it up to 10 words

Voice transcription: "${transcription}"

Respond ONLY with this exact JSON format, nothing else:
{"shortSummary": "core idea in max 10 words", "fullDescription": "clear explanation in 2-4 sentences"}`;

    const reply = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = reply.choices[0]?.message?.content || "";

    // Try to parse JSON response
    let result;
    try {
      // Extract JSON from response if it contains extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // Fallback: create a simple summary if JSON parsing fails
      result = {
        shortSummary: transcription.split(" ").slice(0, 10).join(" "),
        fullDescription: transcription,
      };
    }

    self.postMessage({
      status: "complete",
      shortSummary: result.shortSummary,
      fullDescription: result.fullDescription,
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      error: error instanceof Error ? error.message : "Failed to extract ideas",
    });
  }
}

// Handle messages from main thread
self.addEventListener("message", async (event: MessageEvent) => {
  const { preload, transcription } = event.data;

  if (preload) {
    await initializeLLM();
  } else if (transcription) {
    await extractIdeas(transcription);
  }
});
