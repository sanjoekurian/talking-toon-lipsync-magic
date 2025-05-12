
import React from 'react';
import AnimatedCharacter from '@/components/AnimatedCharacter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white p-4">
      <h1 className="text-4xl font-bold mb-2 text-purple-800">Talking Character</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        A 2D character that syncs its lips to your voice in real-time
      </p>
      
      <AnimatedCharacter className="mt-4" />
      
      <div className="mt-12 text-sm text-gray-500 max-w-md text-center">
        <p>
          This character uses your device's microphone to detect audio and animate
          the character's mouth accordingly. No audio data is stored or transmitted.
        </p>
      </div>
    </div>
  );
};

export default Index;
