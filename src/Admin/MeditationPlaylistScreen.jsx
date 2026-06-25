import React from 'react';
import AudioPlaylist from '../components/AudioPlaylist';

// Normally, you would use actual image assets here
const coverImage = "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&q=80&w=600";

const MeditationPlaylistScreen = () => {
  return (
    <AudioPlaylist 
      title="Mindful Moments Meditation Playlist"
      subtitle="A curated collection of guided meditations and ambient sounds to help you find balance, reduce stress, and achieve calm."
      coverImage={coverImage}
      apiEndpoint="/meditation"
      themeColor="#508c9f" // Approximate color from the screenshot for inputs
      bgGradient="bg-gradient-to-br from-[#e8f4f6] via-[#f5fbfb] to-[#dcf0f3]"
      buttonBg="bg-[#508c9f]"
    />
  );
};

export default MeditationPlaylistScreen;
