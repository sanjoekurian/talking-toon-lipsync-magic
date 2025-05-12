
import React from 'react';
import AnimatedCharacter from '@/components/AnimatedCharacter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <h1 className="text-4xl font-bold mb-2 text-blue-800">Interactive Robot Character</h1>
      <p className="text-lg text-gray-600 mb-4 text-center max-w-lg">
        A friendly robot that responds to sound with facial expressions and hand gestures
      </p>
      
      <div className="flex justify-center items-center mt-4 mb-8">
        <AnimatedCharacter className="mt-4" />
      </div>
      
      <div className="mt-4 text-sm text-gray-500 max-w-md text-center">
        <p>
          This robot character uses your device's microphone to detect audio and animate
          its mouth, face, and hand gestures accordingly. No audio data is stored or transmitted.
        </p>
      </div>
    </div>
  );
};

export default Index;
