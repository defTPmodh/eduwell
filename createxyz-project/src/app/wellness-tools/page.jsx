"use client";
import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import BreathingExercise from '@/components/breathing-exercise';
import GuidedMeditation from '@/components/guided-meditation';
import ChatComponent from '@/components/ChatComponent';
import WellnessJournal from '@/components/WellnessJournal';
import ActivityLog from '@/components/ActivityLog';

export default function WellnessTools() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('meditation');

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#94A187]"></div>
    </div>;
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center card">
        <h2 className="text-2xl font-serif text-[#4A5D45] mb-4">Please Sign In</h2>
        <p className="mb-4 text-[#7C8B74]">You need to be signed in to access wellness tools.</p>
        <button 
          onClick={() => signIn()}
          className="btn-primary"
        >
          Sign In
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-3xl">🌿</span>
          <h1 className="text-3xl font-serif text-[#4A5D45]">Wellness Tools</h1>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          {['meditation', 'breathing', 'journal', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg transition-colors capitalize ${
                activeTab === tab 
                  ? 'bg-[#94A187] text-white' 
                  : 'bg-white/80 text-[#4A5D45] hover:bg-[#94A187]/10'
              }`}
            >
              {tab === 'meditation' && '🧘‍♀️ '}
              {tab === 'breathing' && '🫁 '}
              {tab === 'journal' && '📔 '}
              {tab === 'chat' && '💭 '}
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2">
            <div className="card">
              {activeTab === 'meditation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-[#4A5D45] mb-4">Guided Meditation</h2>
                  <GuidedMeditation userId={session.user.id} />
                </div>
              )}

              {activeTab === 'breathing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-[#4A5D45] mb-4">Breathing Exercises</h2>
                  <BreathingExercise userId={session.user.id} />
                </div>
              )}

              {activeTab === 'journal' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-[#4A5D45] mb-4">Wellness Journal</h2>
                  <WellnessJournal userId={session.user.id} />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-[#4A5D45] mb-4">AI Wellness Assistant</h2>
                  <ChatComponent />
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="card">
              <ActivityLog userId={session.user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 