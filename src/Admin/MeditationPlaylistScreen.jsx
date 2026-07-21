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
      themeColor="#7d9667"
      bgGradient="bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb]"
      buttonBg="bg-[#7d9667]"
    />
  );
};

export default MeditationPlaylistScreen;
