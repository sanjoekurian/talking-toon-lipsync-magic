
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      stopListening();
    };
  }, []);

  // Character movement animation
  const headMovement = volume > 0.2 ? {
    transform: `translateY(${Math.sin(Date.now() / 300) * volume * 3}px) 
                rotate(${Math.sin(Date.now() / 400) * volume * 2}deg)`
  } : {};

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-64 h-[500px] flex flex-col items-center">
        {/* Full character container */}
        <div className="relative">
          {/* Head */}
          <div 
            className="relative w-56 h-64 bg-[#FFD6BC] rounded-full mb-2"
            style={headMovement}
          >
            {/* Hair */}
            <div className="absolute w-64 h-40 bg-[#221F26] -top-10 -left-4 rounded-t-[100px]"></div>
            <div className="absolute w-16 h-20 bg-[#221F26] -right-2 top-8 rounded-br-[40px]"></div>
            <div className="absolute w-16 h-20 bg-[#221F26] -left-2 top-8 rounded-bl-[40px]"></div>
            
            {/* Face */}
            <div className="absolute top-0 w-full h-full">
              {/* Eyes */}
              <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 w-10 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className={`w-5 h-5 bg-black rounded-full ${blinkState ? 'h-0.5' : ''}`} 
                    style={{ transform: `translateY(${volume > 0.4 ? -1 : 0}px)` }} />
              </div>
              <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 w-10 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className={`w-5 h-5 bg-black rounded-full ${blinkState ? 'h-0.5' : ''}`}
                    style={{ transform: `translateY(${volume > 0.4 ? -1 : 0}px)` }} />
              </div>

              {/* Eyebrows */}
              <div className="absolute top-[28%] left-[20%] w-10 h-1.5 bg-[#221F26] rounded-full" 
                  style={{ transform: `rotate(-5deg) translateY(${volume > 0.6 ? -2 : 0}px)` }}></div>
              <div className="absolute top-[28%] right-[20%] w-10 h-1.5 bg-[#221F26] rounded-full"
                  style={{ transform: `rotate(5deg) translateY(${volume > 0.6 ? -2 : 0}px)` }}></div>

              {/* Nose */}
              <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 w-6 h-4 bg-[#FDE1D3] rounded-full"></div>

              {/* Mouth */}
              <div className="absolute bottom-[25%] left-1/2 transform -translate-x-1/2 w-24 h-10 flex items-center justify-center">
                <div className="w-24 h-3 bg-black rounded-b-full overflow-hidden">
                  <div 
                    className="w-full bg-[#ea384c] transition-all duration-100 ease-out rounded-b-full" 
                    style={{ height: `${Math.max(3, mouthOpenness)}px` }} 
                  />
                </div>
              </div>
              
              {/* Cheeks */}
              <div className="absolute bottom-[30%] left-[15%] w-8 h-4 bg-[#FFDEE2] rounded-full opacity-60"></div>
              <div className="absolute bottom-[30%] right-[15%] w-8 h-4 bg-[#FFDEE2] rounded-full opacity-60"></div>
            </div>
          </div>
          
          {/* Body */}
          <div className="w-40 h-[180px] bg-[#9b87f5] mx-auto rounded-t-xl">
            {/* Neck */}
            <div className="w-12 h-10 bg-[#FFD6BC] mx-auto -mt-1 rounded-b-md"></div>
            
            {/* Arms */}
            <div className="relative w-full">
              {/* Left arm */}
              <div className="absolute -left-16 top-10 w-20 h-10 bg-[#FFD6BC] rounded-full" 
                   style={{ transform: `rotate(${volume > 0.5 ? -15 : -20}deg)` }}>
                {/* Left hand */}
                <div className="absolute right-0 bottom-0 w-12 h-12 bg-[#FFD6BC] rounded-full 
                               transform rotate-12 translate-x-1 translate-y-1"></div>
                {/* Fingers */}
                <div className="absolute right-0 bottom-1 w-3 h-6 bg-[#FFD6BC] rounded-full 
                               transform rotate-45 translate-x-6 translate-y-1"></div>
              </div>
              
              {/* Right arm */}
              <div className="absolute -right-16 top-10 w-20 h-10 bg-[#FFD6BC] rounded-full"
                   style={{ transform: `rotate(${volume > 0.5 ? 15 : 20}deg)` }}>
                {/* Right hand */}
                <div className="absolute left-0 bottom-0 w-12 h-12 bg-[#FFD6BC] rounded-full 
                               transform rotate-12 -translate-x-1 translate-y-1"></div>
                {/* Fingers */}
                <div className="absolute left-0 bottom-1 w-3 h-6 bg-[#FFD6BC] rounded-full 
                               transform -rotate-45 -translate-x-6 translate-y-1"></div>
              </div>
            </div>
          </div>
          
          {/* Legs */}
          <div className="relative w-full mt-1">
            {/* Left leg */}
            <div className="absolute left-1/2 transform -translate-x-[30px] w-14 h-40 bg-[#8E9196] rounded-t-lg"></div>
            
            {/* Right leg */}
            <div className="absolute left-1/2 transform translate-x-[14px] w-14 h-40 bg-[#8E9196] rounded-t-lg"></div>
            
            {/* Feet */}
            <div className="absolute left-1/2 transform -translate-x-[40px] bottom-0 w-20 h-8 bg-[#221F26] rounded-l-xl rounded-br-md"></div>
            <div className="absolute left-1/2 transform translate-x-[20px] bottom-0 w-20 h-8 bg-[#221F26] rounded-r-xl rounded-bl-md"></div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={isListening ? stopListening : startListening}
        className={`mt-4 px-6 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}`}
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
          <p>Click the button above to enable microphone access and start lip syncing.</p>
        )}
      </div>
    </div>
  );
};

export default AnimatedCharacter;
