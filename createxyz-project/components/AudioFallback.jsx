"use client";
import React from 'react';

const AudioFallback = ({ onError }) => {
  return (
    <div className="text-sm text-gray-500 mt-2">
      <p>Audio not available. You can still meditate in silence.</p>
      {onError && (
        <button 
          onClick={onError} 
          className="text-blue-500 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default AudioFallback; 