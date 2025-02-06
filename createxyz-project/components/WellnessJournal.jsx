"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const WellnessJournal = ({ userId }) => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setIsLoading(true);
    try {
      toast.success('Journal entry saved!');
      setEntry('');
      setMood('');
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling today?
          </label>
          <div className="flex gap-4 mb-4">
            {['😊', '😌', '😐', '😔', '😢'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setMood(emoji)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  mood === emoji ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 mb-2">
            Write your thoughts
          </label>
          <textarea
            id="journal-entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="How was your day? What's on your mind?"
            className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !entry.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
};

export default WellnessJournal; 