import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPause,
  FiPlay,
  FiRefreshCcw,
  FiSquare,
  FiVolume2,
  FiVolumeX,
  FiZap,
  FiArrowLeft,
  FiGift,
  FiCopy,
  FiShare2,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CompletionScreen from "../components/CompletionScreen";
import { getTodayProgress, recordBreathingToday } from "../utils/dailyProgress";
import { isPremium, PREMIUM_MESSAGE } from "../utils/plan";
import { toast } from "react-hot-toast";
import { playBell } from "../utils/audioUtils";
import {
  completeBreathingSession,
  getBreathingHistory,
  startBreathingSession,
} from "../Api/breathingApi";

const presets = {
  triangle: [
    {
      label: "4-7-8",
      displayTechnique: "4-7-8 Breathing",
      apiTechniqueCandidates: ["4-7-8", "4-7-8 Breathing", "triangle", "Triangle"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Hold", seconds: 7 },
        { name: "Exhale", seconds: 8 },
      ],
    },
    {
      label: "4-4-8",
      displayTechnique: "4-4-8 Breathing",
      apiTechniqueCandidates: ["4-4-8", "4-4-8 Breathing", "triangle", "Triangle"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Hold", seconds: 4 },
        { name: "Exhale", seconds: 8 },
      ],
    },
    {
      label: "5-2-7",
      displayTechnique: "5-2-7 Breathing",
      apiTechniqueCandidates: ["5-2-7", "5-2-7 Breathing", "triangle", "Triangle"],
      phases: [
        { name: "Inhale", seconds: 5 },
        { name: "Hold", seconds: 2 },
        { name: "Exhale", seconds: 7 },
      ],
    },
  ],
  box: [
    {
      label: "4-4-4-4",
      displayTechnique: "4-4-4-4 Box Breathing",
      apiTechniqueCandidates: ["4-4-4-4", "4-4-4-4 Breathing", "box", "Box"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Hold", seconds: 4 },
        { name: "Exhale", seconds: 4 },
        { name: "Hold", seconds: 4 },
      ],
    },
    {
      label: "5-2-7-2",
      displayTechnique: "5-2-7-2 Box Breathing",
      apiTechniqueCandidates: ["5-2-7-2", "5-2-7-2 Breathing", "box", "Box"],
      phases: [
        { name: "Inhale", seconds: 5 },
        { name: "Hold", seconds: 2 },
        { name: "Exhale", seconds: 7 },
        { name: "Hold", seconds: 2 },
      ],
    },
    {
      label: "4-4-6-2",
      displayTechnique: "4-4-6-2 Box Breathing",
      apiTechniqueCandidates: ["4-4-6-2", "4-4-6-2 Breathing", "box", "Box"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Hold", seconds: 4 },
        { name: "Exhale", seconds: 6 },
        { name: "Hold", seconds: 2 },
      ],
    },
  ],
  circle: [
    {
      label: "4-4",
      displayTechnique: "4-4 Breathing",
      apiTechniqueCandidates: ["4-4", "4-4 Breathing", "circle", "Circle"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Exhale", seconds: 4 },
      ],
    },
    {
      label: "5-7",
      displayTechnique: "5-7 Breathing",
      apiTechniqueCandidates: ["5-7", "5-7 Breathing", "circle", "Circle"],
      phases: [
        { name: "Inhale", seconds: 5 },
        { name: "Exhale", seconds: 7 },
      ],
    },
    {
      label: "4-6",
      displayTechnique: "4-6 Breathing",
      apiTechniqueCandidates: ["4-6", "4-6 Breathing", "circle", "Circle"],
      phases: [
        { name: "Inhale", seconds: 4 },
        { name: "Exhale", seconds: 6 },
      ],
    },
  ],
};

const techniques = {
  triangle: {
    label: "Triangle",
    shape: "triangle",
  },
  box: {
    label: "Box",
    shape: "box",
  },
  circle: {
    label: "Circle",
    shape: "circle",
  },
};


const durations = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const getResponsePayload = (response) => response?.data?.data || response?.data || {};

const getSessionId = (response) => {
  const payload = getResponsePayload(response);
  return payload.sessionId || payload.id || payload._id || payload.session?._id || payload.session?.id || null;
};

const startSessionWithTechniqueFallback = async (config, durationSeconds) => {
  let lastError;

  for (const technique of config.apiTechniqueCandidates) {
    try {
      return await startBreathingSession({
        technique,
        shape: config.shape,
        durationSeconds,
        startedBy: "manual",
      });
    } catch (error) {
      lastError = error;
      const message = error?.response?.data?.message || "";
      const isTechniqueEnumError = message.toLowerCase().includes("technique");

      if (!isTechniqueEnumError) {
        throw error;
      }
    }
  }

  throw lastError;
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(Math.max(0, seconds % 60)).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const calculateCompletedCycles = (seconds, durationSeconds, cycleSeconds, totalCycles) => {
  if (seconds >= durationSeconds) return totalCycles;
  return Math.min(totalCycles, Math.floor(seconds / cycleSeconds));
};

const isLocalSession = (id) => typeof id === "string" && id.startsWith("local-");

const playBeep = (frequency = 440, duration = 0.15) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors if restricted
  }
};

const triggerVibrate = (pattern = 100) => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Ignore vibration errors
  }
};

