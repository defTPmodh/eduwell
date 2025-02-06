"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BreathingExercise = ({ userId }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [seconds, setSeconds] = useState(0);
  const [instructions, setInstructions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 3) {
            setCurrentPhase(current => 
              current === 'inhale' ? 'hold' : 
              current === 'hold' ? 'exhale' : 'inhale'
            );
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {  // Updated endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: "Create a short, calming breathing exercise instruction. Include guidance for inhaling, holding, and exhaling.",
          context: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get breathing instructions');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let instructionText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              instructionText += data.content;
              setInstructions(instructionText);
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }

      setIsActive(true);
      setCurrentPhase('inhale');
      setSeconds(0);
    } catch (error) {
      console.error('Breathing exercise error:', error);
      toast.error('Failed to start breathing exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setSeconds(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          onClick={isActive ? handleStop : handleStart}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : isActive ? 'Stop Exercise' : 'Start Exercise'}
        </button>
      </div>

      {isActive && (
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-blue-500">
            {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </div>
          <div className="text-6xl font-bold">
            {seconds + 1}
          </div>
        </div>
      )}

      {instructions && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="whitespace-pre-line">{instructions}</p>
        </div>
      )}
    </div>
  );
};

export default BreathingExercise; 