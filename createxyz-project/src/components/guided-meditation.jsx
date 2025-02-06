"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHandleStreamResponse } from "../utilities/runtime-helpers";
import { toast } from 'react-hot-toast';

function GuidedMeditation() {
  const { useState, useEffect, useRef, useCallback } = React;
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userType, setUserType] = useState("student");
  const [currentMood, setCurrentMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastMeditationDate, setLastMeditationDate] = useState(null);
  const [selectedSound, setSelectedSound] = useState("rain");
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  const meditations = [
    {
      id: 1,
      name: "Quick Focus",
      duration: 3,
      description: "Brief mindfulness for better focus",
    },
    {
      id: 2,
      name: "Stress Relief",
      duration: 7,
      description: "Release tension and anxiety",
    },
    {
      id: 3,
      name: "Deep Relaxation",
      duration: 12,
      description: "Full body and mind relaxation",
    },
    {
      id: 4,
      name: "Sleep Preparation",
      duration: 17,
      description: "Gentle transition to restful sleep",
    },
  ];

  const backgroundSounds = [
    { id: "rain", name: "Rainfall", icon: "🌧️" },
    { id: "waves", name: "Ocean Waves", icon: "🌊" },
    { id: "forest", name: "Forest", icon: "🌳" },
    { id: "white-noise", name: "White Noise", icon: "🌫️" },
  ];

  const toggleFavorite = (meditationId) => {
    setFavorites((prev) =>
      prev.includes(meditationId)
        ? prev.filter((id) => id !== meditationId)
        : [...prev, meditationId]
    );
  };

  const startMeditation = (meditation) => {
    setSelectedMeditation(meditation);
    setIsPlaying(true);
    setProgress(0);
    const duration = meditation.duration * 60;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += 1;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        setIsPlaying(false);
        updateStreak();
      }
    }, 1000);
  };

  const stopMeditation = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setSelectedMeditation(null);
    setProgress(0);
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    if (lastMeditationDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastMeditationDate === yesterday.toDateString()) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(1);
      }
      setLastMeditationDate(today);
    }
  };

  const handleFinish = useCallback((message) => {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    setStreamingMessage("");
    setIsTyping(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: userInput,
          context: [
            {
              role: "system",
              content: `You are a supportive mental health counselor specializing in ${
                userType === "student" ? "student" : "teacher"
              } support. Provide empathetic, non-judgmental responses tailored to educational contexts. Never diagnose, but offer coping strategies and encourage professional help when needed. Keep responses concise and caring.`,
            },
            ...messages.slice(-5)
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      handleStreamResponse(response);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      setIsTyping(false);
    }
  };

  const handleMoodSubmit = (mood) => {
    setCurrentMood(mood);
    setActivities((prev) => [
      ...prev,
      {
        type: "mood",
        value: mood,
        note: moodNote,
        timestamp: new Date().toISOString(),
      },
    ]);
    setMoodNote("");
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newActivity = {
      type: formData.get("type"),
      value: formData.get("value"),
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newActivity]);
    e.target.reset();
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [messages, streamingMessage]);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-crimson-text text-[#4A90E2]">
                EduWell
              </h1>
              <p className="text-sm text-[#666] font-roboto">
                Supporting mental wellness in education
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="p-2 rounded-lg border border-[#4A90E2] text-sm"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <button className="bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#357ABD]">
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-crimson-text text-xl mb-4">
                Daily Mood Check
              </h2>
              <div className="flex justify-between mb-4">
                {["😊", "😌", "😐", "😔", "😢"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSubmit(mood)}
                    className={`text-2xl p-2 rounded-lg hover:bg-[#F0F4F8] ${
                      currentMood === mood ? "bg-[#F0F4F8]" : ""
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Add a note about your mood..."
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-crimson-text text-xl mb-4">
                Activity Logger
              </h2>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <select
                  name="type"
                  className="w-full p-2 border rounded-lg"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select activity type
                  </option>
                  <option value="study">Study Hours</option>
                  <option value="stress">Stress Level</option>
                  <option value="sleep">Sleep Quality</option>
                  <option value="exercise">Exercise</option>
                  <option value="social">Social Interactions</option>
                </select>
                <input
                  type="number"
                  name="value"
                  placeholder="Enter value (hours/rating 1-5)"
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#357ABD]"
                >
                  Log Activity
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-crimson-text text-xl">Meditation</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666]">
                    Streak: {streak} days
                  </span>
                  <span className="text-xl">🔥</span>
                </div>
              </div>

              {!selectedMeditation ? (
                <div className="space-y-4">
                  {meditations.map((meditation) => (
                    <div
                      key={meditation.id}
                      className="border rounded-lg p-4 hover:bg-[#F0F4F8]"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{meditation.name}</h3>
                          <p className="text-sm text-[#666]">
                            {meditation.duration} min
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFavorite(meditation.id)}
                            className="text-xl"
                          >
                            {favorites.includes(meditation.id) ? "⭐" : "☆"}
                          </button>
                          <button
                            onClick={() => startMeditation(meditation)}
                            className="bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#357ABD]"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl mb-2">{selectedMeditation.name}</h3>
                    <p className="text-[#666]">
                      {selectedMeditation.description}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    {backgroundSounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => setSelectedSound(sound.id)}
                        className={`p-2 rounded-lg ${
                          selectedSound === sound.id ? "bg-[#F0F4F8]" : ""
                        }`}
                      >
                        <span className="text-2xl">{sound.icon}</span>
                      </button>
                    ))}
                  </div>

                  <div className="w-full bg-[#F0F4F8] rounded-full h-2">
                    <div
                      className="bg-[#4A90E2] h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={stopMeditation}
                      className="bg-[#4A90E2] text-white px-6 py-2 rounded-lg hover:bg-[#357ABD]"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-crimson-text text-xl mb-4">Support Chat</h2>
              <div ref={chatRef} className="h-[400px] overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-[#4A90E2] text-white"
                          : "bg-[#F0F4F8] text-[#2c3e50]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {streamingMessage && (
                  <div className="text-left">
                    <div className="inline-block p-2 rounded-lg max-w-[80%] bg-[#F0F4F8] text-[#2c3e50]">
                      {streamingMessage}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Share what's on your mind..."
                  className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:border-[#4A90E2]"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="bg-[#4A90E2] text-white px-6 py-2 rounded-lg hover:bg-[#357ABD] disabled:opacity-50"
                >
                  {isTyping ? "⏳" : "✉️"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[#666]">
            If you're in crisis, please call 800-4673 for immediate support
          </p>
          <p className="text-sm text-[#666] mt-1">
            Remember: Your mental health matters ❤️
          </p>
          <p className="text-xs text-[#666] mt-2">
            © 2025 EduWell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function GuidedMeditationStory() {
  return <GuidedMeditation />;
}

export default GuidedMeditation;