const ProgressShape = ({
  shape,
  progress,
  strokeWidth = 7,
  trackColor = "#e4ecdf",
  progressColor = "#7d9667",
  className = "absolute inset-0 w-full h-full",
  showBall = false,
}) => {
  const pathRef = useRef(null);
  const [totalLength, setTotalLength] = useState(0);

  const getShapeConfig = () => {
    switch (shape) {
      case "box":
        return {
          d: "M 8 110 V 10 A 2 2 0 0 1 10 8 H 110 A 2 2 0 0 1 112 10 V 110 A 2 2 0 0 1 110 112 H 10 A 2 2 0 0 1 8 110 Z",
          defaultLength: 412.5,
        };
      case "triangle":
        return {
          d: "M 9 104 L 60 8 L 111 104 A 2 2 0 0 1 109 107 H 11 A 2 2 0 0 1 9 104 Z",
          defaultLength: 320.0,
        };
      case "circle":
      default:
        return {
          d: "M 7 60 A 53 53 0 0 1 113 60 A 53 53 0 0 1 7 60 Z",
          defaultLength: 333.0,
        };
    }
  };

  const currentShapeConfig = getShapeConfig();

  useEffect(() => {
    if (pathRef.current && typeof pathRef.current.getTotalLength === "function") {
      const len = pathRef.current.getTotalLength();
      if (len > 0) setTotalLength(len);
    } else {
      setTotalLength(currentShapeConfig.defaultLength);
    }
  }, [shape, currentShapeConfig.d, currentShapeConfig.defaultLength]);

  const length = totalLength || currentShapeConfig.defaultLength;

  // Use continuous progress for alternating draw/erase snake effect
  const dashOffset = length * (1 - progress / 100);

  // A ball travels once around the outline per breathing cycle, so it always stays on the shape.
  let ball = null;
  if (showBall && pathRef.current && typeof pathRef.current.getPointAtLength === "function") {
    const cycleFrac = (((progress / 100) % 1) + 1) % 1;
    try {
      ball = pathRef.current.getPointAtLength(length * cycleFrac);
    } catch (e) {
      ball = null;
    }
  }

  return (
    <svg className={className} viewBox="0 0 120 120">
      <path
        d={currentShapeConfig.d}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={pathRef}
        d={currentShapeConfig.d}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={dashOffset}
        style={{ transition: progress === 0 ? "none" : "stroke-dashoffset 0.1s linear" }}
      />
      {ball && (
        <circle
          cx={ball.x}
          cy={ball.y}
          r={5.5}
          fill="#ffffff"
          stroke="#a8c896"
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }}
        />
      )}
    </svg>
  );
};

