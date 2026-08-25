import React, { useEffect, useRef, useState } from "react";
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
  startBreathingSession,
} from "../Api/breathingApi";
import { axiosInstance } from "../Api/config";

// Progress Circle Helper Component matching breathing UI
const ProgressShapeCircle = ({
  progress,
  strokeWidth = 7,
  trackColor = "#e4ecdf",
  progressColor = "#7d9667",
  className = "absolute inset-0 w-full h-full",
}) => {
  const pathRef = useRef(null);
  const defaultLength = 333.0; // Circumference for r=53 circle
  // Use continuous progress for alternating draw/erase snake effect
  const dashOffset = defaultLength * (1 - progress / 100);

  return (
    <svg className={className} viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r="53"
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        ref={pathRef}
        cx="60"
        cy="60"
        r="53"
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={defaultLength}
        strokeDashoffset={dashOffset}
        style={{ transition: progress === 0 ? "none" : "stroke-dashoffset 0.1s linear" }}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
};

const SilentMeditationScreen = () => {
  const navigate = useNavigate();

  // Settings
  const [durationSeconds, setDurationSeconds] = useState(180); // 3 mins default
  const [customDurationMinutes, setCustomDurationMinutes] = useState("");
  const [customDurationSeconds, setCustomDurationSeconds] = useState("");
  const [customDurationError, setCustomDurationError] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  // States
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [sessionId, setSessionId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [medCompleted, setMedCompleted] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  // Trackers for logs summary
  const [intentionStatus, setIntentionStatus] = useState("0 completed");
  const [breathingStatus, setBreathingStatus] = useState("0 min");
  const [medMinutes, setMedMinutes] = useState(0);
  const [totalPlayMinutes, setTotalPlayMinutes] = useState(0);
  const [affPlays, setAffPlays] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);

  // Audio objects
  const audioContextRef = useRef(null);

  // Synchronize remaining time on mount or duration selector click
  useEffect(() => {
    if (!sessionId) {
      setRemainingSeconds(durationSeconds);
    }
  }, [durationSeconds, sessionId]);

  // Initial countdown timer
  useEffect(() => {
    let timer;
    if (isCountingDown) {
      timer = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            triggerStartSession();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCountingDown]);

  // Main session timer
  useEffect(() => {
    let timer;
    if (isRunning && sessionId) {
      let lastTick = Date.now();
      timer = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTick) / 1000;
        lastTick = now;

        setElapsedSeconds((prev) => {
          const next = Math.min(prev + delta, durationSeconds);
          setRemainingSeconds(Math.max(durationSeconds - next, 0));
          if (next >= durationSeconds) {
            clearInterval(timer);
            setTimeout(triggerCompleteSession, 0);
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isRunning, sessionId, durationSeconds]);

  // Audio prompt effect based on full elapsed seconds
  const prevSecRef = useRef(0);
  useEffect(() => {
    if (!isRunning || !soundOn) return;
    const currentSec = Math.floor(elapsedSeconds);
    if (currentSec > prevSecRef.current) {
      const subSec = currentSec % 10;
      if (subSec === 0) playPromptTone(330); // Inhale tone (E note)
      if (subSec === 5) playPromptTone(262); // Exhale tone (C note)
    }
    prevSecRef.current = currentSec;
  }, [elapsedSeconds, isRunning, soundOn]);

  // Helper to generate synthethic breathing tone (silent meditation has no complex tracks)
  const playPromptTone = (frequency = 262) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("AudioContext tone blocked by user gesture:", e);
    }
  };

  const handleStart = () => {
    setCountdownValue(3);
    setIsCountingDown(true);
  };

  const triggerStartSession = async () => {
    try {
      setApiMessage("");
      const res = await startBreathingSession({
        technique: "Silent Meditation",
        durationSeconds: durationSeconds,
      });
      const data = res.data?.data || res.data || {};
      const newSessId = data.sessionId || data.id || data._id || data.session?._id || data.session?.id;

      if (newSessId) {
        setSessionId(newSessId);
        setElapsedSeconds(0);
        setRemainingSeconds(durationSeconds);
        setIsRunning(true);
      } else {
        setSessionId(`local-${Date.now()}`);
        setElapsedSeconds(0);
        setRemainingSeconds(durationSeconds);
        setIsRunning(true);
      }
    } catch (err) {
      console.error("API error starting silent session:", err);
      // Local fallback in case backend is offline
      setSessionId(`local-${Date.now()}`);
      setElapsedSeconds(0);
      setRemainingSeconds(durationSeconds);
      setIsRunning(true);
    }
  };

  const triggerCompleteSession = async () => {
    setIsRunning(false);
    const finalDuration = elapsedSeconds;

    // Fetch stats for completion summary cards
    try {
      const intentionsRes = await axiosInstance.get("/intentions");
      const list = intentionsRes.data?.data || intentionsRes.data || [];
      const today = new Date().toDateString();
      const completedToday = list.filter((i) => new Date(i.createdAt).toDateString() === today).length;
      setIntentionStatus(`${completedToday} completed`);
    } catch (e) { }

    try {
      const breathingRes = await axiosInstance.get("/breathing/history");
      const list = breathingRes.data?.data || breathingRes.data || [];
      const today = new Date().toDateString();
      const minsToday = list
        .filter((b) => new Date(b.createdAt).toDateString() === today)
        .reduce((sum, b) => sum + (b.durationSeconds || 0), 0);
      const totalMins = Math.round((minsToday + finalDuration) / 60);
      setBreathingStatus(`${totalMins} min`);
      setHistoryCount(list.length);
    } catch (e) {
      setBreathingStatus(`${Math.round(finalDuration / 60)} min`);
    }

    try {
      const playRes = await axiosInstance.get("/meditation/history");
      const list = playRes.data?.data || playRes.data || [];
      const playMins = Math.round(list.reduce((sum, p) => sum + (p.durationSeconds || 0), 0) / 60);
      setMedMinutes(playMins);
    } catch (e) { }

    try {
      const playRes = await axiosInstance.get("/music/history");
      const list = playRes.data?.data || playRes.data || [];
      const playMins = Math.round(list.reduce((sum, p) => sum + (p.durationSeconds || 0), 0) / 60);
      setTotalPlayMinutes(playMins);
    } catch (e) { }

    try {
      const affRes = await axiosInstance.get("/affirmation/history");
      const list = affRes.data?.data || affRes.data || [];
      setAffPlays(list);
    } catch (e) { }

    // Complete session call
    try {
      if (sessionId && !sessionId.startsWith("local-")) {
        await completeBreathingSession(sessionId, {
          durationSeconds: finalDuration,
          status: "completed",
        });
        setApiMessage("Session logged successfully!");
      }
    } catch (err) {
      console.error("Failed to complete session in backend:", err);
    }

    setMedCompleted(true);
  };

  const handleStop = () => {
    if (window.confirm("Are you sure you want to stop your session early?")) {
      triggerCompleteSession();
    }
  };

  const resetLocalSession = () => {
    setSessionId(null);
    setIsRunning(false);
    setElapsedSeconds(0);
    setRemainingSeconds(durationSeconds);
    setMedCompleted(false);
    setApiMessage("");
  };

  // Coherent rate: 5s inhale, 5s exhale (10s full cycle)
  const subSec = elapsedSeconds % 10;
  const isInhale = subSec < 5;
  const phaseSec = isInhale ? subSec : (10 - subSec);
  const scale = 1 + (phaseSec / 5) * 0.7; // Circle scales from 1.0 to 1.7

  const breathScaleStyle = {
    transform: `scale(${scale})`,
    transition: "transform 0.1s linear",
  };

  const progress = durationSeconds > 0 ? (elapsedSeconds / durationSeconds) * 100 : 0;
  const currentCycle = Math.floor(elapsedSeconds / 10);
  const cycleFrac = subSec / 10;
  const shapeCycleProgress = (currentCycle + cycleFrac) * 100;

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, "0");
    const seconds = Math.floor(Math.max(0, secs % 60)).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Custom Time Handlers
  const handleDurationChange = (value) => {
    setDurationSeconds(value);
    setCustomDurationMinutes("");
    setCustomDurationSeconds("");
    setCustomDurationError("");
    resetLocalSession();
  };

  const handleCustomMinutesChange = (e) => {
    const val = e.target.value;
    setCustomDurationMinutes(val);
    updateCustomDuration(val, customDurationSeconds);
  };

  const handleCustomSecondsChange = (e) => {
    const val = e.target.value;
    setCustomDurationSeconds(val);
    updateCustomDuration(customDurationMinutes, val);
  };

  const updateCustomDuration = (mins, secs) => {
    const m = parseInt(mins) || 0;
    const s = parseInt(secs) || 0;

    if (m < 0 || s < 0 || s >= 60) {
      setCustomDurationError("Please enter valid minutes and seconds (0-59).");
      return;
    }

    const total = m * 60 + s;
    if (total <= 0) {
      setCustomDurationError("Duration must be greater than 0.");
      return;
    }

    setCustomDurationError("");
    setDurationSeconds(total);
    resetLocalSession();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Mental Swasthya",
        text: "I completed a silent meditation session on Mental Swasthya!",
        url: window.location.origin,
      }).catch(() => { });
    } else {
      try {
        navigator.clipboard.writeText(window.location.origin);
        alert("Mental Swasthya link copied to clipboard!");
      } catch (e) { }
    }
  };

  // 1. Session Completed Layout
  if (medCompleted) {
    const med1Status = medMinutes > 0 ? `${medMinutes} min` : "0 min";
    const med2Status = totalPlayMinutes > 0 ? `${totalPlayMinutes} min` : "0 min";
    const affirmationStatus = affPlays.length > 0 ? `${affPlays.length} completed` : "0 completed";
    const streakStatus = `${historyCount + 1} day${historyCount + 1 === 1 ? "" : "s"}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f0f6f0] via-[#f7fbf7] to-[#eef6f6] p-4 md:p-6 animate-fade-in overflow-y-auto">
        <div className="w-full max-w-2xl rounded-[32px] bg-white/95 backdrop-blur-md p-8 md:p-10 text-center shadow-[0_24px_70px_rgba(30,48,25,0.06)] border border-gray-100/50 my-auto">

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

          <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-6">Peace is within you.</h2>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            You completed a silent meditation session. Take a moment to feel the absolute baseline presence and calmness.
          </p>

          <div className="flex justify-center my-6">
            <div className="w-14 h-14 rounded-full bg-[#f4faf2] border border-[#d2edd0] flex items-center justify-center shadow-[0_6px_18px_rgba(125,150,103,0.12)]">
              <div className="w-10 h-10 rounded-full bg-[#e6f4e2] flex items-center justify-center text-[#4b9b3e] text-lg font-bold">
                ✓
              </div>
            </div>
          </div>
          <p className="text-xs font-extrabold text-[#66785c] -mt-2 mb-6">
            Silent meditation logged successfully
          </p>

          {/* Today's progress summary table */}
          <div className="rounded-3xl bg-[#f5f8f3] border border-[#e1ebd9] p-5 mb-6 text-left">
            <h4 className="text-sm font-bold text-center text-[#22331b] mb-4">
              Your Session Achievements
            </h4>

            {/* Grid of 6 Columns */}
            <div className="grid grid-cols-6 gap-1 divide-x divide-gray-200/60 text-center">
              <div className="flex flex-col items-center justify-between min-h-[64px]">
                <span className="text-xs">📄</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Intention</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{intentionStatus}</span>
              </div>
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🌬️</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Breathing</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{breathingStatus}</span>
              </div>
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🧘</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Meditation</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{med1Status}</span>
              </div>
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🧘</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Audio</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{med2Status}</span>
              </div>
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">✨</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Affiliation</span>
                <span className="text-[9px] font-bold text-[#7d9667] mt-1.5 leading-none">{affirmationStatus}</span>
              </div>
              <div className="flex flex-col items-center justify-between min-h-[64px] pl-1">
                <span className="text-xs">🔥</span>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter mt-1">Streak</span>
                <span className="text-[9px] font-bold text-amber-500 mt-1.5 leading-none">{streakStatus}</span>
              </div>
            </div>
          </div>

          <div
            onClick={handleShare}
            className="rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors p-3.5 flex items-center justify-between cursor-pointer mb-6 border border-gray-200/50"
          >
            <span className="text-xs font-semibold text-gray-600">
              Love this silent workspace experience?
            </span>
            <span className="text-xs font-black text-[#7d9667] flex items-center gap-1.5">
              Share ➡️
            </span>
          </div>

          {apiMessage && <p className="text-xs text-[#7d9667] mb-4">{apiMessage}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetLocalSession}
              className="flex-1 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white px-5 py-3 text-sm font-bold shadow-md transition-all"
            >
              Start New Session
            </button>
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="flex-1 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-3 text-sm font-bold transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CountDown State
  if (isCountingDown) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white p-6 animate-fade-in backdrop-blur-xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#7d9667]/20 rounded-full blur-[90px] pointer-events-none animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <span className="text-sm md:text-base font-black uppercase tracking-[0.35em] text-[#a8c896] mb-8">
            Get Ready
          </span>

          <div className="w-48 h-48 rounded-full border-4 border-[#7d9667]/50 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_70px_rgba(125,150,103,0.35)] animate-countdown">
            <span className="text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-md">
              {countdownValue}
            </span>
          </div>

          <p className="text-sm font-semibold text-white/60 mt-8 tracking-wide">
            Sit comfortably and prepare for silence...
          </p>

          <button
            type="button"
            onClick={() => setIsCountingDown(false)}
            className="mt-8 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white/60 hover:text-white transition-all border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 3. Immersive Active Session Layout
  if (sessionId) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white p-6 md:p-10 animate-fade-in">

        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#7d9667]/15 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000"
          style={{ transform: `translate(-50%, -50%) scale(${isRunning ? 1.2 : 0.9})` }}></div>

        {/* Top Info Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between animate-fade-in">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8c896]">
              Silent Meditation Bubble
            </span>
            <h3 className="text-sm font-bold text-white/50">
              Coherent 5s/5s Breathing Cycle
            </h3>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
          >
            <FiSquare size={16} />
          </button>
        </div>

        {/* Bubble Pacer */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center mt-12">
          <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] flex items-center justify-center">

            {/* Outline Circular Progress */}
            <ProgressShapeCircle
              progress={progress}
              strokeWidth={3}
              className="absolute inset-0 w-full h-full"
            />

            {/* Bubble Shape with dynamic scale */}
            <div className="w-[140px] h-[140px] md:w-[170px] md:h-[170px] rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#7d9667] to-[#a8c896]/60 shadow-[0_0_50px_rgba(125,150,103,0.3)] animate-pulse-slow"
              style={breathScaleStyle}>
              <span className="text-lg md:text-xl font-black uppercase tracking-wider select-none">
                {isRunning ? "" : "Paused"}
              </span>
            </div>
          </div>

          {/* Time Remaining */}
          <h2 className="text-6xl md:text-7xl font-black tracking-tight text-white mt-8">
            {formatTime(remainingSeconds)}
          </h2>

          {/* Progress Bar */}
          <div className="w-full max-w-xs sm:max-w-sm mt-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-white/60 mb-1.5">
              <span>{formatTime(elapsedSeconds)}</span>
              <span className="text-[#a8c896] font-extrabold">{Math.round(progress)}%</span>
              <span>{formatTime(durationSeconds)}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-[#a8c896] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        {/* <div className="w-full max-w-md flex items-center justify-between bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {soundOn ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setVibrationOn(!vibrationOn)}
              className={`transition-colors ${vibrationOn ? "text-[#a8c896]" : "text-white/60 hover:text-white"}`}
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
                className="inline-flex items-center gap-2 rounded-2xl bg-[#7d9667] text-white px-6 py-3 text-sm font-bold shadow-lg hover:bg-[#6f865c] transition-all"
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
        </div> */}
      </div>
    );
  }

  // 4. Initial Configure Session Layout (Matches Breathing exercises UI)
  return (
    <div className="min-h-[calc(100vh-130px)] rounded-[32px] bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb] p-4 md:p-7 shadow-[0_18px_55px_rgba(30,48,25,0.08)]">

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
            Mental Swasthya - Wellness Platform
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            Silent Meditation
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Improve mental health with science backed wellness tools for individuals and organizations.
          </p>
        </div>
      </div>

      {/* Main Split Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 mt-7">

        {/* Left main: The breathing bubble circle container */}
        <section className="rounded-[30px] bg-white/80 border border-white p-5 md:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-[460px] text-center">

            {/* Outline Circular Progress */}
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] flex items-center justify-center">
              <ProgressShapeCircle
                progress={shapeCycleProgress}
                strokeWidth={7}
                trackColor="#e4ecdf"
                progressColor="#7d9667"
                className="absolute inset-0 w-full h-full"
              />

              {/* Central bubble shape */}
              <div className="breath-shape circle" style={breathScaleStyle}>
                <span className="text-lg md:text-xl font-black uppercase tracking-wider select-none text-white">
                  {isRunning ? "" : "Paused"}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667] mt-5">
              Silent Meditation Bubble
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2">
              {formatTime(remainingSeconds)}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Coherent 5-second Breathing Cycle
            </p>

            {/* Start Button */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#7d9667] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all duration-300 active:scale-[0.98]"
              >
                <FiPlay />
                Start Session
              </button>
            </div>
          </div>
        </section>

        {/* Right sidebar: Durations, Toggles, progress preview */}
        <aside className="space-y-4">

          {/* Durations selector */}
          <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Duration
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: "1 min", value: 60 },
                { label: "3 min", value: 180 },
                { label: "5 min", value: 300 },
              ].map((dur) => (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => handleDurationChange(dur.value)}
                  className={`rounded-2xl py-3 text-xs font-black transition-all ${durationSeconds === dur.value
                    ? "bg-[#7d9667] text-white"
                    : "bg-gray-50 text-gray-400 hover:text-[#7d9667]"
                    }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>

            {/* Custom durations inputs */}
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

          {/* Sound & Vibration control panel */}
          <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Session Controls
            </p>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="w-full flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100/50 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  {soundOn ? <FiVolume2 /> : <FiVolumeX />}
                  Sound Prompts
                </span>
                <span className="text-[#7d9667]">{soundOn ? "ON" : "OFF"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVibrationOn(!vibrationOn)}
                className="w-full flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100/50 transition-colors"
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
          transition: border-radius 0.4s ease;
        }

        .breath-shape.circle {
          border-radius: 999px;
        }

        @keyframes countdownPulse {
          0% { transform: scale(0.65); opacity: 0; }
          50% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-countdown {
          animation: countdownPulse 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .85; }
        }
      `}</style>
    </div>
  );
};

export default SilentMeditationScreen;
