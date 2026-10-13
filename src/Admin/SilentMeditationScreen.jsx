import React, { useEffect, useRef, useState } from "react";
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
import {
  completeBreathingSession,
  startBreathingSession,
} from "../Api/breathingApi";
import { axiosInstance } from "../Api/config";
import { playBell } from "../utils/audioUtils";

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
  const [countdownValue, setCountdownValue] = useState(5);
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

  // Initial countdown timer with Settled, Ready, 3, 2, 1
  useEffect(() => {
    if (!isCountingDown) return undefined;

    if (soundOn) {
      if (countdownValue > 0) {
        playPromptTone(520);
      } else {
        playBell('single');
      }
    }

    if (vibrationOn) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(countdownValue > 0 ? 80 : [100, 50, 100]);
        }
      } catch (e) {}
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
      if (soundOn) playBell('single');
    }, 600);

    return () => clearTimeout(startTimer);
  }, [isCountingDown, countdownValue, soundOn, vibrationOn]);

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
      if (subSec === 0) playBell('intersect'); // Inhale start
      if (subSec === 5) playBell('intersect'); // Exhale start
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

  const handleStart = async () => {
    setCountdownValue(5);
    setIsCountingDown(true);
    setElapsedSeconds(0);
    setRemainingSeconds(durationSeconds);
    const localId = `local-${Date.now()}`;
    setSessionId(localId);

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
      }
    } catch (err) {
      console.error("API error starting silent session:", err);
    }
  };

  const triggerCompleteSession = async () => {
    setIsRunning(false);
    if (soundOn) playBell('double');
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
    setIsCountingDown(false);
    setCountdownValue(5);
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
    const shareMessage = `Hey, \nI came across the "Mental Swasthya" platform, that offers a variety of wellness tools which truly helps you to find peace of mind. \n\nIt is simple, helpful, and perfect for daily relaxation.\n\nI hope you enjoy using it!\n\nClick the below link to register\nhttps://mentalswasthya.com/`;

    if (navigator.share) {
      navigator.share({
        title: "Mental Swasthya",
        text: shareMessage,
      }).catch(() => { });
    } else {
      try {
        navigator.clipboard.writeText(shareMessage);
        alert("Mental Swasthya invite message & link copied to clipboard!");
      } catch (e) { }
    }
  };

  // 1. Session Completed Layout
  if (medCompleted) {
    const med1Status = medMinutes > 0 ? `${medMinutes} min` : "0 min";
    const med2Status = totalPlayMinutes > 0 ? `${totalPlayMinutes} min` : "0 min";
    const affirmationStatus = affPlays.length > 0 ? `${affPlays.length} done` : "0 done";

    const stepStatus = {
      intention: intentionStatus || "Done",
      breathing: breathingStatus || "5 min",
      meditation1: med1Status,
      meditation2: med2Status,
      affirmation: affirmationStatus,
    };

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

  // 2. Immersive Active Session Layout (triggers ONLY after countdown timer completes)
  const isSessionActive = !isCountingDown && (isRunning || (sessionId !== null && elapsedSeconds > 0));
  if (isSessionActive) {
    return (
      <div
        className="fixed inset-0 z-50 h-dvh overflow-hidden flex flex-col items-center bg-gradient-to-br from-[#0c160b] via-[#142312] to-[#0c1926] text-white animate-fade-in pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]"
        role="dialog"
        aria-modal="true"
        aria-label="Silent meditation session"
      >

        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#7d9667]/15 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000"
          style={{ transform: `translate(-50%, -50%) scale(${isRunning ? 1.2 : 0.9})` }}></div>

        {/* Top Info Bar */}
        <div className="relative w-full flex-none flex items-center justify-between gap-3 animate-fade-in z-50">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => { handleStop(); navigate(-1); }}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10 shrink-0"
              title="Go Back"
              aria-label="Stop session and go back"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="text-left min-w-0">
              <span className="block truncate text-[10px] font-black uppercase tracking-[0.2em] text-[#a8c896]">
                Silent Meditation Bubble
              </span>
              <h3 className="truncate text-sm font-bold text-white/50">
                Coherent 5s/5s Breathing Cycle
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10 shrink-0"
            title="End Session"
            aria-label="End session"
          >
            <FiSquare size={16} />
          </button>
        </div>

        <div className="sm-full-body relative flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4">
          {/* Bubble Pacer */}
          <div className="flex flex-col items-center justify-center flex-1 min-h-0 w-full max-w-lg text-center">
            <div className="sm-full-stage relative flex items-center justify-center">

              {/* Outline Circular Progress */}
              <ProgressShapeCircle
                progress={progress}
                strokeWidth={3}
                className="absolute inset-0 w-full h-full"
              />

              {/* Bubble Shape with dynamic scale */}
              <div className="sm-full-bubble rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#7d9667] to-[#a8c896]/60 shadow-[0_0_50px_rgba(125,150,103,0.3)] animate-pulse-slow"
                style={breathScaleStyle}>
                <span className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider select-none">
                  {isRunning ? "" : "Paused"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-sm mt-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/60 mb-1.5">
                <span>0%</span>
                <span className="text-[#a8c896] font-extrabold">{Math.round(progress)}%</span>
                <span>100%</span>
              </div>
              <div
                className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10"
                role="progressbar"
                aria-label="Session progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div
                  className="h-full bg-[#a8c896] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="sm-full-controls w-full max-w-md flex-none flex items-center justify-between gap-2 bg-white/5 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 rounded-3xl border border-white/10 shadow-2xl z-50">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                className="w-11 h-11 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Toggle Sound"
                aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
                aria-pressed={soundOn}
              >
                {soundOn ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setVibrationOn(!vibrationOn)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors cursor-pointer ${vibrationOn ? "text-[#a8c896]" : "text-white/60 hover:text-white"}`}
                title="Toggle Vibration"
                aria-label={vibrationOn ? "Turn vibration off" : "Turn vibration on"}
                aria-pressed={vibrationOn}
              >
                <FiZap size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isRunning ? (
                <button
                  type="button"
                  onClick={() => setIsRunning(false)}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-white text-gray-900 px-4 sm:px-6 py-3 text-sm font-bold shadow-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <FiPause />
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRunning(true)}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-[#7d9667] text-white px-4 sm:px-6 py-3 text-sm font-bold shadow-lg hover:bg-[#6f865c] transition-all cursor-pointer"
                >
                  <FiPlay />
                  Resume
                </button>
              )}
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-3 text-sm font-bold border border-white/10 transition-all cursor-pointer"
              >
                <FiSquare />
                Stop
              </button>
            </div>
          </div>
        </div>

        <style>{`
          /* Stage scales with the viewport: never wider than the screen, never taller than the space left for it */
          .sm-full-stage {
            width: min(260px, 80vw, calc(100dvh - 300px));
            min-width: 150px;
            aspect-ratio: 1 / 1;
          }
          @media (min-width: 768px) {
            .sm-full-stage { width: min(320px, 80vw, calc(100dvh - 330px)); }
          }
          /* Short landscape phones: bubble on the left, controls on the right */
          @media (max-height: 520px) and (orientation: landscape) {
            .sm-full-body { flex-direction: row; gap: 1.5rem; }
            .sm-full-stage { width: min(260px, 45vw, calc(100dvh - 150px)); min-width: 120px; }
            .sm-full-controls { max-width: 22rem; }
          }
          .sm-full-bubble {
            width: 54%;
            aspect-ratio: 1 / 1;
          }
          .animate-pulse-slow {
            animation: smPulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes smPulseSlow {
            0%, 100% { opacity: 1; }
            50% { opacity: .85; }
          }
        `}</style>
      </div>
    );
  }

  // 4. Initial Configure Session Layout (Matches Breathing exercises UI)
  return (
    <div className="min-h-[calc(100vh-130px)] rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb] p-3 sm:p-4 md:p-7 shadow-[0_18px_55px_rgba(30,48,25,0.08)]">

      {/* Header bar */}
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
              Silent Meditation
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Improve mental health with science backed wellness tools for individuals and organizations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 mt-7">

        {/* Left main: The breathing bubble circle container */}
        <section className="rounded-[24px] sm:rounded-[30px] bg-white/80 border border-white p-4 sm:p-5 md:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-[380px] md:min-h-[460px] text-center">

            {/* Outline Circular Progress */}
            <div className="relative w-full max-w-[280px] aspect-square md:max-w-[340px] flex items-center justify-center">
              <ProgressShapeCircle
                progress={shapeCycleProgress}
                strokeWidth={7}
                trackColor="#e4ecdf"
                progressColor="#7d9667"
                className="absolute inset-0 w-full h-full"
              />

              {/* Central bubble shape */}
              <div className="breath-shape circle" style={breathScaleStyle}>
                <span className={isCountingDown ? "text-xl md:text-2xl font-black uppercase tracking-wider select-none text-white animate-pulse" : "text-lg md:text-xl font-black uppercase tracking-wider select-none text-white"}>
                  {isCountingDown
                    ? (countdownValue === 5 ? "Settled" : countdownValue === 4 ? "Ready" : countdownValue > 0 ? countdownValue : "Begin")
                    : isRunning
                      ? ""
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
                  Sit comfortably and prepare for silence...
                </p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667] mt-5">
                  Silent Meditation Bubble
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2">
                  {formatTime(remainingSeconds)}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Coherent 5-second Breathing Cycle
                </p>
              </>
            )}

            {/* Start / Cancel Button */}
            <div className="flex justify-center mt-8">
              {isCountingDown ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCountingDown(false);
                    setCountdownValue(5);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-600 transition-all duration-300 cursor-pointer"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#7d9667] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <FiPlay />
                  <span>Start Session</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right sidebar: Durations, Toggles, progress preview */}
        <aside className="space-y-4">

          {/* Durations selector */}
          <div className="rounded-[24px] sm:rounded-[28px] bg-white p-4 sm:p-5 shadow-sm border border-gray-100">
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
                  aria-pressed={durationSeconds === dur.value}
                  className={`min-h-[44px] sm:min-h-0 rounded-2xl py-3 text-xs font-black transition-all ${durationSeconds === dur.value
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

          {/* Sound & Vibration control panel */}
          <div className="rounded-[24px] sm:rounded-[28px] bg-white p-4 sm:p-5 shadow-sm border border-gray-100">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Session Controls
            </p>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                aria-pressed={soundOn}
                className="w-full min-h-[44px] flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100/50 transition-colors"
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
                aria-pressed={vibrationOn}
                className="w-full min-h-[44px] flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100/50 transition-colors"
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
