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
import { useNavigate } from "react-router-dom";
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
  const secs = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const calculateCompletedCycles = (seconds, durationSeconds, cycleSeconds, totalCycles) => {
  if (seconds >= durationSeconds) return totalCycles;
  return Math.min(totalCycles, Math.floor(seconds / cycleSeconds));
};

const isLocalSession = (id) => typeof id === "string" && id.startsWith("local-");

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [historyCount, setHistoryCount] = useState(0);
  const completedRef = useRef(false);

  const activePreset = presets[selectedTechnique][selectedPresetIndex];
  const config = useMemo(() => {
    return {
      shape: selectedTechnique,
      label: techniques[selectedTechnique].label,
      displayTechnique: activePreset.displayTechnique,
      apiTechniqueCandidates: activePreset.apiTechniqueCandidates,
      phases: activePreset.phases,
    };
  }, [selectedTechnique, activePreset]);

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
    let intentionsCount = 0;
    try {
      intentionsCount = JSON.parse(localStorage.getItem("mentalSwasthya:intentions") || "[]").length;
    } catch (e) {}

    let playHistory = [];
    try {
      playHistory = JSON.parse(localStorage.getItem("mentalswasthya_play_history") || "[]");
    } catch (e) {}

    const medPlays = playHistory.filter(item => item.playlistType === "/meditation");
    const affPlays = playHistory.filter(item => item.playlistType === "/affirmation");

    const medMinutes = Math.round(medPlays.reduce((sum, item) => sum + (item.duration || 180), 0) / 60);
    const totalPlayMinutes = Math.round(playHistory.reduce((sum, item) => sum + (item.duration || 120), 0) / 60);

    const intentionStatus = intentionsCount > 0 ? `${intentionsCount} completed` : "Yet to experience";
    const breathingStatus = `${Math.round(durationSeconds / 60) || 3} min completed`;
    const meditationStatus1 = medMinutes > 0 ? `${medMinutes} min completed` : "Yet to experience";
    const meditationStatus2 = totalPlayMinutes > 0 ? `${totalPlayMinutes} min completed` : "Yet to experience";
    const affirmationStatus = affPlays.length > 0 ? `${affPlays.length} completed` : "Yet to experience";
    const streakStatus = `${historyCount + 1} day${historyCount + 1 === 1 ? "" : "s"} in a row`;

    const handleShare = () => {
      if (navigator.share) {
        navigator.share({
          title: "Mental Swasthya",
          text: "I completed a wellness breathing session on Mental Swasthya!",
          url: window.location.origin,
        }).catch(() => {});
      } else {
        try {
          navigator.clipboard.writeText(window.location.origin);
          alert("Mental Swasthya link copied to clipboard!");
        } catch (e) {}
      }
    };

    const handleDone = () => {
      resetLocalSession();
      navigate("/app");
    };

    return (
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center bg-gradient-to-br from-[#f0f6f0] via-[#f7fbf7] to-[#eef6f6] p-4 md:p-6 rounded-[32px]">
        <div className="w-full max-w-2xl rounded-[32px] bg-white/95 backdrop-blur-md p-8 md:p-10 text-center shadow-[0_24px_70px_rgba(30,48,25,0.06)] border border-gray-100/50">
          
          {/* Custom Meditating Tree Artwork SVG */}
          <svg viewBox="0 0 200 160" className="mx-auto w-44 h-36 overflow-visible">
            <circle cx="100" cy="90" r="45" fill="#eef6ea" opacity="0.4" />
            <circle cx="100" cy="90" r="30" fill="#e9f5fb" opacity="0.6" />
            
            {/* Tree Leaves */}
            <circle cx="75" cy="50" r="22" fill="#d0e6c4" opacity="0.8" />
            <circle cx="125" cy="50" r="22" fill="#c3dec5" opacity="0.8" />
            <circle cx="100" cy="35" r="25" fill="#b9d7cd" opacity="0.8" />
            <circle cx="60" cy="70" r="18" fill="#dceade" opacity="0.75" />
            <circle cx="140" cy="70" r="18" fill="#dbe7e7" opacity="0.75" />
            
            {/* Tree Trunk */}
            <path d="M96 95 C96 90 94 75 92 65 C92 65 80 50 78 48 M98 68 C98 68 112 52 115 50 M104 95 C104 90 106 75 108 65" 
                  stroke="#4b5563" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M96 95 L96 110 L104 110 L104 95 Z" fill="#4b5563" />
            
            {/* Meditating Figure */}
            <circle cx="100" cy="95" r="18" stroke="#7d9667" strokeWidth="1" fill="#ffffff" strokeDasharray="3 3" />
            <circle cx="100" cy="85" r="4.5" fill="#4b5563" />
            <path d="M100 89.5 L100 99" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M88 103 C92 98 108 98 112 103" stroke="#4b5563" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M94 92 C90 95 90 101 94 101 M106 92 C110 95 110 101 106 101" stroke="#4b5563" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>

          <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-6">Well-done!</h2>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            You have successfully nurtured your mind today. Take a moment to feel the stillness you have created. It feels wonderful, doesn't it?
          </p>

          {/* Circular Success Indicator */}
          <div className="flex justify-center my-6">
            <div className="w-14 h-14 rounded-full bg-[#f4faf2] border border-[#d2edd0] flex items-center justify-center shadow-[0_6px_18px_rgba(125,150,103,0.12)]">
              <div className="w-10 h-10 rounded-full bg-[#e6f4e2] flex items-center justify-center text-[#4b9b3e] text-lg font-bold">
                ✓
              </div>
            </div>
          </div>
          <p className="text-xs font-extrabold text-[#66785c] -mt-2 mb-6">
            Wellness session successfully completed
          </p>

          {/* Today's progress summary table */}
          <div className="rounded-3xl bg-[#f5f8f3] border border-[#e1ebd9] p-5 mb-6 text-left">
            <h4 className="text-sm font-bold text-center text-[#22331b] mb-4">
              Today's progress summary.
            </h4>

            {/* Grid of 6 Columns */}
            <div className="grid grid-cols-6 gap-1 divide-x divide-gray-200/60 text-center">
              {/* Col 1: Intention */}
              <div className="flex flex-col items-center justify-between min-h-[64px]">
                <span className="text-xs">📄</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Intention</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{intentionStatus}</span>
              </div>

              {/* Col 2: Breathing */}
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🌬️</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Breathing</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{breathingStatus}</span>
              </div>

              {/* Col 3: Meditation */}
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🧘</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Meditation</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{meditationStatus1}</span>
              </div>

              {/* Col 4: Meditation 2 */}
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🧘</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Meditation</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{meditationStatus2}</span>
              </div>

              {/* Col 5: Affiliation / Affirmation */}
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">✨</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Affiliation</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{affirmationStatus}</span>
              </div>

              {/* Col 6: Streak */}
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🔥</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Streak</span>
                <span className="text-[9px] font-bold text-amber-500 mt-1.5 leading-none">{streakStatus}</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-[#66785c]/80 font-bold mt-5 leading-normal border-t border-gray-200/40 pt-4">
              Thank you for prioritizing your wellness today. Great job for showing up for your self. You did wonderful.
            </p>
          </div>

          {/* Share box banner */}
          <div 
            onClick={handleShare}
            className="rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors p-3.5 flex items-center justify-between cursor-pointer mb-6 border border-gray-200/50"
          >
            <span className="text-xs font-semibold text-gray-600">
              If you love mental Swasthya webapplication, please
            </span>
            <span className="text-xs font-black text-[#7d9667] flex items-center gap-1.5">
              Share ➡️
            </span>
          </div>

          {apiMessage && <p className="text-xs text-[#7d9667] mb-4">{apiMessage}</p>}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white px-5 py-3 text-sm font-bold shadow-md shadow-[#7d9667]/15 transition-all"
            >
              Return to dashboard
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-3 text-sm font-bold transition-all"
            >
              I will be back tomorrow
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSessionActive = sessionId !== null;

  if (isSessionActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white p-6 md:p-10 animate-fade-in">
        {/* Glowing aura behind shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-[#7d9667]/15 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000"
             style={{ transform: `translate(-50%, -50%) scale(${isRunning ? 1.2 : 0.9})` }}></div>

        {/* Top bar with minimal info and stop/exit button */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between animate-fade-in">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8c896]">
              {config.label} Preset: {config.displayTechnique.replace(" Breathing", "")}
            </span>
            <h3 className="text-sm font-bold text-white/50">
              Cycle {Math.min(cyclesCompleted + 1, totalCycles)} of {totalCycles}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Exit Full View"
          >
            <FiSquare size={16} />
          </button>
        </div>

        {/* Center content: the breathing shape & active phase */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center mt-12">
          <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] flex items-center justify-center">
            {/* Outer animated breathing circle progress indicator */}
            <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#a8c896"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>

            {/* Breathing shape with animated scale */}
            <div className={`breath-shape-full ${config.shape} ${isRunning ? "is-running" : ""}`}>
              <span className="text-lg md:text-xl font-black uppercase tracking-wider select-none">
                {isRunning ? currentPhase.name : "Paused"}
              </span>
            </div>
          </div>

          {/* Large timer */}
          <h2 className="text-6xl md:text-7xl font-black tracking-tight text-white mt-8">
            {formatTime(remainingSeconds)}
          </h2>

          {/* Detailed phase sequence tracker */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/40 mt-6 font-semibold max-w-[90%]">
            {config.phases.map((p, idx) => {
              const isActive = isRunning && p.name === currentPhase.name;
              return (
                <React.Fragment key={idx}>
                  <span
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#7d9667] text-white font-extrabold shadow-lg shadow-[#7d9667]/20 scale-105 border border-[#7d9667]/30"
                        : "bg-white/5 text-white/50 border border-white/5"
                    }`}
                  >
                    {p.name} ({p.seconds}s)
                  </span>
                  {idx < config.phases.length - 1 && (
                    <span className="text-white/20 mx-0.5">•</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Bottom bar with controls */}
        <div className="w-full max-w-md flex items-center justify-between bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              className="text-white/60 hover:text-white transition-colors"
              title="Toggle Sound"
            >
              {soundOn ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setVibrationOn(!vibrationOn)}
              className={`transition-colors ${vibrationOn ? "text-[#a8c896]" : "text-white/60 hover:text-white"}`}
              title="Toggle Vibration"
            >
              <FiZap size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-gray-900 px-6 py-3 text-sm font-bold shadow-lg hover:bg-gray-100 transition-all"
              >
                <FiPause />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#7d9667] text-white px-6 py-3 text-sm font-bold shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all animate-pulse"
              >
                <FiPlay />
                Resume
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-sm font-bold border border-white/10 transition-all"
            >
              <FiSquare />
              Stop
            </button>
          </div>
        </div>

        <style>{`
          .breath-shape-full {
            width: 180px;
            height: 180px;
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
            border-radius: 36px;
          }

          .breath-shape-full.triangle {
            border-radius: 0;
            clip-path: polygon(50% 0%, 100% 88%, 0% 88%);
            padding-top: 45px;
          }

          .breath-shape-full.is-running {
            animation: breatheScaleFull ${cycleSeconds}s ease-in-out infinite;
          }

          @keyframes breatheScaleFull {
            0%, 100% { transform: scale(0.82); opacity: 0.9; }
            42% { transform: scale(1.18); opacity: 1; box-shadow: 0 0 70px rgba(168, 200, 150, 0.5); }
            68% { transform: scale(1.18); opacity: 1; box-shadow: 0 0 70px rgba(168, 200, 150, 0.5); }
          }
        `}</style>
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

        <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
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

          <div className="flex flex-wrap gap-1 bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-gray-100/50 shadow-sm mt-1">
            {presets[selectedTechnique].map((preset, index) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSelectedPresetIndex(index);
                  resetLocalSession();
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-[0.05em] transition-all ${
                  selectedPresetIndex === index
                    ? "bg-[#7d9667] text-white shadow-sm"
                    : "text-gray-400 hover:text-[#7d9667] hover:bg-gray-50/50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
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
            <p className="text-sm text-gray-400 mt-2">
              Cycle {Math.min(cyclesCompleted + 1, totalCycles)}/{totalCycles}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-400 mt-4 font-semibold max-w-[90%]">
              {config.phases.map((p, idx) => {
                const isActive = isRunning && p.name === currentPhase.name;
                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`px-2 py-1 rounded-lg transition-all ${
                        isActive
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
