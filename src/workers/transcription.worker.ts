import { pipeline } from "@huggingface/transformers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transcriber: any = null;

// Initialize the model on first load
async function loadModel() {
  if (!transcriber) {
    console.log("Loading Whisper model...");
    self.postMessage({ status: "loading", message: "Loading Whisper model..." });

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en",
      {
        // Progress callback to track model download
        progress_callback: (progress: any) => {
          if (progress.status === "progress") {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            self.postMessage({
              status: "progress",
              progress: percent,
              message: `Loading model... ${percent}%`
            });
          }
        }
      }
    );

    console.log("Model loaded successfully");
    self.postMessage({ status: "ready", message: "Model loaded successfully" });
  }
  return transcriber;
}

self.onmessage = async (event: MessageEvent) => {
  const { audio, preload } = event.data;

  // Handle preload request
  if (preload) {
    await loadModel();
    return;
  }

  try {
    const model = await loadModel();

    // Audio is already in the correct format (Float32Array at 16kHz)
    // from the main thread's AudioContext processing
    const result = await model(audio);

    // Send the transcription back to the main thread
    self.postMessage({ status: "complete", text: result.text });
  } catch (error) {
    console.error("Transcription error:", error);
    self.postMessage({
      status: "error",
      error: error instanceof Error ? error.message : "Transcription failed",
    });
  }
};
