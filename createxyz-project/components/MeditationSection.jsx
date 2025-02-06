"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const MeditationSection = ({ userId }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const meditations = [
    { 
      id: 'quick', 
      title: 'Quick Focus', 
      duration: '3', 
      icon: '🎯',
      audio: '/audio/quick-focus.mp3'
    },
    { 
      id: 'stress', 
      title: 'Stress Relief', 
      duration: '7', 
      icon: '🌿',
      audio: '/audio/stress-relief.mp3'
    },
    { 
      id: 'deep', 
      title: 'Deep Relaxation', 
      duration: '12', 
      icon: '🌊',
      audio: '/audio/deep-relaxation.mp3'
    },
  ];

  // Fetch user's meditation history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/meditation/history?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setSessionHistory(data);
      } catch (error) {
        console.error('Error fetching meditation history:', error);
        toast.error('Failed to load meditation history');
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopMeditation();
          toast.success('Meditation completed!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startMeditation = async (meditation) => {
    try {
      setIsLoading(true);
      
      // Start audio
      if (audioRef.current) {
        audioRef.current.src = meditation.audio;
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Audio playback error:', error);
          // Continue even if audio fails
        }
      }

      const response = await fetch('/api/meditation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: meditation.id,
          duration: parseInt(meditation.duration),
        }),
      });

      if (!response.ok) throw new Error('Failed to start meditation');

      const session = await response.json();
      setCurrentSession({ ...meditation, sessionId: session.id });
      setIsActive(true);
      setTimer(parseInt(meditation.duration) * 60);
      startTimer();
      
      toast.success('Meditation session started');
    } catch (error) {
      console.error('Error starting meditation:', error);
      toast.error('Failed to start meditation');
      // Stop audio if meditation failed to start
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopMeditation = async () => {
    try {
      setIsLoading(true);
      
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const response = await fetch('/api/meditation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          completed: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to complete meditation');

      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentSession(null);
      setIsActive(false);
      setTimer(0);
      
      toast.success('Meditation session completed');
    } catch (error) {
      console.error('Error completing meditation:', error);
      toast.error('Failed to complete meditation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = async (message) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          message,
          context: [
            {
              role: "system",
              content: "You are a meditation guide helping users with their practice."
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get meditation guidance');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let guidance = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              guidance += data.content;
            } catch (e) {
              console.error('Error parsing meditation guidance:', e);
            }
          }
        }
      }

      return guidance;
    } catch (error) {
      console.error('Error getting meditation guidance:', error);
      toast.error('Failed to get meditation guidance');
      throw error;
    }
  };

  return (
    <div className="meditation-container">
      <div className="meditation-header">
        <h3 className="text-lg font-medium">Meditation</h3>
        <div className="streak-badge">
          <span>Streak: 6 days</span>
          <span className="streak-icon">🔥</span>
        </div>
      </div>

      <div className="meditation-options">
        {meditations.map((option) => (
          <div key={option.id} className="meditation-option">
            <div className="option-info">
              <span className="option-icon">{option.icon}</span>
              <div>
                <h4>{option.title}</h4>
                <span className="duration">{option.duration} min</span>
              </div>
            </div>
            <button 
              onClick={() => startMeditation(option)}
              className="start-button"
              disabled={isActive || isLoading}
            >
              {isActive && currentSession?.id === option.id 
                ? formatTime(timer)
                : isLoading 
                  ? '...' 
                  : 'Start'
              }
            </button>
          </div>
        ))}
      </div>

      {isActive && currentSession && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{currentSession.title}</span>
              <span className="ml-2 text-gray-600">
                {formatTime(timer)} remaining
              </span>
            </div>
            <button 
              onClick={stopMeditation}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? '...' : 'End Session'}
            </button>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(timer / (parseInt(currentSession.duration) * 60)) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationSection; 