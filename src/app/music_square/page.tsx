"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./page.module.css";

interface Box {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isPlaying: boolean;
  isBlinking: boolean;
}

const CANVAS_WIDTH = 800; // 4:3 landscape ratio (1.5x smaller)
const CANVAS_HEIGHT = 600;
const BOX_SIZE = 40;
const PLAYHEAD_SPEED = 1.0; // pixels per frame (adjusted for smaller canvas)
const LED_HEIGHT = 30;
const NUM_LEDS = 60;
const MIN_FREQ = 200;
const MAX_FREQ = 800;

// Musical notes and their frequencies
const NOTES = [
  { name: "C3", freq: 130.81 },
  { name: "D3", freq: 146.83 },
  { name: "E3", freq: 164.81 },
  { name: "F3", freq: 174.61 },
  { name: "G3", freq: 196.00 },
  { name: "A3", freq: 220.00 },
  { name: "B3", freq: 246.94 },
  { name: "C4", freq: 261.63 },
  { name: "D4", freq: 293.66 },
  { name: "E4", freq: 329.63 },
  { name: "F4", freq: 349.23 },
  { name: "G4", freq: 392.00 },
  { name: "A4", freq: 440.00 },
  { name: "B4", freq: 493.88 },
  { name: "C5", freq: 523.25 },
  { name: "D5", freq: 587.33 },
  { name: "E5", freq: 659.25 },
  { name: "F5", freq: 698.46 },
  { name: "G5", freq: 783.99 },
];

