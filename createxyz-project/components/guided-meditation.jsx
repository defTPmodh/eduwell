"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const GuidedMeditation = ({ userId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('5');
  const [type, setType] = useState('mindfulness');
  const [meditation, setMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartMeditation = async () => {
    setIsLoading(true);
    try {
      const prompt = `Create a ${duration}-minute ${type} meditation script. The meditation should be calming, supportive, and easy to follow.`;
      
      const response = await fetch('/api/chat', {  // Updated endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: prompt,
          context: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meditation');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let meditationText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              meditationText += data.content;
              setMeditation(meditationText);
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }

      setIsPlaying(true);
    } catch (error) {
      console.error('Meditation error:', error);
      toast.error('Failed to start meditation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded-lg"
            disabled={isLoading || isPlaying}
          >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-lg"
            disabled={isLoading || isPlaying}
          >
            <option value="mindfulness">Mindfulness</option>
            <option value="loving-kindness">Loving Kindness</option>
            <option value="body-scan">Body Scan</option>
            <option value="breath-awareness">Breath Awareness</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStartMeditation}
          disabled={isLoading || isPlaying}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Preparing...' : isPlaying ? 'Meditating...' : 'Start Meditation'}
        </button>
      </div>

      {meditation && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="whitespace-pre-line">{meditation}</p>
        </div>
      )}
    </div>
  );
};

export default GuidedMeditation; 