import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRepeat, FiShuffle, 
  FiVolume2, FiVolumeX 
} from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { axiosInstance } from '../Api/config';

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
  const [favorites, setFavorites] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    fetchTracks();
    fetchFavorites();
  }, [apiEndpoint]);

  const fetchTracks = async () => {
    try {
      const res = await axiosInstance.get(apiEndpoint);
      const data = res.data?.data?.affirmations || res.data?.data?.meditations || [];
      setTracks(data);
    } catch (err) {
      console.error('Failed to fetch tracks', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get(`${apiEndpoint}/favorites`);
      const favs = res.data?.data?.affirmations || res.data?.data?.meditations || [];
      setFavorites(favs.map(f => f._id || f));
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const res = await axiosInstance.post(`${apiEndpoint}/${id}/favorite`);
      const { isFavorited } = res.data.data;
      if (isFavorited) {
        setFavorites([...favorites, id]);
      } else {
        setFavorites(favorites.filter(favId => favId !== id));
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 100);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const currentTrack = tracks[currentTrackIndex] || null;

  return (
    <div className={`min-h-[calc(100vh-130px)] rounded-[32px] ${bgGradient} p-6 md:p-10 shadow-[0_18px_55px_rgba(30,48,25,0.08)]`}>
      <div className="flex flex-col xl:flex-row gap-10">
        <div className="flex-shrink-0 w-full xl:w-[350px]">
          <div className={`w-full aspect-square rounded-3xl shadow-xl flex items-center justify-center overflow-hidden bg-white`}>
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center ${buttonBg} text-white`}>
                <h2 className="text-3xl font-black text-center px-4">{title}</h2>
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">{subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <button 
                onClick={handlePlayPause}
                disabled={!currentTrack}
                className={`w-14 h-14 flex-shrink-0 rounded-full ${buttonBg} text-white flex items-center justify-center text-xl shadow-md transition-transform hover:scale-105 disabled:opacity-50`}
              >
                {isPlaying ? <FiPause /> : <FiPlay className="ml-1" />}
              </button>

              <div className="flex-grow w-full flex flex-col gap-2">
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                    {currentTrack?.title || 'Select a track to play'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {currentTrack?.artist || 'Unknown Artist'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="flex-grow h-1.5 md:h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: themeColor }}
                  />
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 w-10">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2 group relative">
                  <button onClick={toggleMute} className="hover:text-gray-700 transition-colors">
                    {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: themeColor }}
                  />
                </div>
                <button className="hover:text-gray-700 transition-colors"><FiSkipBack /></button>
                <button className="hover:text-gray-700 transition-colors"><FiSkipForward /></button>
                <button className="hover:text-gray-700 transition-colors"><FiRepeat /></button>
                <button className="hover:text-gray-700 transition-colors"><FiShuffle /></button>
              </div>
            </div>
            
            {currentTrack && (
              <audio 
                ref={audioRef}
                src={currentTrack.audioUrl.startsWith('http') ? currentTrack.audioUrl : `https://api.mentalswasthya.com${currentTrack.audioUrl}`}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  setIsPlaying(false);
                  if (currentTrackIndex < tracks.length - 1) {
                    playTrack(currentTrackIndex + 1);
                  }
                }}
              />
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-gray-400 w-12">#</th>
                  <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-gray-400">Title</th>
                  <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-gray-400">Artist</th>
                  <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-gray-400">Duration</th>
                  <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, idx) => {
                  const isCurrent = currentTrackIndex === idx;
                  const isFav = favorites.includes(track._id);
                  return (
                    <tr 
                      key={track._id} 
                      className={`group transition-colors ${isCurrent ? 'bg-white/60 shadow-sm' : 'hover:bg-white/40'}`}
                    >
                      <td className={`py-3 px-4 text-sm font-bold text-gray-500 ${isCurrent ? 'rounded-l-xl' : ''}`}>
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 flex items-center gap-3">
                        <button 
                          onClick={() => playTrack(idx)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all ${isCurrent ? buttonBg : 'bg-gray-300 hover:bg-gray-400'}`}
                        >
                          {(isCurrent && isPlaying) ? <FiPause className="text-xs" /> : <FiPlay className="text-xs ml-0.5" />}
                        </button>
                        {track.title}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {track.artist || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {track.duration ? formatTime(track.duration) : '-'}
                      </td>
                      <td className={`py-3 px-4 text-right ${isCurrent ? 'rounded-r-xl' : ''}`}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleFavorite(track._id)}
                            className="p-2 border border-gray-200 rounded-lg hover:border-gray-300 bg-white transition-colors"
                          >
                            {isFav ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-gray-400 text-sm hover:text-red-400" />}
                          </button>
                          <button className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isCurrent ? 'bg-white border-transparent shadow-sm text-gray-700' : 'border-gray-200 text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                            Add to Playlist
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tracks.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm font-medium bg-white/40 rounded-xl mt-2">
                No tracks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlaylist;
