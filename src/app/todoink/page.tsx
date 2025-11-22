"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
import { Logo } from "../../components/Logo";
import { MobileSplash } from "../../components/MobileSplash";
import { RecordingLight } from "../../components/RecordingLight";
import { Footer } from "../../components/Footer";

const RECORDING_DELAY_MS = 300;
const MAX_RECORDING_MS = 5000;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listName, setListName] = useState("Groceries");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeout = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const isLongPress = useRef(false);
  const shouldMoveCursorToEnd = useRef(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTodos = localStorage.getItem("todoink2_todos");
        const savedListName = localStorage.getItem("todoink2_listName");
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        }
        if (savedListName) {
          setListName(savedListName);
        }
      } catch {
        // Silent error handling
      }
    }
  }, []);

  // Save to localStorage when todos or listName change
  useEffect(() => {
    if (typeof window !== "undefined" && todos.length > 0) {
      localStorage.setItem("todoink2_todos", JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (typeof window !== "undefined" && listName) {
      localStorage.setItem("todoink2_listName", listName);
    }
  }, [listName]);

  // Initialize click sound, transcription worker, and request mic permission
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio("/click.mp3");
        audio.load();
        clickSound.current = audio;

        // Initialize the transcription worker
        workerRef.current = new Worker(
          new URL("../../workers/transcription.worker.ts", import.meta.url)
        );

        // Handle messages from the worker
        workerRef.current.onmessage = (event: MessageEvent) => {
          const { status, text, error, message, progress } = event.data;

          if (status === "loading") {
            console.log(message);
            setModelLoading(true);
            setModelReady(false);
          } else if (status === "progress") {
            setLoadingProgress(progress || 0);
          } else if (status === "ready") {
            console.log(message);
            setModelLoading(false);
            setModelReady(true);
            setLoadingProgress(100);
          } else if (status === "complete" && text) {
            // Trigger double blink animation
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 1000);

            // Add new todo at the end and move cursor to it
            addNewTodo(text.trim());

            setRecording(false);
          } else if (status === "error") {
            console.error("Transcription error:", error);
            setError(error || "Transcription failed");
            setRecording(false);
          }
        };

        // Preload the model immediately
        workerRef.current.postMessage({ preload: true });

        // Request microphone permission on page load
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
          })
          .catch((error) => {
            console.error("Microphone permission denied:", error);
            setError("Microphone access is required for voice recording");
          });
      } catch {
        // Silent error handling
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play click sound function
  const playClickSound = () => {
    if (clickSound.current) {
      try {
        const sound = new Audio("/click.mp3");
        sound.volume = 0.5;
        sound.play().catch(() => {});
      } catch {
        // Silent error handling
      }
    }
  };

  // Add new todo at the end
  const addNewTodo = (text: string) => {
    shouldMoveCursorToEnd.current = true;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        completed: false,
      },
    ]);
  };

  // Toggle completion of todo at cursor
  const toggleTodoAtCursor = () => {
    const todo = todos[cursorIndex];
    if (todo) {
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        )
      );
    }
  };

  // Delete todo at cursor
  const deleteTodoAtCursor = () => {
    const todo = todos[cursorIndex];
    if (todo) {
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== todo.id));
      // Adjust cursor if needed
      if (cursorIndex >= todos.length - 1 && cursorIndex > 0) {
        setCursorIndex(cursorIndex - 1);
      }
    }
  };

  // Navigation handlers
  const handleUp = () => {
    playClickSound();
    setCursorIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleDown = () => {
    playClickSound();
    setCursorIndex((prev) =>
      prev < todos.length - 1 ? prev + 1 : prev
    );
  };

  // Record button handlers
  const handleRecordClick = () => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    playClickSound();
    toggleTodoAtCursor();
  };

  const handleRecordDoubleClick = () => {
    playClickSound();
    deleteTodoAtCursor();
  };

  // Edit mode handlers
  const openEditMode = () => {
    const titleLine = `#${listName}`;
    const todoLines = todos.map((t) => (t.completed ? `[x] ${t.text}` : t.text)).join("\n");
    setEditText(titleLine + (todoLines ? "\n" + todoLines : ""));
    setIsEditMode(true);
  };

  const saveEditMode = () => {
    const lines = editText.split("\n");

    // Parse title from first line if it starts with #
    let newListName = listName;
    let todoLines = lines;

    if (lines[0]?.trim().startsWith("#")) {
      newListName = lines[0].trim().slice(1).trim() || "Groceries";
      todoLines = lines.slice(1);
    }

    // Parse todos from remaining lines
    const newTodos: Todo[] = todoLines
      .filter((line) => line.trim() !== "")
      .map((line, index) => {
        const isCompleted = line.startsWith("[x] ");
        const text = isCompleted ? line.slice(4) : line;
        return {
          id: todos[index]?.id || Date.now() + index,
          text: text.trim(),
          completed: isCompleted,
        };
      });

    setListName(newListName);
    setTodos(newTodos);
    setCursorIndex(0);
    setIsEditMode(false);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
  };

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
          if (!workerRef.current) {
            throw new Error("Worker not initialized");
          }

          // Decode audio using AudioContext
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Get audio data as Float32Array
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

          // Send the processed audio data to the worker
          workerRef.current.postMessage({ audio: audio }, [audio.buffer]);
        } catch (error) {
          console.error("Transcription error:", error);
          setError(
            error instanceof Error ? error.message : "Transcription failed"
          );
          setRecording(false);
        }
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);

      // Auto-stop after MAX_RECORDING_MS
      recordingTimeout.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_MS);
    } catch (error) {
      console.error("Recording error:", error);
      setError("Could not access microphone");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
    }
    if (recording && mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRecordPress = () => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      startRecording();
    }, RECORDING_DELAY_MS);
  };

  const handleRecordRelease = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (recording) {
      stopRecording();
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Hide "Ready to record!" message after 3 seconds
  useEffect(() => {
    if (modelReady && !modelLoading) {
      const timer = setTimeout(() => setModelReady(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [modelReady, modelLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
      if (recordingTimeout.current) {
        clearTimeout(recordingTimeout.current);
      }
      if (mediaRecorder.current) {
        mediaRecorder.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Move cursor to end when new item added, or keep in bounds
  useEffect(() => {
    if (shouldMoveCursorToEnd.current && todos.length > 0) {
      setCursorIndex(todos.length - 1);
      shouldMoveCursorToEnd.current = false;
    } else if (cursorIndex >= todos.length && todos.length > 0) {
      setCursorIndex(todos.length - 1);
    }
  }, [todos.length, cursorIndex]);

  return (
    <main className={styles.main}>
      <MobileSplash />

      <div className={styles.navbar}>
        <Logo />
      </div>
      <h1 className={styles.mainTitle}>E-Ink Todo List</h1>

      <div className={styles.deviceContainer}>
        {/* Legend */}
        <div className={styles.legend}>
          <h2 className={styles.legendTitle}>Controls</h2>
          <ul className={styles.legendList}>
            <li className={styles.legendItem}>
              <span className={styles.legendIcon}>▲</span>
              <div>
                <span className={styles.legendAction}>Up</span>
                <p className={styles.legendDesc}>Move cursor up</p>
              </div>
            </li>
            <li className={styles.legendItem}>
              <span className={styles.legendIcon}>▼</span>
              <div>
                <span className={styles.legendAction}>Down</span>
                <p className={styles.legendDesc}>Move cursor down</p>
              </div>
            </li>
            <li className={styles.legendItem}>
              <span className={styles.legendIcon}>●</span>
              <div>
                <span className={styles.legendAction}>Record</span>
                <p className={styles.legendDesc}>
                  Click: check/uncheck<br />
                  Double: delete<br />
                  Hold: voice input
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Device Frame */}
        <div className={styles.deviceFrame}>
          {/* Recording Light */}
          <RecordingLight recording={recording} isBlinking={isBlinking} />

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* E-ink Display Container */}
            <div
              className={styles.displayContainer}
              onDoubleClick={openEditMode}
            >
              {/* Edit Mode Modal */}
              {isEditMode && (
                <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.editHeader}>
                    <span>Edit List</span>
                    <span className={styles.editHint}>#Title, [x] completed</span>
                  </div>
                  <textarea
                    className={styles.editTextarea}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    placeholder="#List Name&#10;Item 1&#10;[x] Completed item"
                  />
                  <div className={styles.editButtons}>
                    <button
                      className={styles.editButton}
                      onClick={cancelEditMode}
                    >
                      Cancel
                    </button>
                    <button
                      className={`${styles.editButton} ${styles.editButtonPrimary}`}
                      onClick={saveEditMode}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* E-ink display */}
              <div className={styles.einkDisplay}>
                <h1 className={styles.listTitle}>{listName}</h1>
                {/* Todo items */}
                {todos.map((todo, index) => (
                  <div
                    key={todo.id}
                    className={`${styles.todoItem} ${
                      todo.completed ? styles.completed : ""
                    } ${index === cursorIndex ? styles.selected : ""}`}
                  >
                    <span className={styles.cursor}>
                      {index === cursorIndex ? ">" : "\u00A0"}
                    </span>
                    <span className={styles.checkbox}>
                      {todo.completed ? "☑" : "☐"}
                    </span>
                    <span className={styles.todoText}>
                      {todo.text || "Empty item..."}
                    </span>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className={styles.emptyState}>
                    No items yet. Hold the record button to add one.
                  </div>
                )}
              </div>

              {/* Summary bar */}
              <div className={styles.summaryBar}>
                {todos.filter((todo) => todo.completed).length} of{" "}
                {todos.length} completed
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className={styles.bottomButtons}>
            <button
              onClick={handleUp}
              className={styles.controlButton}
              aria-label="Move cursor up"
              data-tooltip="Move up"
            >
              ▲
            </button>
            <button
              onClick={handleRecordClick}
              onDoubleClick={handleRecordDoubleClick}
              onMouseDown={handleRecordPress}
              onMouseUp={handleRecordRelease}
              onMouseLeave={handleRecordRelease}
              onTouchStart={handleRecordPress}
              onTouchEnd={handleRecordRelease}
              className={`${styles.controlButton} ${styles.recordButton} ${
                recording ? styles.recording : ""
              }`}
              aria-label="Record or toggle"
              data-tooltip="Click: check/uncheck | Double: delete | Hold: record"
            >
              ●
            </button>
            <button
              onClick={handleDown}
              className={styles.controlButton}
              aria-label="Move cursor down"
              data-tooltip="Move down"
            >
              ▼
            </button>
          </div>

          {(recording || error || modelLoading) && (
            <div
              className={`${styles.statusBadge} ${
                error
                  ? styles.statusError
                  : modelLoading
                  ? styles.statusLoading
                  : styles.statusRecording
              }`}
            >
              <div>
                {error ||
                  (modelLoading
                    ? `Loading AI... ${loadingProgress}%`
                    : "Recording...")}
              </div>
              {modelLoading && !error && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {modelReady && !recording && !error && (
            <div className={styles.statusReady}>Ready to record!</div>
          )}
        </div>
      </div>

      {/* Mocks Gallery Section */}
      <section className={styles.mocksSection}>
        <h2 className={styles.mocksTitle}>Product Mocks</h2>
        <div className={styles.mocksGallery}>
          <div className={styles.mockItem}>
            <img
              src="/groceries_fridge.jpg"
              alt="E-ink grocery list on fridge"
              className={styles.mockImage}
            />
          </div>
          <div className={styles.mockItem}>
            <img
              src="/mock_desk.jpg"
              alt="E-ink todo list on desk"
              className={styles.mockImage}
            />
          </div>
          <div className={styles.mockItem}>
            <img
              src="/groceries_work.jpg"
              alt="E-ink todo list on desk"
              className={styles.mockImage}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
