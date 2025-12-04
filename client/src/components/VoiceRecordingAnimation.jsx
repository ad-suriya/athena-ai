import React from 'react';
const VoiceRecordingAnimation = ({ audioLevel }) => {
  const bars = [1, 2, 3, 4, 5];
  const getBarHeight = (index) => {
    const scale = 0.5 + (audioLevel / 100) * 0.5;
    const baseHeight = 4;
    const variation = Math.sin(Date.now() / 200 + index) * 10 * scale;
    return baseHeight + variation;
  };

  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {bars.map((i) => (
        <div 
          key={i}
          className="w-2 bg-red-500 rounded-full"
          style={{
            height: `${getBarHeight(i)}px`,
            transition: 'height 0.1s ease-out',
          }}
        />
      ))}
    </div>
  );
};
export default VoiceRecordingAnimation;