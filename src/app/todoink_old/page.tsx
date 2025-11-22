"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { Todo, List, defaultTodos, defaultLists } from "../../data/defaultData";
import { Logo } from "../../components/Logo";
import { MobileSplash } from "../../components/MobileSplash";
import { RecordingLight } from "../../components/RecordingLight";
import { Footer } from "../../components/Footer";

const RECORDING_DELAY_MS = 200;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [currentList, setCurrentList] = useState(1);
  const [recording, setRecording] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingListName, setIsRecordingListName] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const activeButtonIndex = useRef<number>(-1);
  const activeListId = useRef<number | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize from localStorage or default data
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTodos = localStorage.getItem("todos");
        const savedLists = localStorage.getItem("lists");

        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        } else {
          setTodos(defaultTodos);
        }

        if (savedLists) {
          setLists(JSON.parse(savedLists));
        } else {
          setLists(defaultLists);
        }
      } catch {
        // If there's an error, use default data
        setTodos(defaultTodos);
        setLists(defaultLists);
      }
    }
  }, []);

  // Save to localStorage when todos or lists change
  useEffect(() => {
    if (typeof window !== "undefined" && todos.length > 0) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (typeof window !== "undefined" && lists.length > 0) {
      localStorage.setItem("lists", JSON.stringify(lists));
    }
  }, [lists]);

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

            if (isRecordingListName && activeListId.current) {
              updateListName(activeListId.current, text.trim());
            } else if (activeButtonIndex.current !== -1) {
              addOrUpdateTodo(text.trim(), activeButtonIndex.current);
            }

            setRecording(false);
            setIsRecordingListName(false);
            activeButtonIndex.current = -1;
            activeListId.current = null;
          } else if (status === "error") {
            console.error("Transcription error:", error);
            setError(error || "Transcription failed");
            setRecording(false);
            setIsRecordingListName(false);
            activeButtonIndex.current = -1;
            activeListId.current = null;
          }
        };

        // Preload the model immediately
        workerRef.current.postMessage({ preload: true });

        // Request microphone permission on page load
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            // Stop the stream immediately since we only needed permission
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

    // Cleanup worker on unmount
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

  // Filter todos by current list
  const currentTodos = todos.filter((todo) => todo.listId === currentList);
  const currentListName =
    lists.find((list) => list.id === currentList)?.name ||
    `List ${currentList}`;

  const addOrUpdateTodo = (text: string, index: number) => {
    setTodos((prev) => {
      const currentListTodos = prev.filter(
        (todo) => todo.listId === currentList
      );
      const otherTodos = prev.filter((todo) => todo.listId !== currentList);

      // If there's an existing todo at this position, update it
      if (index < currentListTodos.length) {
        return [
          ...otherTodos,
          ...currentListTodos.map((todo, i) =>
            i === index ? { ...todo, text, completed: false } : todo
          ),
        ];
      }

      // If it's a new position, add it to the end of current list's todos
      return [
        ...prev,
        {
          id: Date.now(),
          text,
          completed: false,
          listId: currentList,
        },
      ];
    });
  };

  const handleButtonClick = (index: number) => {
    playClickSound();
    const todoIndex = currentTodos[index]?.id;
    if (todoIndex) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoIndex ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  };

  const handleButtonDoubleClick = (index: number) => {
    playClickSound();
    const todoIndex = currentTodos[index]?.id;
    if (todoIndex) {
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.id !== todoIndex)
      );
    }
  };

  const updateListName = (listId: number, newName: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  };

  const startRecording = async (forListName: boolean = false) => {
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

          // Decode audio using AudioContext (available in main thread)
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Get audio data as Float32Array
          let audio: Float32Array;
          if (audioBuffer.numberOfChannels === 2) {
            // Convert stereo to mono by averaging channels
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            audio = new Float32Array(left.length);
            for (let i = 0; i < left.length; i++) {
              audio[i] = (left[i] + right[i]) / 2;
            }
          } else {
            // Already mono
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
          setIsRecordingListName(false);
          activeButtonIndex.current = -1;
          activeListId.current = null;
        }
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);
      if (forListName) {
        setIsRecordingListName(true);
      }
    } catch (error) {
      console.error("Recording error:", error);
      setError("Could not access microphone");
      setRecording(false);
      setIsRecordingListName(false);
      activeButtonIndex.current = -1;
      activeListId.current = null;
    }
  };

  const handleButtonPress = (index: number) => {
    activeButtonIndex.current = index;
    pressTimer.current = setTimeout(() => {
      startRecording(false);
    }, RECORDING_DELAY_MS);
  };

  const handleButtonRelease = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (recording && mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleListChange = (listId: number) => {
    playClickSound();
    setCurrentList(listId);
    setError(null);
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
      if (mediaRecorder.current) {
        mediaRecorder.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className={styles.main}>
      <MobileSplash />

      <div className={styles.navbar}>
        <Logo />
      </div>
      <h1 className={styles.mainTitle}>E-Ink Todo List</h1>

      <div>
        {/* Device Frame */}
        <div className={styles.deviceFrame}>
          {/* Side Buttons */}
          <div className={styles.leftFrame}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.buttonWrapper}>
                <button
                  onClick={() => handleButtonClick(i)}
                  onDoubleClick={() => handleButtonDoubleClick(i)}
                  onMouseDown={() => handleButtonPress(i)}
                  onMouseUp={handleButtonRelease}
                  onMouseLeave={handleButtonRelease}
                  className={styles.physicalButton}
                  aria-label={`Task ${i + 1} button`}
                  data-tooltip={`- Hold and speak to add/edit\n- Double click to delete\n- Single click to check/uncheck`}
                />
              </div>
            ))}
          </div>

          {/* Recording Light */}
          <RecordingLight recording={recording} isBlinking={isBlinking} />

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* E-ink Display Container */}
            <div className={styles.displayContainer}>
              {/* E-ink display */}
              <div className={styles.einkDisplay}>
                <h1 className={styles.listTitle}>{currentListName}</h1>
                {/* Todo items */}
                {currentTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`${styles.todoItem} ${
                      todo.completed ? styles.completed : ""
                    }`}
                  >
                    {todo.text || "Empty item..."}
                  </div>
                ))}
              </div>

              {/* Summary bar */}
              <div className={styles.summaryBar}>
                {currentTodos.filter((todo) => todo.completed).length} of{" "}
                {currentTodos.length} items completed
              </div>
            </div>
          </div>

          {/* Bottom Frame with Buttons */}
          <div className={styles.bottomButtons}>
            <button
              onClick={() =>
                handleListChange(
                  currentList > 1 ? currentList - 1 : lists.length
                )
              }
              className={styles.arrowButton}
              aria-label="Previous list"
              data-tooltip="Click to switch to previous list"
            >
              ←
            </button>
            <button
              onClick={() =>
                handleListChange(
                  currentList < lists.length ? currentList + 1 : 1
                )
              }
              className={styles.arrowButton}
              aria-label="Next list"
              data-tooltip="Click to switch to next list"
            >
              →
            </button>
          </div>

          {(recording || error || modelLoading) && (
            <div
              className={`fixed top-4 right-4 px-4 py-2 rounded ${
                error
                  ? "bg-red-500"
                  : modelLoading
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              } text-white shadow-lg min-w-[200px]`}
            >
              <div>
                {error ||
                  (modelLoading
                    ? `Loading AI model... ${loadingProgress}%`
                    : isRecordingListName
                    ? "Recording list name..."
                    : "Recording...")}
              </div>
              {modelLoading && !error && (
                <div className="mt-2 w-full bg-white/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {modelReady && !recording && !error && (
            <div className="fixed top-4 right-4 px-4 py-2 rounded bg-green-500 text-white shadow-lg animate-pulse">
              Ready to record!
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
