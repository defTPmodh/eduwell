"use client";
import React from "react";

function BreathingExercise() {
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
  const [breathingPattern, setBreathingPattern] = useState("deep");
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("inhale");
  const [progress, setProgress] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const chatRef = useRef(null);
  const audioRef = useRef(null);

  const patterns = {
    deep: { inhale: 4, hold: 7, exhale: 8 },
    box: { inhale: 4, hold: 4, exhale: 4, holdExhale: 4 },
    calm: { inhale: 4, exhale: 4 },
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setProgress(0);
    setCurrentPhase("inhale");
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setProgress(0);
    setCurrentPhase("inhale");
  };

  useEffect(() => {
    let timer;
    if (isBreathing) {
      const currentPattern = patterns[breathingPattern];
      const totalDuration = Object.values(currentPattern).reduce(
        (a, b) => a + b,
        0
      );
      const step = 100 / (totalDuration * 10);

      timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + step;
          if (newProgress >= 100) {
            return 0;
          }
          return newProgress;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isBreathing, breathingPattern]);

  useEffect(() => {
    let phaseTimer;
    if (isBreathing) {
      const currentPattern = patterns[breathingPattern];
      const phase = currentPhase;
      const duration = currentPattern[phase] * 1000;

      phaseTimer = setTimeout(() => {
        if (breathingPattern === "box") {
          setCurrentPhase((prev) => {
            if (prev === "inhale") return "hold";
            if (prev === "hold") return "exhale";
            if (prev === "exhale") return "holdExhale";
            return "inhale";
          });
        } else if (breathingPattern === "deep") {
          setCurrentPhase((prev) => {
            if (prev === "inhale") return "hold";
            if (prev === "hold") return "exhale";
            return "inhale";
          });
        } else {
          setCurrentPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
        }
      }, duration);
    }
    return () => clearTimeout(phaseTimer);
  }, [currentPhase, isBreathing, breathingPattern]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    if (audioRef.current) {
      if (!isMusicPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <nav className="bg-white shadow-sm"></nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="font-crimson-text text-xl mb-4 text-[#465B63]">
              Breathing Exercise
            </h2>
            <div className="flex flex-col items-center">
              <div
                className={`w-48 h-48 rounded-full border-4 border-[#8EACC1] flex items-center justify-center transition-all duration-1000 ${
                  isBreathing && currentPhase === "inhale"
                    ? "scale-125 bg-[#D7E4DC]"
                    : isBreathing && currentPhase === "exhale"
                    ? "scale-75 bg-[#B8D0D9]"
                    : "bg-[#D7E4DC]"
                }`}
              >
                <span className="text-lg font-roboto text-[#465B63]">
                  {currentPhase}
                </span>
              </div>

              <div className="mt-6 space-y-4 w-full max-w-md">
                <select
                  value={breathingPattern}
                  onChange={(e) => setBreathingPattern(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#8EACC1] text-[#465B63]"
                >
                  <option value="deep">Deep Breathing (4-7-8)</option>
                  <option value="box">Box Breathing (4-4-4-4)</option>
                  <option value="calm">Calm Breathing (4-4)</option>
                </select>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={isBreathing ? stopBreathing : startBreathing}
                    className="bg-[#A7C4BC] text-white px-6 py-2 rounded-lg hover:bg-[#96B3AB]"
                  >
                    {isBreathing ? "Stop" : "Start"}
                  </button>
                  <button
                    onClick={toggleMusic}
                    className={`px-6 py-2 rounded-lg border ${
                      isMusicPlaying
                        ? "bg-[#A7C4BC] text-white"
                        : "border-[#A7C4BC] text-[#465B63]"
                    }`}
                  >
                    <i
                      className={`fas ${
                        isMusicPlaying ? "fa-volume-up" : "fa-volume-mute"
                      }`}
                    ></i>
                  </button>
                  <button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`px-6 py-2 rounded-lg border ${
                      isVoiceEnabled
                        ? "bg-[#A7C4BC] text-white"
                        : "border-[#A7C4BC] text-[#465B63]"
                    }`}
                  >
                    <i
                      className={`fas ${
                        isVoiceEnabled ? "fa-microphone" : "fa-microphone-slash"
                      }`}
                    ></i>
                  </button>
                </div>

                <div className="w-full bg-[#F0F4F8] rounded-full h-2">
                  <div
                    className="bg-[#A7C4BC] h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6"></div>

          <div className="md:col-span-2 space-y-6"></div>
        </div>
      </div>

      <footer className="bg-white mt-8 py-4"></footer>

      <audio ref={audioRef} src="/path-to-calming-music.mp3" loop />

      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            background-color: #D7E4DC;
          }
          50% { 
            transform: scale(1.5);
            background-color: #B8D0D9;
          }
        }
      `}</style>
    </div>
  );
}

function BreathingExerciseStory() {
  return <BreathingExercise />;
}

export default BreathingExercise;