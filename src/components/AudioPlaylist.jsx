import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRepeat, FiShuffle, 
  FiVolume2, FiVolumeX, FiPlus, FiTrash2, FiFolder, FiInfo, FiCheck
} from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { axiosInstance } from '../Api/config';

/* ─── IndexedDB Constants & Helpers ──────────────────────── */
const DB_NAME = "MentalSwasthyaAudioPlaylistDB";
const STORE_NAME = "custom_playlist_audio";

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = (e) => reject(e);
    request.onsuccess = (e) => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

const saveAudioFile = async (id, file) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, file });
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
};

const getAudioFile = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = (e) => reject(e);
  });
};

const deleteAudioFile = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
};

/* ─── Audio URL Helper ──────────────────────────────────── */
const getFullAudioUrl = (audioUrl) => {
  if (!audioUrl) return "";
  if (audioUrl.startsWith("http") || audioUrl.startsWith("blob:") || audioUrl.startsWith("data:")) {
    return audioUrl;
  }
  const apiBase = axiosInstance.defaults.baseURL || "http://localhost:8080/api";
  const origin = apiBase.replace("/api", "");
  return `${origin}${audioUrl}`;
};

const detectLanguage = (track) => {
  if (track.language) return track.language.toLowerCase();
  // Check Devanagari range (Hindi letters)
  const isHindi = /[\u0900-\u097F]/.test(track.title) || /[\u0900-\u097F]/.test(track.artist || "");
  return isHindi ? "hindi" : "english";
};

