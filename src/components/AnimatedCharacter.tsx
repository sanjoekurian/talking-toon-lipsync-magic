
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
  const [blinkState, setBlinkState] = useState(false);
  const [handGesture, setHandGesture] = useState(0); // 0: normal, 1: raised, 2: waving
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      startRandomGestures();
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

    if (gestureTimerRef.current) {
      clearTimeout(gestureTimerRef.current);
      gestureTimerRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
    setMouthOpenness(0);
    setHandGesture(0);
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
        const target = normalizedVolume * 20; // Max mouth openness
        const easing = 0.3; // Adjust for faster/slower response
        return prev + (target - prev) * easing;
      });
      
      // Update hand gestures based on volume intensity
      if (normalizedVolume > 0.7 && handGesture === 0) {
        // High volume triggers gesture change
        setHandGesture(Math.floor(Math.random() * 2) + 1);
        
        // Reset gesture after a short delay
        setTimeout(() => {
          setHandGesture(0);
        }, 1000);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateMouth);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateMouth);
  };

  // Random hand gestures during listening
  const startRandomGestures = () => {
    const makeRandomGesture = () => {
      // Only make gestures occasionally
      if (Math.random() > 0.7) {
        setHandGesture(Math.floor(Math.random() * 2) + 1);
        
        // Reset gesture after 1-2 seconds
        setTimeout(() => {
          setHandGesture(0);
        }, Math.random() * 1000 + 1000);
      }
      
      // Schedule next gesture
      gestureTimerRef.current = setTimeout(makeRandomGesture, Math.random() * 3000 + 2000);
    };
    
    gestureTimerRef.current = setTimeout(makeRandomGesture, Math.random() * 3000 + 1000);
  };

  // Blinking animation
  useEffect(() => {
    const startBlinking = () => {
      const randomBlinkInterval = () => Math.random() * 4000 + 1000; // 1-5 seconds
      
      const blink = () => {
        setBlinkState(true);
        
        // Eyes open after 150ms
        setTimeout(() => {
          setBlinkState(false);
          
          // Schedule next blink
          blinkTimerRef.current = setTimeout(blink, randomBlinkInterval());
        }, 150);
      };
      
      blinkTimerRef.current = setTimeout(blink, randomBlinkInterval());
    };
    
    startBlinking();
    
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gestureTimerRef.current) {
        clearTimeout(gestureTimerRef.current);
      }
      stopListening();
    };
  }, []);

  // Floating animation
  const floatingStyle = {
    transform: `translateY(${Math.sin(Date.now() / 1000) * 5}px)`
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-64 h-[400px] flex flex-col items-center">
        {/* Robot container with floating animation */}
        <div className="relative transition-transform duration-300 ease-in-out" style={floatingStyle}>
          {/* Head */}
          <div className="relative w-56 h-56 bg-gray-200 rounded-3xl flex items-center justify-center">
            {/* Screen/Face */}
            <div className="w-48 h-40 bg-[#1A3E5A] rounded-2xl overflow-hidden relative">
              {/* Eyes */}
              <div className="absolute top-[30%] left-[25%] w-8 h-5 bg-[#5DCBF0] rounded-full opacity-90"
                  style={{ height: blinkState ? '1px' : '20px' }}>
              </div>
              <div className="absolute top-[30%] right-[25%] w-8 h-5 bg-[#5DCBF0] rounded-full opacity-90"
                  style={{ height: blinkState ? '1px' : '20px' }}>
              </div>
              
              {/* Mouth */}
              <div className="absolute bottom-[25%] left-1/2 transform -translate-x-1/2 w-20 h-2 flex items-center justify-center">
                <div className="w-full bg-[#5DCBF0] rounded-full overflow-hidden opacity-90"
                    style={{ height: `${Math.max(2, mouthOpenness)}px` }}>
                </div>
              </div>
            </div>
            
            {/* Headphones */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-gray-300 rounded-l-lg"></div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-gray-300 rounded-r-lg"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-30 h-4 bg-gray-300 rounded-t-lg"></div>
          </div>
          
          {/* Body */}
          <div className="w-40 h-48 bg-gray-200 mx-auto rounded-3xl mt-2 relative overflow-visible">
            {/* Glowing line */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-[#5DCBF0] rounded-full"
                style={{ 
                  boxShadow: isListening ? '0 0 10px 2px rgba(93, 203, 240, 0.7)' : 'none',
                  opacity: isListening ? '0.9' : '0.6'
                }}>
            </div>
            
            {/* Arms/Hands */}
            <div className={`absolute -left-14 top-12 w-14 h-8 bg-gray-200 rounded-full transform origin-right transition-all duration-300 ${
              handGesture === 1 ? 'rotate-[-60deg]' : handGesture === 2 ? 'rotate-[-30deg] animate-[wave_1s_ease-in-out_infinite]' : ''
            }`}>
              <div className="absolute right-0 top-0 w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className={`absolute -right-14 top-12 w-14 h-8 bg-gray-200 rounded-full transform origin-left transition-all duration-300 ${
              handGesture === 1 ? 'rotate-[60deg]' : handGesture === 2 ? 'rotate-[30deg] animate-[wave_1s_ease-in-out_infinite]' : ''
            }`}>
              <div className="absolute left-0 top-0 w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          
          {/* Shadow */}
          <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-40 h-10 bg-gray-200 rounded-full opacity-20"></div>
        </div>
      </div>
      
      <Button
        onClick={isListening ? stopListening : startListening}
        className={`mt-8 px-6 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}`}
      >
        {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
        {isListening ? 'Stop' : 'Start'} Listening
      </Button>
      
      <div className="text-center text-sm text-gray-500 max-w-sm mt-4">
        {isListening ? (
          <div className="flex items-center gap-2 justify-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Listening to audio input...
          </div>
        ) : (
          <p>Click the button above to enable microphone access and start animation.</p>
        )}
      </div>
    </div>
  );
};

export default AnimatedCharacter;
