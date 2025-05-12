
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedCharacterProps {
  className?: string;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      setIsListening(true);
      processAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
    setMouthOpenness(0);
  };

  const processAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateMouth = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume from frequency data
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const normalizedVolume = Math.min(average / 128, 1); // Normalize to 0-1 range
      setVolume(normalizedVolume);
      
      // Smooth mouth movement with some easing
      setMouthOpenness(prev => {
        const target = normalizedVolume * 30; // Max height of 30px
        const easing = 0.3; // Adjust for faster/slower response
        return prev + (target - prev) * easing;
      });
      
      animationFrameRef.current = requestAnimationFrame(updateMouth);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateMouth);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopListening();
    };
  }, []);

  // Character head bobbing animation
  const headMovement = volume > 0.2 ? {
    transform: `translateY(${Math.sin(Date.now() / 300) * volume * 3}px) 
                rotate(${Math.sin(Date.now() / 400) * volume * 2}deg)`
  } : {};

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className="relative w-80 h-80 bg-purple-100 rounded-full mb-6 flex items-center justify-center shadow-lg"
        style={headMovement}
      >
        {/* Eyes */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-black rounded-full" 
               style={{ transform: `translateY(${volume > 0.4 ? -1 : 0}px)` }} />
        </div>
        <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-black rounded-full"
               style={{ transform: `translateY(${volume > 0.4 ? -1 : 0}px)` }} />
        </div>
        
        {/* Mouth */}
        <div className="absolute bottom-1/4 w-32 h-16 flex items-center justify-center">
          <div className="w-32 h-4 bg-black rounded-b-full overflow-hidden">
            <div 
              className="w-full bg-red-400 transition-all duration-100 ease-out rounded-b-full" 
              style={{ height: `${Math.max(4, mouthOpenness)}px` }} 
            />
          </div>
        </div>
        
        {/* Face */}
        <div className="absolute top-1/5 w-full h-full rounded-full">
          <div className="absolute left-1/2 top-[60%] transform -translate-x-1/2 w-16 h-6 bg-[#FFD6BC] rounded-full opacity-60" />
        </div>
      </div>
      
      <Button
        onClick={isListening ? stopListening : startListening}
        className={`mb-4 px-6 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}`}
      >
        {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
        {isListening ? 'Stop' : 'Start'} Listening
      </Button>
      
      <div className="text-center text-sm text-gray-500 max-w-sm">
        {isListening ? (
          <div className="flex items-center gap-2 justify-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Listening to audio input...
          </div>
        ) : (
          <p>Click the button above to enable microphone access and start lip syncing.</p>
        )}
      </div>
    </div>
  );
};

export default AnimatedCharacter;
