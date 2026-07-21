import React from 'react';
import AudioPlaylist from '../components/AudioPlaylist';

const coverImage = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600";

const AffirmationsScreen = () => {
  return (
    <AudioPlaylist 
      title="Affirmation Moments: Daily Empowerment"
      subtitle="A curated collection of positive affirmations and soundscapes to inspire confidence and manifest success."
      coverImage={coverImage}
      apiEndpoint="/affirmation"
      themeColor="#7d9667"
      bgGradient="bg-gradient-to-br from-[#eef6ea] via-white to-[#eef7fb]"
      buttonBg="bg-[#7d9667]"
    />
  );
};

export default AffirmationsScreen;