const formatTime = (time) => {
  if (isNaN(time)) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AudioPlaylist = ({ 
  title, 
  subtitle, 
  coverImage, 
  apiEndpoint, 
  themeColor,
  bgGradient,
  buttonBg
}) => {
  const [tracks, setTracks] = useState([]);
  const [customTracks, setCustomTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Upload Inline Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadLanguage, setUploadLanguage] = useState("english");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Setup unique localStorage key for custom tracks on each endpoint
  const localStorageKey = useMemo(() => {
    const cleanEndpoint = apiEndpoint.replace(/\//g, "_");
    return `mentalswasthya_custom_tracks_${cleanEndpoint}`;
  }, [apiEndpoint]);

  // Load tracks and custom tracks on mount or endpoint change
  useEffect(() => {
    fetchTracksAndFavorites();
    const storedCustom = localStorage.getItem(localStorageKey);
    if (storedCustom) {
      setCustomTracks(JSON.parse(storedCustom));
    } else {
      setCustomTracks([]);
    }
  }, [apiEndpoint, localStorageKey]);

  const fetchTracksAndFavorites = async () => {
    try {
      const res = await axiosInstance.get(apiEndpoint);
      // Backend format handler (affirmations vs meditations)
      const data = res.data?.data?.affirmations || res.data?.data?.meditations || res.data?.data || [];
      setTracks(data);
      
      const favRes = await axiosInstance.get(`${apiEndpoint}/favorites`);
      const favs = favRes.data?.data?.affirmations || favRes.data?.data?.meditations || favRes.data?.data || [];
      setFavorites(favs.map(f => f._id || f));
    } catch (err) {
      console.error("Failed to load backend playlist tracks:", err);
    }
  };

  // Combine remote tracks and custom tracks
  const allCombinedTracks = useMemo(() => {
    const remoteWithLanguage = tracks.map(t => ({
      ...t,
      language: detectLanguage(t),
      isCustom: false
    }));

    return [...remoteWithLanguage, ...customTracks];
  }, [tracks, customTracks]);

  // Filter combined tracks based on selected language and search query
  const filteredTracks = useMemo(() => {
    return allCombinedTracks.filter(track => {
      const matchesLanguage = 
        languageFilter === "all" ||
        (languageFilter === "custom" && track.isCustom) ||
        (languageFilter === track.language && !track.isCustom);

      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.artist || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesLanguage && matchesSearch;
    });
  }, [allCombinedTracks, languageFilter, searchQuery]);

  const currentTrack = filteredTracks[currentTrackIndex] || null;

  // Handle setting audio source dynamically
  useEffect(() => {
    const loadTrackAudio = async () => {
      if (!currentTrack) return;
      
      setIsPlaying(false);
      setCurrentTime(0);

      try {
        if (currentTrack.isCustom) {
          const file = await getAudioFile(currentTrack._id);
          if (file) {
            const blobUrl = URL.createObjectURL(file);
            if (audioRef.current) {
              audioRef.current.src = blobUrl;
            }
          } else {
            console.error("Audio file not found in local database.");
          }
        } else {
          if (audioRef.current) {
            audioRef.current.src = getFullAudioUrl(currentTrack.audioUrl);
          }
        }
      } catch (err) {
        console.error("Error loading audio file source:", err);
      }
    };

    loadTrackAudio();
  }, [currentTrack]);

  // Playback control functions
  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Playback interrupted:", err));
    }
  };

  const handleNext = () => {
    if (filteredTracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % filteredTracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }, 150);
  };

  const handlePrev = () => {
    if (filteredTracks.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? filteredTracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }, 150);
  };

  const toggleFavorite = async (id, isCustom) => {
    if (isCustom) {
      const updatedFavorites = favorites.includes(id)
        ? favorites.filter(favId => favId !== id)
        : [...favorites, id];
      setFavorites(updatedFavorites);
      return;
    }

    try {
      const res = await axiosInstance.post(`${apiEndpoint}/${id}/favorite`);
      const { isFavorited } = res.data?.data || {};
      if (isFavorited) {
        setFavorites([...favorites, id]);
      } else {
        setFavorites(favorites.filter(favId => favId !== id));
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  // Uploader Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        setUploadError("Please upload an audio file (MP3, WAV, etc.)");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Add Custom Upload submit handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!uploadTitle.trim()) {
      setUploadError("Please provide a title.");
      return;
    }
    if (!selectedFile) {
      setUploadError("Please select an audio file.");
      return;
    }

    setIsUploading(true);

    try {
      const uniqueId = `custom-${apiEndpoint.replace(/\//g, "")}-${Date.now()}`;
      
      const audioUrl = URL.createObjectURL(selectedFile);
      const tempAudio = new Audio(audioUrl);
      
      tempAudio.addEventListener("loadedmetadata", async () => {
        const fileDuration = tempAudio.duration;

        const formData = new FormData();
        formData.append("title", uploadTitle);
        formData.append("artist", uploadArtist || "Self");
        formData.append("language", uploadLanguage);
        formData.append("audio", selectedFile);

        let createdTrack = null;

        try {
          const res = await axiosInstance.post(apiEndpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
          
          if (res.data?.data) {
            createdTrack = {
              ...res.data.data,
              language: uploadLanguage,
              isCustom: false
            };
          }
        } catch (apiErr) {
          console.warn("API upload failed, falling back to local database:", apiErr);
        }

        if (!createdTrack) {
          await saveAudioFile(uniqueId, selectedFile);
          
          createdTrack = {
            _id: uniqueId,
            title: uploadTitle,
            artist: uploadArtist || "Self",
            language: uploadLanguage,
            duration: fileDuration,
            audioUrl: uniqueId,
            isCustom: true
          };

          const updatedCustom = [...customTracks, createdTrack];
          setCustomTracks(updatedCustom);
          localStorage.setItem(localStorageKey, JSON.stringify(updatedCustom));
        } else {
          fetchTracksAndFavorites();
        }

        // Reset fields & success state
        setUploadTitle("");
        setUploadArtist("");
        setUploadLanguage("english");
        setSelectedFile(null);
        setIsUploading(false);
        setUploadSuccess("Audio successfully uploaded and added to library!");

        setTimeout(() => setUploadSuccess(""), 4000);

        setCurrentTrackIndex(0);
      });

      tempAudio.addEventListener("error", () => {
        setUploadError("Could not read audio file properties. Please verify the file.");
        setIsUploading(false);
      });

    } catch (err) {
      console.error("Upload process error:", err);
      setUploadError("An error occurred during submission. Please try again.");
      setIsUploading(false);
    }
  };

  const handleTrackDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this custom track?")) return;

    try {
      await deleteAudioFile(id);
      const updatedCustom = customTracks.filter(t => t._id !== id);
      setCustomTracks(updatedCustom);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedCustom));
      
      if (currentTrack && currentTrack._id === id) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        setCurrentTrackIndex(0);
      }
    } catch (err) {
      console.error("Failed to delete custom track:", err);
    }
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }, 100);
  };

  return (
    <div className={`min-h-[calc(100vh-130px)] rounded-[32px] ${bgGradient} p-4 md:p-8 shadow-[0_18px_55px_rgba(30,48,25,0.08)]`}>
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* ─── LEFT COLUMN: PREMIUM VINYL PLAYER CARD ─── */}
        <section className="flex-shrink-0 w-full xl:w-[380px] bg-white/80 backdrop-blur-md rounded-[32px] border border-white p-6 shadow-lg flex flex-col items-center">
          
          {/* Vinyl player spinner */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 mt-2 flex items-center justify-center">
            
            {/* Spinning Vinyl Record */}
            <div className={`absolute inset-0 rounded-full bg-slate-900 border-[12px] border-slate-950 flex items-center justify-center shadow-2xl overflow-hidden ${isPlaying ? 'animate-vinyl-spin' : ''}`}>
              
              {/* Grooves on vinyl */}
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none"></div>
              
              {/* Album art image in center */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-900 z-10">
                <img 
                  src={coverImage} 
                  alt="Album Art" 
                  className={`w-full h-full object-cover select-none`} 
                />
              </div>
            </div>

            {/* Stylus arm overlay */}
            <div className="absolute -top-1 right-8 w-16 h-36 origin-top transition-transform duration-500 z-20 pointer-events-none"
                 style={{ transform: isPlaying ? 'rotate(15deg)' : 'rotate(-12deg)' }}>
              {/* Stylus shape */}
              <div className="w-1.5 h-24 bg-gradient-to-b to-gray-400 rounded-full shadow mx-auto"
                   style={{ backgroundColor: themeColor }}></div>
              <div className="w-3.5 h-6 bg-slate-800 rounded-sm -mt-1 mx-auto flex items-center justify-center border border-slate-700">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Active track meta */}
          <div className="text-center mt-6 w-full px-2">
            <h2 className="text-xl font-black text-gray-800 line-clamp-1">
              {currentTrack?.title || 'Select a track to play'}
            </h2>
            <p className="text-sm text-gray-500 font-bold mt-1">
              {currentTrack?.artist || 'Unknown Artist'}
            </p>
            {currentTrack && (
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-0.5 mt-2 rounded"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                {currentTrack.isCustom ? 'Custom' : currentTrack.language}
              </span>
            )}
          </div>

          {/* Glowing seeker bar */}
          <div className="w-full mt-7 flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="flex-grow h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: themeColor }}
              />
              <span className="text-[10px] font-black text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Primary playback control buttons */}
          <div className="flex items-center justify-center gap-5 mt-6 w-full">
            <button 
              onClick={handlePrev}
              disabled={filteredTracks.length <= 1}
              className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-40"
              title="Previous Track"
            >
              <FiSkipBack size={20} />
            </button>
            <button 
              onClick={handlePlayPause}
              disabled={!currentTrack}
              className={`w-16 h-16 flex items-center justify-center rounded-full ${buttonBg} text-white shadow-lg transition-all hover:scale-105`}
              style={{ boxShadow: `0 10px 20px ${themeColor}33` }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
            </button>
            <button 
              onClick={handleNext}
              disabled={filteredTracks.length <= 1}
              className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-40"
              title="Next Track"
            >
              <FiSkipForward size={20} />
            </button>
          </div>

          {/* Volume slider & secondary toggles */}
          <div className="w-full mt-8 pt-6 border-t border-gray-100/60 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 flex-grow max-w-[200px]">
              <button 
                onClick={toggleMute} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-100 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: themeColor }}
              />
            </div>

            <div className="flex items-center gap-3">
              {currentTrack && (
                <button 
                  onClick={() => toggleFavorite(currentTrack._id, currentTrack.isCustom)}
                  className="p-2 border border-gray-100 rounded-xl bg-white transition-colors text-gray-400 hover:bg-gray-50 shadow-sm"
                  style={{ borderColor: `${themeColor}12` }}
                  title="Favorite Track"
                >
                  {favorites.includes(currentTrack._id) 
                    ? <FaHeart className="text-red-500 text-sm" /> 
                    : <FaRegHeart className="hover:text-red-500 text-sm" />}
                </button>
              )}
            </div>
          </div>

        </section>

        {/* ─── RIGHT COLUMN: LIST, SEARCH, FILTERS ─── */}
        <section className="flex-grow flex flex-col min-w-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em]"
                 style={{ color: themeColor }}>
                guided recordings
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
                {title}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Filters Bar: Search & Languages */}
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-[24px] p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Language filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Sounds" },
                { id: "english", label: "🇺🇸 English" },
                { id: "hindi", label: "🇮🇳 Hindi" },
                { id: "custom", label: "📁 Personal Upload" }
              ].map(filter => {
                const isActive = languageFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setLanguageFilter(filter.id);
                      setCurrentTrackIndex(0);
                    }}
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.05em] transition-all ${
                      isActive
                        ? "text-white shadow-md"
                        : "bg-white/40 text-gray-400 hover:text-gray-700 hover:bg-white"
                    }`}
                    style={isActive ? { backgroundColor: themeColor, boxShadow: `0 4px 12px ${themeColor}33` } : {}}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Simple text search */}
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-2.5 focus-within:bg-white transition-all w-full md:max-w-[280px]"
                 style={{ focusWithinBorderColor: themeColor }}>
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentTrackIndex(0);
                }}
                className="w-full min-w-0 bg-transparent outline-none text-xs font-bold text-gray-700 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* INLINE PERSONAL UPLOAD FORM (Only rendered when "Personal Upload" tab is active) */}
          {languageFilter === "custom" && (
            <div className="bg-white/95 rounded-[28px] border p-5 md:p-6 shadow-md mb-6 animate-scale-up"
                 style={{ borderColor: `${themeColor}22` }}>
              <h2 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                Upload Custom Track
              </h2>
              
              <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drag and Drop Zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all md:row-span-3 ${
                    dragActive 
                      ? 'bg-gray-50' 
                      : selectedFile 
                        ? 'border-green-400 bg-green-50/20' 
                        : 'border-gray-200'
                  }`}
                  style={dragActive ? { borderColor: themeColor, backgroundColor: `${themeColor}08` } : {}}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
                        <FiCheck size={18} />
                      </div>
                      <p className="text-xs font-black text-gray-800 line-clamp-1">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2"
                           style={{ color: themeColor, backgroundColor: `${themeColor}12` }}>
                        <FiPlus size={18} />
                      </div>
                      <p className="text-xs font-black text-gray-700">Drag & drop audio here</p>
                      <p className="text-[10px] text-gray-400 mt-1">Or click to browse (MP3, WAV)</p>
                    </>
                  )}
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1.5">
                    Track Title
                  </label>
                  <input 
                    type="text" 
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. My Custom Session"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white transition-all"
                    style={{ focusBorderColor: themeColor }}
                    required
                  />
                </div>

                {/* Artist/Speaker Input */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1.5">
                    Speaker / Artist
                  </label>
                  <input 
                    type="text" 
                    value={uploadArtist}
                    onChange={(e) => setUploadArtist(e.target.value)}
                    placeholder="e.g. Self (Optional)"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white transition-all"
                    style={{ focusBorderColor: themeColor }}
                  />
                </div>

                {/* Language Selection & Submit Button */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">
                      Language:
                    </span>
                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-100/50">
                      {[
                        { id: 'english', label: 'English' },
                        { id: 'hindi', label: 'Hindi' }
                      ].map(lang => {
                        const isLangActive = uploadLanguage === lang.id;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => setUploadLanguage(lang.id)}
                            className="rounded-lg px-3 py-1 text-xs font-bold transition-all"
                            style={isLangActive ? { backgroundColor: themeColor, color: '#ffffff' } : { color: '#666666' }}
                          >
                            {lang.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
                    style={{ backgroundColor: themeColor, boxShadow: `0 4px 12px ${themeColor}33` }}
                  >
                    {isUploading ? "Processing..." : "Add to Library"}
                  </button>
                </div>
              </form>

              {/* Status messages */}
              {uploadError && (
                <p className="text-xs font-bold text-red-500 mt-3 text-center">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="text-xs font-bold text-green-600 mt-3 text-center flex items-center justify-center gap-1.5">
                  <FiCheck className="text-green-600" />
                  {uploadSuccess}
                </p>
              )}
            </div>
          )}

          {/* Tracks Table */}
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white overflow-hidden shadow-sm flex-grow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-gray-400 w-14 text-center">#</th>
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-gray-400">Track Info</th>
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-gray-400 w-28 text-center">Language</th>
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-gray-400 w-24 text-center">Duration</th>
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-gray-400 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredTracks.map((track, idx) => {
                    const isCurrent = currentTrack?._id === track._id;
                    const isFav = favorites.includes(track._id);
                    return (
                      <tr 
                        key={track._id} 
                        onClick={() => playTrack(idx)}
                        className="group transition-all cursor-pointer hover:bg-white/50"
                        style={isCurrent ? { backgroundColor: `${themeColor}0c` } : {}}
                      >
                        {/* Track Index / Play status */}
                        <td className="py-4 px-5 text-center text-xs font-bold text-gray-400">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end justify-center gap-[2.5px] h-3 w-4 mx-auto">
                              <span className="w-[2.5px] rounded-full animate-eq-bar-1" style={{ backgroundColor: themeColor }}></span>
                              <span className="w-[2.5px] rounded-full animate-eq-bar-2" style={{ backgroundColor: themeColor }}></span>
                              <span className="w-[2.5px] rounded-full animate-eq-bar-3" style={{ backgroundColor: themeColor }}></span>
                            </div>
                          ) : (
                            <span className="group-hover:hidden">{idx + 1}</span>
                          )}
                          
                          <div className={`hidden group-hover:flex items-center justify-center`}>
                            {isCurrent && isPlaying ? (
                              <FiPause style={{ color: themeColor, fontSize: 13 }} />
                            ) : (
                              <FiPlay style={{ color: themeColor, fontSize: 13 }} className="ml-0.5" />
                            )}
                          </div>
                        </td>

                        {/* Title & Artist */}
                        <td className="py-4 px-5">
                          <div>
                            <p className="text-sm font-black transition-colors"
                               style={isCurrent ? { color: themeColor } : { color: '#222222' }}>
                              {track.title}
                            </p>
                            <p className="text-xs text-gray-400 font-bold mt-0.5">
                              {track.artist || 'Unknown'}
                            </p>
                          </div>
                        </td>

                        {/* Language Badge */}
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-block text-[10px] font-black uppercase tracking-[0.05em] px-2.5 py-1 rounded-full ${
                            track.isCustom
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : track.language === 'hindi'
                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {track.isCustom ? 'Local' : track.language}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-5 text-center text-xs font-bold text-gray-500">
                          {track.duration ? formatTime(track.duration) : '--:--'}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => toggleFavorite(track._id, track.isCustom)}
                              className="p-2 border border-gray-100 rounded-xl bg-white shadow-sm transition-colors text-gray-400 hover:text-red-500"
                              title="Favorite"
                            >
                              {isFav ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-sm" />}
                            </button>
                            
                            {track.isCustom && (
                              <button 
                                onClick={(e) => handleTrackDelete(track._id, e)}
                                className="p-2 border border-gray-100 rounded-xl bg-white hover:bg-red-50 shadow-sm transition-all text-gray-400 hover:text-red-500"
                                title="Delete Custom Track"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTracks.length === 0 && (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                  <FiFolder size={36} className="text-gray-300 mb-3" />
                  <p className="text-sm font-black">No tracks found</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {languageFilter === "custom" 
                      ? "Use the form above to add your first custom recording!" 
                      : "Try another filter or search term"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Invisible HTML Audio Element */}
      {currentTrack && (
        <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            try {
              const historyKey = "mentalswasthya_play_history";
              const existing = localStorage.getItem(historyKey);
              const list = existing ? JSON.parse(existing) : [];
              list.push({
                id: currentTrack._id,
                title: currentTrack.title,
                type: apiEndpoint.includes("meditation") ? "meditation" : "affirmation",
                timestamp: Date.now()
              });
              localStorage.setItem(historyKey, JSON.stringify(list));
            } catch (err) {
              console.error("Failed to log play session:", err);
            }
            setIsPlaying(false);
            handleNext();
          }}
        />
      )}

      {/* ─── CUSTOM ANIMATIONS STYLING ─── */}
      <style>{`
        /* Vinyl spin rotation */
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-vinyl-spin {
          animation: vinylSpin 20s linear infinite;
        }

        /* Equalizer visualizer bars animations */
        @keyframes eqBarGrowth1 {
          0%, 100% { height: 3px; }
          40% { height: 12px; }
          70% { height: 6px; }
        }
        @keyframes eqBarGrowth2 {
          0%, 100% { height: 8px; }
          30% { height: 3px; }
          80% { height: 12px; }
        }
        @keyframes eqBarGrowth3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
          90% { height: 3px; }
        }
        .animate-eq-bar-1 { animation: eqBarGrowth1 0.75s ease-in-out infinite; }
        .animate-eq-bar-2 { animation: eqBarGrowth2 0.85s ease-in-out infinite; }
        .animate-eq-bar-3 { animation: eqBarGrowth3 0.65s ease-in-out infinite; }

        /* Animation utilities */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default AudioPlaylist;
