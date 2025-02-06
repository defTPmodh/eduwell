"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSession, signIn } from 'next-auth/react';

const ChatComponent = () => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: messages.slice(-5),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Handle array response and join into a single string
      let assistantMessage = '';
      if (Array.isArray(data.content)) {
        assistantMessage = data.content.join('').trim();
      } else {
        assistantMessage = data.content;
      }

      // Add the assistant's response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage 
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Show sign-in prompt if not authenticated
  if (!session) {
    return (
      <div className="text-center p-4">
        <p className="mb-4">Please sign in to use the chat feature</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] chat-container">
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#94A187] text-white'
                  : 'bg-white/60 text-[#4A5D45] border border-[#94A187]/20'
              }`}
            >
              {msg.role === 'user' ? '🧑 ' : '🌿 '}
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#94A187]/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind... 💭"
            className="input-primary flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary"
          >
            {isLoading ? '⏳' : '✉️'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent; 