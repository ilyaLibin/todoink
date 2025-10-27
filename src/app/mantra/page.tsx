"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { MantraIdea } from "../../data/mantraData";

export default function Mantra() {
  const [ideas, setIdeas] = useState<MantraIdea[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sttModelLoading, setSttModelLoading] = useState(true);
  const [llmModelLoading, setLlmModelLoading] = useState(true);
  const [sttProgress, setSttProgress] = useState(0);
  const [llmProgress, setLlmProgress] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const sttWorkerRef = useRef<Worker | null>(null);
  const llmWorkerRef = useRef<Worker | null>(null);

  // Load ideas from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedIdeas = localStorage.getItem("mantraIdeas");
        if (savedIdeas) {
          setIdeas(JSON.parse(savedIdeas));
        }
      } catch {
        // Use empty array on error
        setIdeas([]);
      }
    }
  }, []);

  // Save ideas to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && ideas.length >= 0) {
      localStorage.setItem("mantraIdeas", JSON.stringify(ideas));
    }
  }, [ideas]);

  // Initialize workers
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize STT worker
      sttWorkerRef.current = new Worker(
        new URL("../../workers/transcription.worker.ts", import.meta.url)
      );

      sttWorkerRef.current.onmessage = (event: MessageEvent) => {
        const { status, text, error, message, progress } = event.data;

        if (status === "loading") {
          console.log("STT:", message);
          setSttModelLoading(true);
        } else if (status === "progress") {
          setSttProgress(progress || 0);
        } else if (status === "ready") {
          console.log("STT:", message);
          setSttModelLoading(false);
          setSttProgress(100);
        } else if (status === "complete" && text) {
          console.log("Transcription complete:", text);
          setTranscribing(false);
          // Send transcription to LLM worker
          if (llmWorkerRef.current) {
            setProcessing(true);
            llmWorkerRef.current.postMessage({ transcription: text.trim() });
          }
        } else if (status === "error") {
          console.error("STT error:", error);
          setError(error || "Transcription failed");
          setRecording(false);
          setTranscribing(false);
        }
      };

      // Initialize LLM worker
      llmWorkerRef.current = new Worker(
        new URL("../../workers/llm.worker.ts", import.meta.url)
      );

      llmWorkerRef.current.onmessage = (event: MessageEvent) => {
        const { status, message, progress, shortSummary, fullDescription, error } =
          event.data;

        if (status === "loading") {
          console.log("LLM:", message);
          setLlmModelLoading(true);
        } else if (status === "progress") {
          setLlmProgress(progress || 0);
        } else if (status === "ready") {
          console.log("LLM:", message);
          setLlmModelLoading(false);
          setLlmProgress(100);
        } else if (status === "processing") {
          console.log("LLM:", message);
        } else if (status === "complete" && shortSummary && fullDescription) {
          console.log("Idea extraction complete");
          setProcessing(false);

          // Add new idea
          const newIdea: MantraIdea = {
            id: Date.now(),
            shortSummary,
            fullDescription,
            transcription: fullDescription, // Store the full description as transcription reference
            timestamp: Date.now(),
            expanded: false,
          };

          setIdeas((prev) => [newIdea, ...prev]);
        } else if (status === "error") {
          console.error("LLM error:", error);
          setError(error || "Failed to extract ideas");
          setProcessing(false);
        }
      };

      // Preload both models
      sttWorkerRef.current.postMessage({ preload: true });
      llmWorkerRef.current.postMessage({ preload: true });

      // Request microphone permission
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((error) => {
          console.error("Microphone permission denied:", error);
          setError("Microphone access is required");
        });
    }

    return () => {
      if (sttWorkerRef.current) sttWorkerRef.current.terminate();
      if (llmWorkerRef.current) llmWorkerRef.current.terminate();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = [];

        try {
          if (!sttWorkerRef.current) {
            throw new Error("STT Worker not initialized");
          }

          setTranscribing(true);

          // Process audio
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          let audio: Float32Array;
          if (audioBuffer.numberOfChannels === 2) {
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            audio = new Float32Array(left.length);
            for (let i = 0; i < left.length; i++) {
              audio[i] = (left[i] + right[i]) / 2;
            }
          } else {
            audio = audioBuffer.getChannelData(0);
          }

          // Send to STT worker
          sttWorkerRef.current.postMessage({ audio: audio }, [audio.buffer]);
        } catch (error) {
          console.error("Audio processing error:", error);
          setError(
            error instanceof Error ? error.message : "Audio processing failed"
          );
          setTranscribing(false);
        }
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      setError("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (recording && mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const toggleExpanded = (id: number) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, expanded: !idea.expanded } : idea
      )
    );
  };

  const deleteIdea = (id: number) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isLoading = sttModelLoading || llmModelLoading;
  const overallProgress = (sttProgress + llmProgress) / 2;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mantra</h1>
        <p className={styles.subtitle}>Capture and distill your ideas</p>
      </header>

      {/* Record Button */}
      <div className={styles.recordSection}>
        <button
          className={`${styles.recordButton} ${
            recording ? styles.recording : ""
          }`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          disabled={isLoading || transcribing || processing}
        >
          {recording
            ? "Recording..."
            : transcribing
            ? "Transcribing..."
            : processing
            ? "Processing..."
            : isLoading
            ? `Loading... ${Math.round(overallProgress)}%`
            : "Hold to Record"}
        </button>
        <p className={styles.instruction}>
          Hold the button and speak your idea
        </p>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <div className={styles.loadingBar}>
          <div
            className={styles.loadingProgress}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Ideas List */}
      <div className={styles.ideasList}>
        {ideas.length === 0 ? (
          <p className={styles.emptyState}>
            No ideas yet. Record your first thought.
          </p>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className={styles.ideaCard}>
              <div className={styles.ideaHeader}>
                <p
                  className={styles.shortSummary}
                  onClick={() => toggleExpanded(idea.id)}
                >
                  {idea.shortSummary}
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => deleteIdea(idea.id)}
                  aria-label="Delete idea"
                >
                  ×
                </button>
              </div>

              {idea.expanded && (
                <div className={styles.fullDescription}>
                  {idea.fullDescription}
                </div>
              )}

              <div className={styles.ideaFooter}>
                <span className={styles.timestamp}>
                  {new Date(idea.timestamp).toLocaleDateString()}
                </span>
                <button
                  className={styles.expandButton}
                  onClick={() => toggleExpanded(idea.id)}
                >
                  {idea.expanded ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