export default function MusicSquare() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [playheadX, setPlayheadX] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [instrument, setInstrument] = useState<"bell" | "chime" | "marimba">("bell");
  const [reverbAmount, setReverbAmount] = useState(0.5);
  const [noteDuration, setNoteDuration] = useState(1.5);
  const draggedBoxRef = useRef<number | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Initialize boxes with random positions
  useEffect(() => {
    const colors = [
      "#ff6b6b", "#f9ca24", "#f0932b", "#6ab04c", "#4ecdc4",
      "#45b7d1", "#a29bfe", "#fd79a8", "#ff85a2", "#ffd93d",
      "#ff6b6b", "#f9ca24", "#f0932b", "#6ab04c", "#4ecdc4",
      "#45b7d1", "#a29bfe", "#fd79a8", "#ff85a2", "#ffd93d"
    ];

    // Filter notes within the frequency range
    const availableNotes = NOTES.filter(note => note.freq >= MIN_FREQ && note.freq <= MAX_FREQ);

    const initialBoxes: Box[] = Array.from({ length: 20 }, (_, i) => {
      // Pick a random note
      const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];

      // Calculate Y position for this note
      const normalizedFreq = (randomNote.freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
      const noteY = (1 - normalizedFreq) * (CANVAS_HEIGHT - LED_HEIGHT - BOX_SIZE);

      return {
        id: i,
        x: Math.random() * (CANVAS_WIDTH - BOX_SIZE),
        y: noteY,
        width: BOX_SIZE,
        height: BOX_SIZE,
        color: colors[i],
        isPlaying: false,
        isBlinking: false,
      };
    });

    setBoxes(initialBoxes);
  }, []);

  // Play note based on Y position
  const playNote = (box: Box) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;

    // Map Y position to frequency (higher on canvas = higher pitch)
    const normalizedY = 1 - (box.y / (CANVAS_HEIGHT - LED_HEIGHT - BOX_SIZE));
    const frequency = MIN_FREQ + (normalizedY * (MAX_FREQ - MIN_FREQ));

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configure instrument preset
    let waveType: OscillatorType = "sine";
    let filterFreq = frequency * 2;
    let filterQ = 1;
    let attack = 0.01;
    let release = noteDuration;

    if (instrument === "bell") {
      waveType = "sine";
      filterFreq = frequency * 8;
      filterQ = 2;
      attack = 0.001;
      release = noteDuration * 0.8;
    } else if (instrument === "chime") {
      waveType = "triangle";
      filterFreq = frequency * 10;
      filterQ = 4;
      attack = 0.001;
      release = noteDuration * 1.2;
    } else if (instrument === "marimba") {
      waveType = "sine";
      filterFreq = frequency * 5;
      filterQ = 1.5;
      attack = 0.002;
      release = noteDuration * 0.6;
    }

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    // Create reverb using multiple delays
    const delay1 = ctx.createDelay();
    const delay2 = ctx.createDelay();
    const delay3 = ctx.createDelay();
    const delay4 = ctx.createDelay();
    const delay5 = ctx.createDelay();
    const delay6 = ctx.createDelay();

    const delayGain1 = ctx.createGain();
    const delayGain2 = ctx.createGain();
    const delayGain3 = ctx.createGain();
    const delayGain4 = ctx.createGain();
    const delayGain5 = ctx.createGain();
    const delayGain6 = ctx.createGain();

    delay1.delayTime.value = 0.05;
    delay2.delayTime.value = 0.08;
    delay3.delayTime.value = 0.12;
    delay4.delayTime.value = 0.18;
    delay5.delayTime.value = 0.25;
    delay6.delayTime.value = 0.35;

    // Scale reverb by reverbAmount
    delayGain1.gain.value = 0.5 * reverbAmount;
    delayGain2.gain.value = 0.4 * reverbAmount;
    delayGain3.gain.value = 0.35 * reverbAmount;
    delayGain4.gain.value = 0.3 * reverbAmount;
    delayGain5.gain.value = 0.25 * reverbAmount;
    delayGain6.gain.value = 0.2 * reverbAmount;

    oscillator.type = waveType;
    oscillator.frequency.value = frequency;

    // Envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + attack + release);

    // Connect through filter first
    oscillator.connect(filter);
    filter.connect(gainNode);

    // Dry signal
    gainNode.connect(ctx.destination);

    // Wet signals (reverb)
    gainNode.connect(delay1);
    delay1.connect(delayGain1);
    delayGain1.connect(ctx.destination);

    gainNode.connect(delay2);
    delay2.connect(delayGain2);
    delayGain2.connect(ctx.destination);

    gainNode.connect(delay3);
    delay3.connect(delayGain3);
    delayGain3.connect(ctx.destination);

    gainNode.connect(delay4);
    delay4.connect(delayGain4);
    delayGain4.connect(ctx.destination);

    gainNode.connect(delay5);
    delay5.connect(delayGain5);
    delayGain5.connect(ctx.destination);

    gainNode.connect(delay6);
    delay6.connect(delayGain6);
    delayGain6.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + attack + release);
  };

  // Animation loop (only runs after start and when playing)
  useEffect(() => {
    if (!isStarted || !isPlaying) return;

    let animationFrameId: number;

    const animate = () => {
      setPlayheadX((prev) => {
        const next = prev + PLAYHEAD_SPEED;
        return next > CANVAS_WIDTH ? 0 : next;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isStarted, isPlaying]);

  // Check collisions and trigger sounds
  useEffect(() => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        const isColliding =
          playheadX >= box.x &&
          playheadX <= box.x + box.width;

        // Only trigger on entering the box (transition from not playing to playing)
        if (isColliding && !box.isPlaying) {
          playNote(box);
          return { ...box, isPlaying: true };
        } else if (!isColliding && box.isPlaying) {
          // Stop the glow effect when playhead leaves
          return { ...box, isPlaying: false };
        }
        return box;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playheadX]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid lines
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT - LED_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT - LED_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw note indicators on Y-axis
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    NOTES.forEach((note) => {
      if (note.freq < MIN_FREQ || note.freq > MAX_FREQ) return;

      // Calculate Y position for this frequency
      const normalizedFreq = (note.freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
      const y = (1 - normalizedFreq) * (CANVAS_HEIGHT - LED_HEIGHT - BOX_SIZE);

      // Draw subtle line
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw note name
      ctx.fillStyle = "#555";
      ctx.fillText(note.name, 35, y + 4);
    });

    // Draw boxes
    boxes.forEach((box) => {
      if (box.isPlaying || box.isBlinking) {
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = box.color;
      } else {
        ctx.shadowBlur = 0;
      }

      // Blinking effect - only show every other frame
      const shouldShow = !box.isBlinking || Math.floor(Date.now() / 250) % 2 === 0;
      if (shouldShow) {
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.width, box.height);

        // Border
        ctx.strokeStyle = box.isPlaying ? "#ffffff" : "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }
    });

    ctx.shadowBlur = 0;

    // Draw playhead line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, CANVAS_HEIGHT - LED_HEIGHT);
    ctx.stroke();

    // Draw LED strip at bottom
    const ledWidth = CANVAS_WIDTH / NUM_LEDS;
    for (let i = 0; i < NUM_LEDS; i++) {
      const ledX = i * ledWidth;
      const currentLedIndex = Math.floor((playheadX / CANVAS_WIDTH) * NUM_LEDS);

      if (i === currentLedIndex) {
        ctx.fillStyle = "#00ff00";
      } else {
        ctx.fillStyle = "#1a1a1a";
      }

      ctx.fillRect(ledX, CANVAS_HEIGHT - LED_HEIGHT, ledWidth - 2, LED_HEIGHT);
    }
  }, [boxes, playheadX]);

  // Start button handler
  const handleStart = () => {
    // Initialize AudioContext
    audioContextRef.current = new AudioContext();
    setIsStarted(true);
    setIsPlaying(true);
  };

  // Toggle play/stop
  const togglePlayStop = () => {
    setIsPlaying(!isPlaying);
  };

  // Add new box
  const addNewBox = () => {
    const colors = [
      "#ff6b6b", "#f9ca24", "#f0932b", "#6ab04c", "#4ecdc4",
      "#45b7d1", "#a29bfe", "#fd79a8", "#ff85a2", "#ffd93d"
    ];

    // Filter notes within the frequency range
    const availableNotes = NOTES.filter(note => note.freq >= MIN_FREQ && note.freq <= MAX_FREQ);

    // Pick a random note
    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    // Calculate Y position for this note
    const normalizedFreq = (randomNote.freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
    const noteY = (1 - normalizedFreq) * (CANVAS_HEIGHT - LED_HEIGHT - BOX_SIZE);

    const newBox: Box = {
      id: Date.now(),
      x: Math.random() * (CANVAS_WIDTH - BOX_SIZE),
      y: noteY,
      width: BOX_SIZE,
      height: BOX_SIZE,
      color: colors[Math.floor(Math.random() * colors.length)],
      isPlaying: false,
      isBlinking: true,
    };

    setBoxes((prev) => [...prev, newBox]);

    // Stop blinking after 1 second (2 blinks)
    setTimeout(() => {
      setBoxes((prev) =>
        prev.map((box) =>
          box.id === newBox.id ? { ...box, isBlinking: false } : box
        )
      );
    }, 1000);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBoxIndex = boxes.findIndex(
      (box) =>
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
    );

    if (clickedBoxIndex !== -1) {
      draggedBoxRef.current = clickedBoxIndex;
      offsetRef.current = {
        x: x - boxes[clickedBoxIndex].x,
        y: y - boxes[clickedBoxIndex].y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedBoxRef.current === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBoxes((prevBoxes) =>
      prevBoxes.map((box, index) =>
        index === draggedBoxRef.current
          ? {
              ...box,
              x: Math.max(0, Math.min(CANVAS_WIDTH - box.width, x - offsetRef.current.x)),
              y: Math.max(0, Math.min(CANVAS_HEIGHT - LED_HEIGHT - box.height, y - offsetRef.current.y)),
            }
          : box
      )
    );
  };

  const handleMouseUp = () => {
    draggedBoxRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBoxIndex = boxes.findIndex(
      (box) =>
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
    );

    if (clickedBoxIndex !== -1) {
      setBoxes((prev) => prev.filter((_, index) => index !== clickedBoxIndex));
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.controlsWrapper}>
          <div className={styles.controlSection}>
            <label className={styles.label}>Instrument</label>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.presetButton} ${instrument === "bell" ? styles.active : ""}`}
                onClick={() => setInstrument("bell")}
              >
                Bell
              </button>
              <button
                className={`${styles.presetButton} ${instrument === "chime" ? styles.active : ""}`}
                onClick={() => setInstrument("chime")}
              >
                Chime
              </button>
              <button
                className={`${styles.presetButton} ${instrument === "marimba" ? styles.active : ""}`}
                onClick={() => setInstrument("marimba")}
              >
                Marimba
              </button>
            </div>
          </div>

          <div className={styles.controlSection}>
            <label className={styles.label}>
              Reverb: {Math.round(reverbAmount * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverbAmount}
              onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.controlSection}>
            <label className={styles.label}>
              Duration: {noteDuration.toFixed(1)}s
            </label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={noteDuration}
              onChange={(e) => setNoteDuration(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>

        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={styles.canvas}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleContextMenu}
          />
          {!isStarted && (
            <div className={styles.startOverlay}>
              <button className={styles.startButton} onClick={handleStart}>
                START
              </button>
            </div>
          )}
        </div>

        <div className={styles.canvasControls}>
          <button
            className={styles.canvasControlButton}
            onClick={togglePlayStop}
            disabled={!isStarted}
            title={isPlaying ? "Stop" : "Play"}
          >
            {isPlaying ? "■" : "▶"}
          </button>
          <button
            className={styles.canvasControlButton}
            onClick={addNewBox}
            title="Add Box"
          >
            +
          </button>
        </div>

        <p className={styles.instruction}>
          Drag boxes • Higher = Higher pitch • Right-click to delete
        </p>
      </div>
    </main>
  );
}
