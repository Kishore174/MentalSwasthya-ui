import React from 'react';
import AudioPlaylist from '../components/AudioPlaylist';

// Normally, you would use actual image assets here
const coverImage = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600";

const AffirmationsScreen = () => {
  return (
    <AudioPlaylist 
      title="Affirmation Moments: Daily Empowerment"
      subtitle="A curated collection of positive affirmations and soundscapes to inspire confidence and manifest success."
      coverImage={coverImage}
      apiEndpoint="/affirmation"
      themeColor="#d99b58" // Approximate color from the screenshot for inputs
      bgGradient="bg-gradient-to-br from-[#fef5e7] via-[#fffdf9] to-[#fcecd7]"
      buttonBg="bg-[#d99b58]"
    />
  );
};

export default AffirmationsScreen;
