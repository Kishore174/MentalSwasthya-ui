import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPause,
  FiPlay,
  FiRefreshCcw,
  FiSquare,
  FiVolume2,
  FiVolumeX,
  FiZap,
} from "react-icons/fi";
import {
  completeBreathingSession,
  getBreathingHistory,
  startBreathingSession,
} from "../Api/breathingApi";

const techniques = {
  triangle: {
    label: "Triangle",
    displayTechnique: "4-7-8 Breathing",
    apiTechniqueCandidates: ["4-7-8", "triangle", "Triangle", "4-7-8 Breathing"],
    shape: "triangle",
    phases: [
      { name: "Inhale", seconds: 4 },
      { name: "Hold", seconds: 7 },
      { name: "Exhale", seconds: 8 },
    ],
  },
  box: {
    label: "Box",
    displayTechnique: "4-4-4-4 Breathing",
    apiTechniqueCandidates: ["4-4-4-4", "box", "Box", "4-4-4-4 Breathing"],
    shape: "box",
    phases: [
      { name: "Inhale", seconds: 4 },
      { name: "Hold", seconds: 4 },
      { name: "Exhale", seconds: 4 },
      { name: "Hold", seconds: 4 },
    ],
  },
  circle: {
    label: "Circle",
    displayTechnique: "4-4 Breathing",
    apiTechniqueCandidates: ["4-4", "circle", "Circle", "4-4 Breathing"],
    shape: "circle",
    phases: [
      { name: "Inhale", seconds: 4 },
      { name: "Exhale", seconds: 4 },
    ],
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
  const secs = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const calculateCompletedCycles = (seconds, durationSeconds, cycleSeconds, totalCycles) => {
  if (seconds >= durationSeconds) return totalCycles;
  return Math.min(totalCycles, Math.floor(seconds / cycleSeconds));
};

const isLocalSession = (id) => typeof id === "string" && id.startsWith("local-");

const MeditationScreen = () => {
  const [selectedTechnique, setSelectedTechnique] = useState("triangle");
  const [durationSeconds, setDurationSeconds] = useState(180);
  const [customDurationMinutes, setCustomDurationMinutes] = useState("");
  const [customDurationSeconds, setCustomDurationSeconds] = useState("");
  const [customDurationError, setCustomDurationError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [historyCount, setHistoryCount] = useState(0);
  const completedRef = useRef(false);

  const config = techniques[selectedTechnique];
  const cycleSeconds = config.phases.reduce((total, phase) => total + phase.seconds, 0);
  const totalCycles = Math.max(1, Math.ceil(durationSeconds / cycleSeconds));
  const progress = durationSeconds ? Math.min(100, (elapsedSeconds / durationSeconds) * 100) : 0;

  const currentPhase = useMemo(() => {
    const cycleElapsed = elapsedSeconds % cycleSeconds;
    let phaseStart = 0;

    return (
      config.phases.find((phase) => {
        const phaseEnd = phaseStart + phase.seconds;
        const active = cycleElapsed >= phaseStart && cycleElapsed < phaseEnd;
        phaseStart = phaseEnd;
        return active;
      }) || config.phases[0]
    );
  }, [config.phases, cycleSeconds, elapsedSeconds]);

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

    const interval = setInterval(() => {
      setElapsedSeconds((current) => {
        const nextElapsed = Math.min(current + 1, durationSeconds);
        setRemainingSeconds(Math.max(durationSeconds - nextElapsed, 0));
        return nextElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, isCompleted, isRunning]);

  useEffect(() => {
    setCyclesCompleted(calculateCompletedCycles(elapsedSeconds, durationSeconds, cycleSeconds, totalCycles));
  }, [cycleSeconds, durationSeconds, elapsedSeconds, totalCycles]);

  useEffect(() => {
    if (elapsedSeconds < durationSeconds || !sessionId || completedRef.current) return;

    completedRef.current = true;
    setIsRunning(false);
    setIsCompleted(true);

    if (isLocalSession(sessionId)) {
      setApiMessage("Session completed locally. Please check API connection.");
      return;
    }

    completeBreathingSession(sessionId, {
      cyclesCompleted: calculateCompletedCycles(durationSeconds, durationSeconds, cycleSeconds, totalCycles),
    })
      .then(() => setApiMessage("Session saved successfully."))
      .catch(() => setApiMessage("Session completed locally. Please check API connection."));
  }, [cycleSeconds, durationSeconds, elapsedSeconds, sessionId, totalCycles]);

  const resetLocalSession = (nextDuration = durationSeconds) => {
    completedRef.current = false;
    setRemainingSeconds(nextDuration);
    setElapsedSeconds(0);
    setCyclesCompleted(0);
    setSessionId(null);
    setIsRunning(false);
    setIsCompleted(false);
    setApiMessage("");
  };

  const handleTechniqueChange = (key) => {
    setSelectedTechnique(key);
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
    } else if (sessionId) {
      setIsRunning(true);
      return;
    }

    try {
      const response = await startSessionWithTechniqueFallback(config, durationSeconds);
      setSessionId(getSessionId(response) || `local-${Date.now()}`);
      setApiMessage("Session started.");
    } catch (error) {
      setSessionId(`local-${Date.now()}`);
      setApiMessage("API unavailable. Running session locally.");
    }

    setIsRunning(true);
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
        await completeBreathingSession(sessionId, { cyclesCompleted: currentCyclesCompleted });
      } catch (error) {
        setApiMessage("Stopped locally. Please check API connection.");
      }
    }

    resetLocalSession();
  };

  if (isCompleted) {
    return (
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center">
        <div className="w-full max-w-xl rounded-[32px] bg-white p-8 md:p-10 text-center shadow-[0_24px_70px_rgba(30,48,25,0.10)] border border-gray-100">
          <div className="mx-auto w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#eef6ea] to-[#e9f5fb] flex items-center justify-center text-4xl">
            🎉
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667] mt-7">
            Session Completed
          </p>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Beautiful work</h1>
          <p className="text-sm text-gray-500 mt-3">
            You spent {formatTime(durationSeconds)} with {config.displayTechnique}.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-7">
            <div className="rounded-3xl bg-[#f5f8f2] p-4">
              <p className="text-2xl font-black text-gray-900">{totalCycles}</p>
              <p className="text-xs text-gray-400 mt-1">Cycles</p>
            </div>
            <div className="rounded-3xl bg-[#f1f8fb] p-4">
              <p className="text-2xl font-black text-gray-900">{historyCount + 1}</p>
              <p className="text-xs text-gray-400 mt-1">Streak Update</p>
            </div>
          </div>
          {apiMessage && <p className="text-xs text-[#7d9667] mt-5">{apiMessage}</p>}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={() => resetLocalSession()}
              className="flex-1 rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => handleStart({ forceNew: true })}
              className="flex-1 rounded-2xl bg-[#7d9667] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all"
            >
              Start Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-130px)] rounded-[32px] bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb] p-4 md:p-7 shadow-[0_18px_55px_rgba(30,48,25,0.08)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
            MentalSwasthya
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            Guided Breathing Session
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Slow down, follow the shape, and let the rhythm guide your body.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(techniques).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTechniqueChange(key)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] transition-all ${
                selectedTechnique === key
                  ? "bg-[#7d9667] text-white shadow-lg shadow-[#7d9667]/25"
                  : "bg-white text-gray-400 hover:text-[#7d9667]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 mt-7">
        <section className="rounded-[30px] bg-white/80 border border-white p-5 md:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-[460px] text-center">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="53" fill="none" stroke="#e4ecdf" strokeWidth="7" />
                <circle
                  cx="60"
                  cy="60"
                  r="53"
                  fill="none"
                  stroke="#7d9667"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 53}`}
                  strokeDashoffset={`${2 * Math.PI * 53 * (1 - progress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>

              <div className={`breath-shape ${config.shape} ${isRunning ? "is-running" : ""}`}>
                <span>{currentPhase.name}</span>
              </div>
            </div>

            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667] mt-4">
              {config.displayTechnique}
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2">
              {formatTime(remainingSeconds)}
            </h2>
            <p className="text-sm text-gray-400 mt-3">
              Cycle {Math.min(cyclesCompleted + 1, totalCycles)}/{totalCycles}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <button
                type="button"
                onClick={isRunning ? () => setIsRunning(false) : handleStart}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#7d9667] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all"
              >
                {isRunning ? <FiPause /> : <FiPlay />}
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all"
              >
                <FiSquare />
                Stop
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Duration
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => handleDurationChange(duration.value)}
                  className={`rounded-2xl py-3 text-xs font-black transition-all ${
                    durationSeconds === duration.value
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
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 focus-within:border-[#7d9667] focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customDurationMinutes}
                    onChange={handleCustomMinutesChange}
                    placeholder="0"
                    className="w-full min-w-0 bg-transparent outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-400">min</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 focus-within:border-[#7d9667] focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="1"
                    value={customDurationSeconds}
                    onChange={handleCustomSecondsChange}
                    placeholder="30"
                    className="w-full min-w-0 bg-transparent outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300"
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

          <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Session Controls
            </p>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="w-full flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600"
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
                className="w-full flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600"
              >
                <span className="inline-flex items-center gap-2">
                  <FiZap />
                  Vibration
                </span>
                <span className="text-[#7d9667]">{vibrationOn ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#162314] p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a8c896]">
              Progress
            </p>
            <p className="text-4xl font-black text-white mt-4">{Math.round(progress)}%</p>
            <p className="text-xs leading-6 text-white/50 mt-2">
              {apiMessage || "Choose a technique and begin when you are ready."}
            </p>
            <button
              type="button"
              onClick={() => resetLocalSession()}
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#a8c896]"
            >
              <FiRefreshCcw />
              Reset session
            </button>
          </div>
        </aside>
      </div>

      <style>{`
        .breath-shape {
          width: 168px;
          height: 168px;
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
          border-radius: 34px;
        }

        .breath-shape.triangle {
          border-radius: 0;
          clip-path: polygon(50% 0%, 100% 88%, 0% 88%);
          padding-top: 42px;
        }

        .breath-shape.is-running {
          animation: breatheScale ${cycleSeconds}s ease-in-out infinite;
        }

        @keyframes breatheScale {
          0%, 100% { transform: scale(0.82); opacity: 0.9; }
          42% { transform: scale(1.15); opacity: 1; }
          68% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MeditationScreen;