const MeditationScreen = () => {
  const navigate = useNavigate();
  const [selectedTechnique, setSelectedTechnique] = useState("triangle");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(180);
  const [customDurationMinutes, setCustomDurationMinutes] = useState("");
  const [customDurationSeconds, setCustomDurationSeconds] = useState("");
  const [customDurationError, setCustomDurationError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [historyCount, setHistoryCount] = useState(0);
  const completedRef = useRef(false);
  const prevPhaseIndexRef = useRef(null);
  const [isCustomBreathing, setIsCustomBreathing] = useState(false);
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold1, setCustomHold1] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [customHold2, setCustomHold2] = useState(4);

  // Up to 3 saved custom sets per method (triangle / box / circle); saving a 4th overwrites the oldest.
  const MAX_SAVED_SETS = 3;
  const SETS_KEY = "ms_custom_breath_sets";
  const [savedSets, setSavedSets] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(SETS_KEY) || "{}");
      return v && typeof v === "object" ? v : {};
    } catch (e) {
      return {};
    }
  });

  const persistSets = (next) => {
    setSavedSets(next);
    try {
      localStorage.setItem(SETS_KEY, JSON.stringify(next));
    } catch (e) { /* storage unavailable: keep in memory only */ }
  };

  const saveCurrentSet = () => {
    const entry = {
      id: Date.now(),
      inhale: Math.max(1, parseInt(customInhale) || 1),
      hold1: Math.max(0, parseInt(customHold1) || 0),
      exhale: Math.max(1, parseInt(customExhale) || 1),
      hold2: Math.max(0, parseInt(customHold2) || 0),
    };
    const current = savedSets[selectedTechnique] || [];
    const next = [...current, entry].slice(-MAX_SAVED_SETS); // drop the oldest beyond 3
    persistSets({ ...savedSets, [selectedTechnique]: next });
  };

  const loadSet = (entry) => {
    setCustomInhale(entry.inhale);
    setCustomHold1(entry.hold1);
    setCustomExhale(entry.exhale);
    setCustomHold2(entry.hold2);
    resetLocalSession();
  };

  const deleteSet = (id) => {
    persistSets({ ...savedSets, [selectedTechnique]: (savedSets[selectedTechnique] || []).filter((e) => e.id !== id) });
  };

  const customPreset = useMemo(() => {
    const inh = Math.max(1, parseInt(customInhale) || 1);
    const exh = Math.max(1, parseInt(customExhale) || 1);
    const hld1 = Math.max(0, parseInt(customHold1) || 0);
    const hld2 = Math.max(0, parseInt(customHold2) || 0);

    let phases = [];
    let lbl = "";

    if (selectedTechnique === "box") {
      // Box: 4 phases (Inhale, Hold, Exhale, Hold)
      phases = [
        { name: "Inhale", seconds: inh },
        { name: "Hold", seconds: hld1 },
        { name: "Exhale", seconds: exh },
        { name: "Hold", seconds: hld2 },
      ];
      lbl = `${inh}-${hld1}-${exh}-${hld2}`;
    } else if (selectedTechnique === "circle") {
      // Circle: 2 phases (Inhale, Exhale)
      phases = [
        { name: "Inhale", seconds: inh },
        { name: "Exhale", seconds: exh },
      ];
      lbl = `${inh}-${exh}`;
    } else {
      // Triangle: 3 phases (Inhale, Hold, Exhale)
      phases = [
        { name: "Inhale", seconds: inh },
        { name: "Hold", seconds: hld1 },
        { name: "Exhale", seconds: exh },
      ];
      lbl = `${inh}-${hld1}-${exh}`;
    }

    return {
      label: `Custom (${lbl})`,
      displayTechnique: `Custom ${lbl} ${techniques[selectedTechnique]?.label || "Breathing"}`,
      apiTechniqueCandidates: [lbl, `${lbl} Breathing`, selectedTechnique, "triangle"],
      phases,
    };
  }, [customInhale, customHold1, customExhale, customHold2, selectedTechnique]);

  const activePreset = isCustomBreathing
    ? customPreset
    : (presets[selectedTechnique]?.[selectedPresetIndex] || presets[selectedTechnique]?.[0] || presets.triangle[0]);

  const config = useMemo(() => {
    return {
      shape: selectedTechnique,
      label: techniques[selectedTechnique]?.label || "Triangle",
      displayTechnique: activePreset.displayTechnique,
      apiTechniqueCandidates: activePreset.apiTechniqueCandidates,
      phases: activePreset.phases,
    };
  }, [selectedTechnique, activePreset]);

  const cycleSeconds = config.phases.reduce((total, phase) => total + phase.seconds, 0);
  const totalCycles = Math.max(1, Math.ceil(durationSeconds / cycleSeconds));
  // Always finish the breathing cycle in progress: the session runs for whole cycles only.
  const sessionSeconds = totalCycles * cycleSeconds;
  const progress = sessionSeconds ? Math.min(100, (elapsedSeconds / sessionSeconds) * 100) : 0;

  const { activePhaseIndex, currentPhase, phaseProgress, shapeCycleProgress } = useMemo(() => {
    if (!cycleSeconds || cycleSeconds <= 0) {
      return { activePhaseIndex: 0, currentPhase: config.phases[0], phaseProgress: 0, shapeCycleProgress: 0 };
    }

    const cycleElapsed = elapsedSeconds % cycleSeconds;
    let accumulated = 0;
    let phaseIdx = 0;
    let pElapsed = 0;
    let pSec = config.phases[0].seconds;

    for (let i = 0; i < config.phases.length; i++) {
      const sec = config.phases[i].seconds;
      if (cycleElapsed >= accumulated && cycleElapsed < accumulated + sec) {
        phaseIdx = i;
        pElapsed = cycleElapsed - accumulated;
        pSec = sec;
        break;
      }
      accumulated += sec;
    }

    const phaseFrac = pSec > 0 ? Math.min(1, pElapsed / pSec) : 0;
    const numPhases = config.phases.length;
    const totalFrac = numPhases > 0 ? (phaseIdx + phaseFrac) / numPhases : 0;

    // Continuous progress for alternating draw/erase effect across cycles
    const currentCycle = Math.floor(elapsedSeconds / cycleSeconds);
    const cycleProgressVal = isRunning || elapsedSeconds > 0 ? (currentCycle + totalFrac) * 100 : 0;

    return {
      activePhaseIndex: phaseIdx,
      currentPhase: config.phases[phaseIdx] || config.phases[0],
      phaseProgress: phaseFrac,
      shapeCycleProgress: cycleProgressVal,
    };
  }, [config.phases, cycleSeconds, elapsedSeconds, isRunning]);

  const breathScaleStyle = useMemo(() => {
    if (!isRunning) return { transform: "scale(1)" };
    const pName = (currentPhase?.name || "").toLowerCase();
    let scale = 1.0;
    if (pName.includes("inhale")) {
      scale = 0.6 + 0.22 * phaseProgress;
    } else if (pName.includes("exhale")) {
      scale = 0.82 - 0.22 * phaseProgress;
    } else if (pName.includes("hold")) {
      const isAfterInhale =
        activePhaseIndex > 0 &&
        (config.phases[activePhaseIndex - 1]?.name || "").toLowerCase().includes("inhale");
      scale = isAfterInhale ? 0.82 : 0.6;
    }
    return {
      transform: `scale(${scale.toFixed(3)})`,
      transition: "transform 1s linear",
    };
  }, [isRunning, currentPhase, phaseProgress, activePhaseIndex, config.phases]);

  useEffect(() => {
    if (isRunning && soundOn && activePhaseIndex !== prevPhaseIndexRef.current) {
      if (prevPhaseIndexRef.current !== null) {
        playBell('intersect');
      }
      prevPhaseIndexRef.current = activePhaseIndex;
    }
  }, [activePhaseIndex, isRunning, soundOn]);

  useEffect(() => {
    getBreathingHistory()
      .then((response) => {
        const payload = getResponsePayload(response);
        const history = Array.isArray(payload) ? payload : payload?.sessions || payload?.history || [];
        setHistoryCount(history.length);
      })
      .catch(() => setHistoryCount(0));
  }, []);

  useEffect(() => {
    if (!isRunning || isCompleted) return undefined;

    let lastTick = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTick) / 1000;
      lastTick = now;

      setElapsedSeconds((current) => {
        const nextElapsed = Math.min(current + delta, sessionSeconds);
        setRemainingSeconds(Math.max(sessionSeconds - nextElapsed, 0));
        return nextElapsed;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [sessionSeconds, isCompleted, isRunning]);

  useEffect(() => {
    setCyclesCompleted(calculateCompletedCycles(elapsedSeconds, sessionSeconds, cycleSeconds, totalCycles));
  }, [cycleSeconds, sessionSeconds, elapsedSeconds, totalCycles]);

  useEffect(() => {
    if (elapsedSeconds < sessionSeconds || !sessionId || completedRef.current) return;

    completedRef.current = true;
    recordBreathingToday(sessionSeconds);
    setIsRunning(false);
    setIsCompleted(true);
    if (soundOn) playBell('double'); // Final double bell

    if (isLocalSession(sessionId)) {
      setApiMessage("Session completed locally. Please check API connection.");
      return;
    }

    completeBreathingSession(sessionId, {
      cyclesCompleted: calculateCompletedCycles(sessionSeconds, sessionSeconds, cycleSeconds, totalCycles),
      completedSeconds: Math.floor(sessionSeconds),
    })
      .then(() => setApiMessage("Session saved successfully."))
      .catch(() => setApiMessage("Session completed locally. Please check API connection."));
  }, [elapsedSeconds, sessionSeconds, sessionId, cycleSeconds, totalCycles, soundOn]);

  // After a finished session, send the user to the dashboard to pick their next tool
  // (the dashboard guides them to the last page if they don't pick anything within a few seconds).
  useEffect(() => {
    if (isCompleted) navigate("/app", { state: { fromTool: true }, replace: true });
  }, [isCompleted, navigate]);

  useEffect(() => {
    if (!isCountingDown) return undefined;

    if (soundOn) {
      if (countdownValue > 0) {
        playBeep(520, 0.12);
      } else {
        playBell('single');
      }
    }

    if (vibrationOn) {
      triggerVibrate(countdownValue > 0 ? 80 : [100, 50, 100]);
    }

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const startTimer = setTimeout(() => {
      setIsCountingDown(false);
      setIsRunning(true);
    }, 600);

    return () => clearTimeout(startTimer);
  }, [isCountingDown, countdownValue, soundOn, vibrationOn]);

  const resetLocalSession = (nextDuration = durationSeconds) => {
    completedRef.current = false;
    setRemainingSeconds(nextDuration);
    setElapsedSeconds(0);
    setCyclesCompleted(0);
    setSessionId(null);
    setIsRunning(false);
    setIsCountingDown(false);
    setCountdownValue(5);
    setIsCompleted(false);
    prevPhaseIndexRef.current = null;
    setApiMessage("");
  };

  const handleTechniqueChange = (key) => {
    setSelectedTechnique(key);
    setSelectedPresetIndex(0);
    resetLocalSession();
  };

  const applyDuration = (seconds) => {
    setDurationSeconds(seconds);
    setCustomDurationError("");
    resetLocalSession(seconds);
  };

  const handleDurationChange = (seconds) => {
    setCustomDurationMinutes("");
    setCustomDurationSeconds("");
    applyDuration(seconds);
  };

  const applyCustomDuration = (minutesValue, secondsValue) => {
    const hasMinutes = minutesValue !== "";
    const hasSeconds = secondsValue !== "";

    if (!hasMinutes && !hasSeconds) {
      setCustomDurationError("Please enter minutes or seconds.");
      return;
    }

    const minutes = hasMinutes ? Number(minutesValue) : 0;
    const seconds = hasSeconds ? Number(secondsValue) : 0;

    if (!Number.isFinite(minutes) || minutes < 0) {
      setCustomDurationError("Minutes cannot be negative.");
      return;
    }

    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 59) {
      setCustomDurationError("Seconds must be between 0 and 59.");
      return;
    }

    const totalSeconds = Math.round(minutes * 60 + seconds);

    if (totalSeconds < 1) {
      setCustomDurationError("Minimum duration is 1 second.");
      return;
    }

    applyDuration(totalSeconds);
  };

  const handleCustomMinutesChange = (event) => {
    const value = event.target.value;
    setCustomDurationMinutes(value);
    applyCustomDuration(value, customDurationSeconds);
  };

  const handleCustomSecondsChange = (event) => {
    const value = event.target.value;
    setCustomDurationSeconds(value);
    applyCustomDuration(customDurationMinutes, value);
  };

  const handleStart = async ({ forceNew = false } = {}) => {
    if ((customDurationMinutes || customDurationSeconds) && customDurationError) return;

    if (isCompleted || forceNew) {
      resetLocalSession();
    } else if (sessionId && !isCompleted) {
      setCountdownValue(5);
      setIsCountingDown(true);
      return;
    }

    if (!sessionId || forceNew) {
      try {
        const response = await startSessionWithTechniqueFallback(config, durationSeconds);
        setSessionId(getSessionId(response) || `local-${Date.now()}`);
        setApiMessage("Session started.");
      } catch (error) {
        setSessionId(`local-${Date.now()}`);
        setApiMessage("API unavailable. Running session locally.");
      }
    }

    setCountdownValue(5);
    setIsCountingDown(true);
  };

  const handleStop = async () => {
    const shouldCompleteSession = isRunning && sessionId && !isLocalSession(sessionId);
    const currentCyclesCompleted = calculateCompletedCycles(
      elapsedSeconds,
      durationSeconds,
      cycleSeconds,
      totalCycles
    );

    if (shouldCompleteSession) {
      try {
        await completeBreathingSession(sessionId, {
          cyclesCompleted: currentCyclesCompleted,
          completedSeconds: Math.floor(elapsedSeconds),
        });
      } catch (error) {
        setApiMessage("Stopped locally. Please check API connection.");
      }
    }

    resetLocalSession();
  };

  const handleNextSection = (addedSeconds = 180) => {
    const timeToAdd = typeof addedSeconds === "number" ? addedSeconds : 180;
    let nextTech = "box";
    if (selectedTechnique === "triangle") nextTech = "box";
    if (selectedTechnique === "box") nextTech = "circle";
    if (selectedTechnique === "circle") nextTech = "triangle";

    setSelectedTechnique(nextTech);
    setSelectedPresetIndex(0);
    setDurationSeconds((prev) => prev + timeToAdd);
  };

  if (isCompleted) {
    const stepStatus = getTodayProgress();

    const handleDone = () => {
      resetLocalSession();
      navigate("/app");
    };

    const handleReset = () => {
      resetLocalSession();
      navigate("/app");
    };

    return (
      <CompletionScreen
        onDone={handleDone}
        onReset={handleReset}
        stepStatus={stepStatus}
        streakDays={historyCount + 1}
        referralCount={2}
        refLink="mentalswasthya.com/ref/MS-REF2026"
        apiMessage={apiMessage}
      />
    );
  }

  // Big full-screen "Ready, 3, 2, 1" countdown before every breathing exercise
  if (isCountingDown) {
    const countdownText = countdownValue === 5 ? "Settle" : countdownValue === 4 ? "Ready" : countdownValue > 0 ? String(countdownValue) : "Begin";
    return (
      <div
        className="fixed inset-0 z-50 h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Breathing session starting"
      >
        <button
          type="button"
          onClick={handleStop}
          aria-label="Cancel and go back"
          className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <FiArrowLeft size={18} />
        </button>
        <style>{`
          @keyframes countdownPulse {
            0% { transform: scale(0.65); opacity: 0; }
            50% { transform: scale(1.12); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-countdown { animation: countdownPulse 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[#a8c896]">Get ready</p>
        <div
          key={countdownValue}
          aria-live="assertive"
          className="animate-countdown mt-4 font-black leading-none text-[#e8f5dd] text-[32vw] sm:text-[22vw] lg:text-[18rem]"
          style={{ fontSize: countdownValue > 0 && countdownValue <= 3 ? undefined : "clamp(3rem, 14vw, 8rem)" }}
        >
          {countdownText}
        </div>
      </div>
    );
  }

  // Full screen session view triggers ONLY after countdown timer completes and session is actively running
  const isSessionActive = !isCountingDown && (isRunning || (sessionId !== null && elapsedSeconds > 0));

  if (isSessionActive) {
    return (
      <div
        className="fixed inset-0 z-50 h-dvh overflow-hidden flex flex-col items-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white animate-fade-in pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]"
        role="dialog"
        aria-modal="true"
        aria-label="Breathing session"
      >
        {/* Glowing aura behind shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-[#7d9667]/15 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000"
          style={{ transform: `translate(-50%, -50%) scale(${isRunning ? 1.2 : 0.9})` }}></div>

        {/* Top bar with minimal info and stop/exit button */}
        <div className="relative w-full flex-none grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 animate-fade-in z-50">
          <button
            type="button"
            onClick={() => { handleStop(); navigate(-1); }}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Go Back"
            aria-label="Stop session and go back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="text-center min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.15em] leading-snug text-[#a8c896] break-words">
              {config.label} Preset: {config.displayTechnique.replace(" Breathing", "")}
            </span>
            <h3 className="text-sm font-bold text-white/50">
              Cycle {Math.min(cyclesCompleted + 1, totalCycles)} of {totalCycles}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Exit Full View"
            aria-label="Exit full view"
          >
            <FiSquare size={16} />
          </button>
        </div>

        <div className="bs-full-body relative flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4">
          {/* Center content: the breathing shape & active phase */}
          <div className="flex flex-col items-center justify-center flex-1 min-h-0 w-full max-w-lg text-center">
            <div className="bs-full-stage relative flex items-center justify-center">
              {/* Outer animated breathing progress indicator matching shape */}
              <ProgressShape
                shape={config.shape}
                progress={shapeCycleProgress}
                strokeWidth={4}
                trackColor="rgba(255,255,255,0.06)"
                progressColor="#a8c896"
                className="absolute inset-0 w-full h-full"
                showBall
              />

              {/* Breathing shape with animated scale */}
              <div className={`breath-shape-full ${config.shape}`} style={breathScaleStyle}>
                <span className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider select-none">
                  {isRunning ? currentPhase.name : "Paused"}
                </span>
              </div>
            </div>

            {/* Horizontal Session Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-sm mt-5 mb-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/60 mb-1.5">
                <span>0%</span>
                <span className="text-[#a8c896] font-extrabold">{Math.round(progress)}%</span>
                <span>100%</span>
              </div>
              <div
                className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner"
                role="progressbar"
                aria-label="Session progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#7d9667] to-[#a8c896] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(168,200,150,0.6)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom bar with controls */}
          <div className="bs-full-controls w-full max-w-md flex-none flex items-center justify-center py-2 animate-fade-in z-50">
            {isRunning ? (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-900 shadow-xl hover:bg-gray-100 transition-all cursor-pointer"
                title="Pause"
                aria-label="Pause session"
              >
                <FiPause size={26} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-[#7d9667] text-white shadow-xl shadow-[#7d9667]/30 hover:bg-[#6f865c] transition-all animate-pulse cursor-pointer"
                title="Resume"
                aria-label="Resume session"
              >
                <FiPlay size={26} className="ml-1" />
              </button>
            )}
          </div>
        </div>

        <style>{`
          /* Stage scales with the viewport: never wider than the screen, never taller than the space left for it */
          .bs-full-stage {
            width: min(420px, 84vw, calc(100dvh - 330px));
            min-width: 150px;
            aspect-ratio: 1 / 1;
          }
          @media (max-width: 767px) {
            .bs-full-stage { width: min(320px, 84vw, calc(100dvh - 300px)); }
          }
          /* Short landscape phones: shape on the left, controls on the right */
          @media (max-height: 520px) and (orientation: landscape) {
            .bs-full-body { flex-direction: row; gap: 1.5rem; }
            .bs-full-stage { width: min(320px, 45vw, calc(100dvh - 150px)); min-width: 120px; }
            .bs-full-controls { max-width: 22rem; }
          }

          .breath-shape-full {
            width: min(240px, 72%);
            height: auto;
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            background: linear-gradient(145deg, #7d9667, #9db98a);
            box-shadow: 0 0 50px rgba(168, 200, 150, 0.4);
            transition: border-radius 0.4s ease, clip-path 0.4s ease;
          }

          .breath-shape-full.circle {
            border-radius: 999px;
          }

          .breath-shape-full.box {
            border-radius: 2px;
          }

          .breath-shape-full.triangle {
            border-radius: 2px;
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
            padding-top: min(60px, 18%);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-130px)] rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb] p-3 sm:p-4 md:p-7 shadow-[0_18px_55px_rgba(30,48,25,0.08)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-1 flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-600 border border-gray-200 shadow-sm shrink-0"
            title="Go Back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
              Mental Swasthya - Wellness Platform
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-2">
              Guided Breathing Session
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Regulate your autonomic nervous system using clinically backed breath-pacing protocols.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 w-full lg:w-auto">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2" role="group" aria-label="Breathing technique">
            {Object.entries(techniques).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTechniqueChange(key)}
                aria-pressed={selectedTechnique === key}
                className={`min-h-[44px] sm:min-h-0 rounded-2xl px-2 sm:px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] transition-all ${selectedTechnique === key
                  ? "bg-[#7d9667] text-white shadow-lg shadow-[#7d9667]/25"
                  : "bg-white text-gray-400 hover:text-[#7d9667]"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 mt-2 hidden lg:block">Preset Patterns</p>
          <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1 bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-gray-100/50 shadow-sm mt-1" role="group" aria-label="Breathing pattern">
            {presets[selectedTechnique].map((preset, index) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setIsCustomBreathing(false);
                  setSelectedPresetIndex(index);
                  resetLocalSession();
                }}
                aria-pressed={!isCustomBreathing && selectedPresetIndex === index}
                className={`min-h-[40px] sm:min-h-0 whitespace-nowrap rounded-xl px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.05em] transition-all ${!isCustomBreathing && selectedPresetIndex === index
                  ? "bg-[#7d9667] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#7d9667] hover:bg-gray-50/50"
                  }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                if (!isPremium()) {
                  toast(PREMIUM_MESSAGE, { icon: "🔒" });
                  navigate("/app/subscription");
                  return;
                }
                setIsCustomBreathing(true);
                resetLocalSession();
              }}
              aria-pressed={isCustomBreathing}
              className={`min-h-[40px] sm:min-h-0 whitespace-nowrap rounded-xl px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.05em] transition-all ${isCustomBreathing
                ? "bg-[#7d9667] text-white shadow-sm"
                : "text-gray-400 hover:text-[#7d9667] hover:bg-gray-50/50"
                }`}
            >
              {isPremium() ? "Custom" : "🔒 Custom"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-7 lg:items-stretch">
        <section className="rounded-[24px] sm:rounded-[30px] bg-white/80 border border-white p-4 sm:p-5 md:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-[380px] md:min-h-[460px] text-center">
            <div className="relative w-full max-w-[280px] aspect-square md:max-w-[340px] lg:max-w-[440px] flex items-center justify-center">
              {/* The countdown uses the Silent Meditation bubble; the chosen shape takes over once breathing begins */}
              <ProgressShape
                shape={isCountingDown ? "circle" : config.shape}
                progress={shapeCycleProgress}
                strokeWidth={7}
                trackColor="#e4ecdf"
                progressColor="#7d9667"
                className="absolute inset-0 w-full h-full"
              />

              <div className={`breath-shape ${isCountingDown ? "circle" : config.shape}`} style={breathScaleStyle}>
                <span className={isCountingDown ? "text-xl md:text-2xl font-black uppercase tracking-wider select-none text-white animate-pulse" : ""}>
                  {isCountingDown
                    ? (countdownValue === 5 ? "Settled" : countdownValue === 4 ? "Ready" : countdownValue > 0 ? countdownValue : "Begin")
                    : isRunning
                      ? currentPhase.name
                      : "Paused"}
                </span>
              </div>
            </div>

            {isCountingDown ? (
              <div className="mt-4 flex flex-col items-center animate-fade-in">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d9667] bg-[#eef6ea] px-3.5 py-1 rounded-full border border-[#7d9667]/20 shadow-sm">
                  Get Ready
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2 font-mono tracking-tight animate-pulse">
                  {countdownValue === 5 ? "Settled" : countdownValue === 4 ? "Ready" : countdownValue > 0 ? countdownValue : "Begin!"}
                </h2>
                <p className="text-xs font-bold text-gray-400 mt-1">
                  Take a deep breath and center yourself...
                </p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667] mt-4">
                  {config.displayTechnique}
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2">
                  {formatTime(remainingSeconds)}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Cycle {Math.min(cyclesCompleted + 1, totalCycles)}/{totalCycles}
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-400 mt-4 font-semibold max-w-[90%]">
              {config.phases.map((p, idx) => {
                const isActive = isRunning && idx === activePhaseIndex;
                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`px-2 py-1 rounded-lg transition-all ${isActive
                        ? "bg-[#eef6ea] text-[#7d9667] font-extrabold border border-[#7d9667]/20 scale-105"
                        : "bg-gray-50 text-gray-400"
                        }`}
                    >
                      {p.name} ({p.seconds}s)
                    </span>
                    {idx < config.phases.length - 1 && (
                      <span className="text-gray-300 mx-0.5">•</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {isCountingDown ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCountingDown(false);
                    setIsRunning(false);
                    setCountdownValue(5);
                  }}
                  className="inline-flex items-center gap-2 min-h-[48px] rounded-2xl bg-gray-100 hover:bg-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition-all cursor-pointer"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isRunning ? () => setIsRunning(false) : handleStart}
                  className="inline-flex items-center gap-2 min-h-[48px] rounded-2xl bg-[#7d9667] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all cursor-pointer"
                >
                  {isRunning ? <FiPause /> : <FiPlay />}
                  {isRunning ? "Pause" : "Start"}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:flex lg:flex-col lg:[&>*:last-child]:flex-1">
          {/* Customise Breathing Card - only shown when Custom is clicked */}
          {isCustomBreathing && (
            <div className="rounded-[24px] sm:rounded-[28px] bg-white p-4 sm:p-5 shadow-sm border border-gray-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Customise Patterns
                  </p>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#eef6ea] text-[#7d9667]">
                    {selectedTechnique === "box"
                      ? "Box (4 Steps)"
                      : selectedTechnique === "circle"
                        ? "Circle (2 Steps)"
                        : "Triangle (3 Steps)"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-3 font-medium">
                {selectedTechnique === "box"
                  ? "Adjust inhale, hold, exhale, and hold seconds:"
                  : selectedTechnique === "circle"
                    ? "Adjust inhale and exhale seconds:"
                    : "Adjust inhale, hold, and exhale seconds:"}
              </p>

              {/* Custom inputs dynamically rendered for box (4), circle (2), triangle (3) */}
              <div
                className={`grid gap-2 ${
                  selectedTechnique === "box"
                    ? "grid-cols-2 sm:grid-cols-4"
                    : selectedTechnique === "circle"
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {/* Inhale (all techniques) */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Inhale
                  </span>
                  <div className="flex items-center min-h-[44px] sm:min-h-0 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 focus-within:border-[#7d9667] focus-within:bg-white">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customInhale}
                      aria-label="Inhale seconds"
                      onChange={(e) => {
                        setCustomInhale(Math.max(1, parseInt(e.target.value) || 1));
                        resetLocalSession();
                      }}
                      inputMode="numeric"
                      className="w-full min-w-0 bg-transparent outline-none text-base sm:text-xs font-black text-gray-800"
                    />
                    <span className="text-[10px] text-gray-400 font-bold ml-1">s</span>
                  </div>
                </div>

                {/* Hold 1 (only for Triangle and Box) */}
                {selectedTechnique !== "circle" && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {selectedTechnique === "box" ? "Hold 1" : "Hold"}
                    </span>
                    <div className="flex items-center min-h-[44px] sm:min-h-0 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 focus-within:border-[#7d9667] focus-within:bg-white">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customHold1}
                        aria-label={selectedTechnique === "box" ? "First hold seconds" : "Hold seconds"}
                        onChange={(e) => {
                          setCustomHold1(Math.max(0, parseInt(e.target.value) || 0));
                          resetLocalSession();
                        }}
                        inputMode="numeric"
                        className="w-full min-w-0 bg-transparent outline-none text-base sm:text-xs font-black text-gray-800"
                      />
                      <span className="text-[10px] text-gray-400 font-bold ml-1">s</span>
                    </div>
                  </div>
                )}

                {/* Exhale (all techniques) */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Exhale
                  </span>
                  <div className="flex items-center min-h-[44px] sm:min-h-0 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 focus-within:border-[#7d9667] focus-within:bg-white">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customExhale}
                      aria-label="Exhale seconds"
                      onChange={(e) => {
                        setCustomExhale(Math.max(1, parseInt(e.target.value) || 1));
                        resetLocalSession();
                      }}
                      inputMode="numeric"
                      className="w-full min-w-0 bg-transparent outline-none text-base sm:text-xs font-black text-gray-800"
                    />
                    <span className="text-[10px] text-gray-400 font-bold ml-1">s</span>
                  </div>
                </div>

                {/* Hold 2 (only for Box - 4th phase) */}
                {selectedTechnique === "box" && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Hold 2
                    </span>
                    <div className="flex items-center min-h-[44px] sm:min-h-0 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 focus-within:border-[#7d9667] focus-within:bg-white">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customHold2}
                        aria-label="Second hold seconds"
                        onChange={(e) => {
                          setCustomHold2(Math.max(0, parseInt(e.target.value) || 0));
                          resetLocalSession();
                        }}
                        inputMode="numeric"
                        className="w-full min-w-0 bg-transparent outline-none text-base sm:text-xs font-black text-gray-800"
                      />
                      <span className="text-[10px] text-gray-400 font-bold ml-1">s</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#7d9667] mt-3 font-bold">
                Total cycle:{" "}
                {selectedTechnique === "box"
                  ? (parseInt(customInhale) || 0) +
                    (parseInt(customHold1) || 0) +
                    (parseInt(customExhale) || 0) +
                    (parseInt(customHold2) || 0)
                  : selectedTechnique === "circle"
                    ? (parseInt(customInhale) || 0) + (parseInt(customExhale) || 0)
                    : (parseInt(customInhale) || 0) +
                      (parseInt(customHold1) || 0) +
                      (parseInt(customExhale) || 0)}
              </p>

              {/* Saved custom sets (max 3 per method) */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Saved sets ({(savedSets[selectedTechnique] || []).length}/{MAX_SAVED_SETS})
                  </p>
                  <button
                    type="button"
                    onClick={saveCurrentSet}
                    className="min-h-[36px] px-3 rounded-lg bg-[#7d9667] hover:bg-[#6f865c] text-white text-[11px] font-black uppercase tracking-wide"
                  >
                    Save this set
                  </button>
                </div>
                {(savedSets[selectedTechnique] || []).length === 0 ? (
                  <p className="text-[11px] text-gray-400 mt-2">
                    Save up to {MAX_SAVED_SETS} sets. Saving more replaces the oldest one.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {(savedSets[selectedTechnique] || []).map((entry) => {
                      const parts = selectedTechnique === "box"
                        ? [entry.inhale, entry.hold1, entry.exhale, entry.hold2]
                        : selectedTechnique === "circle"
                          ? [entry.inhale, entry.exhale]
                          : [entry.inhale, entry.hold1, entry.exhale];
                      return (
                        <li key={entry.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => loadSet(entry)}
                            className="flex-1 min-h-[40px] text-left px-3 rounded-lg bg-gray-50 hover:bg-[#eef6ea] border border-gray-100 text-xs font-black text-gray-700"
                          >
                            {parts.join("-")}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSet(entry.id)}
                            aria-label={`Delete saved set ${parts.join("-")}`}
                            className="w-10 h-10 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 text-lg leading-none"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="rounded-[24px] sm:rounded-[28px] bg-white p-4 sm:p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Time Control
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => handleDurationChange(duration.value)}
                  aria-pressed={durationSeconds === duration.value}
                  className={`min-h-[44px] sm:min-h-0 rounded-2xl py-3 text-xs font-black transition-all ${durationSeconds === duration.value
                    ? "bg-[#7d9667] text-white"
                    : "bg-gray-50 text-gray-400 hover:text-[#7d9667]"
                    }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-2">
                Custom Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-3 sm:px-4 py-3 focus-within:border-[#7d9667] focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customDurationMinutes}
                    inputMode="numeric"
                    aria-label="Custom duration minutes"
                    onChange={handleCustomMinutesChange}
                    placeholder="0"
                    className="w-full min-w-0 bg-transparent outline-none text-base sm:text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-400">min</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-3 sm:px-4 py-3 focus-within:border-[#7d9667] focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="1"
                    value={customDurationSeconds}
                    inputMode="numeric"
                    aria-label="Custom duration seconds"
                    onChange={handleCustomSecondsChange}
                    placeholder="30"
                    className="w-full min-w-0 bg-transparent outline-none text-base sm:text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-400">sec</span>
                </div>
              </div>
              {customDurationError && (
                <p className="text-xs font-semibold text-red-400 mt-2">
                  {customDurationError}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] sm:rounded-[28px] bg-white p-4 sm:p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Session Controls
            </p>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                aria-pressed={soundOn}
                className="w-full min-h-[44px] flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600"
              >
                <span className="inline-flex items-center gap-2">
                  {soundOn ? <FiVolume2 /> : <FiVolumeX />}
                  Sound
                </span>
                <span className="text-[#7d9667]">{soundOn ? "ON" : "OFF"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVibrationOn(!vibrationOn)}
                aria-pressed={vibrationOn}
                className="w-full min-h-[44px] flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600"
              >
                <span className="inline-flex items-center gap-2">
                  <FiZap />
                  Vibration
                </span>
                <span className="text-[#7d9667]">{vibrationOn ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .breath-shape {
          width: min(168px, 60%);
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(145deg, #7d9667, #9db98a);
          box-shadow: 0 22px 55px rgba(125,150,103,0.35);
          transition: border-radius 0.4s ease, clip-path 0.4s ease;
        }

        .breath-shape.circle {
          border-radius: 999px;
        }

        .breath-shape.box {
          border-radius: 2px;
        }

        .breath-shape.triangle {
          border-radius: 2px;
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          padding-top: min(40px, 14%);
        }

        @keyframes countdownPulse {
          0% { transform: scale(0.65); opacity: 0; }
          50% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-countdown {
          animation: countdownPulse 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MeditationScreen;
