
import React, { useState, useRef } from 'react';
import AnimatedCharacter from '@/components/AnimatedCharacter';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      // Create URL for the audio file
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <h1 className="text-4xl font-bold mb-2 text-blue-800">Interactive Robot Character</h1>
      <p className="text-lg text-gray-600 mb-4 text-center max-w-lg">
        A friendly robot that responds to sound with facial expressions and hand gestures
      </p>
      
      <div className="flex justify-center items-center mt-4 mb-8">
        <AnimatedCharacter className="mt-4" audioElement={audioRef} />
      </div>
      
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors">
            Upload Audio File
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          {audioFile && (
            <span className="text-sm text-gray-600">
              {audioFile.name}
            </span>
          )}
        </div>

        {audioUrl && (
          <div className="flex flex-col items-center gap-2">
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
              hidden
            />
            <Button 
              onClick={togglePlay} 
              className={`px-6 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'} Audio
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500 max-w-md text-center">
        <p>
          This robot character responds to audio and animates
          its mouth, face, and hand gestures accordingly. Upload an audio file to see it in action!
        </p>
      </div>
    </div>
  );
};

export default Index;
