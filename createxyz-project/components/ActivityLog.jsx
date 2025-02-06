"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ActivityLog = ({ userId }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/activity/log');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'meditation': return '🧘‍♀️';
      case 'breathing': return '🫁';
      case 'chat': return '💭';
      case 'journal': return '📔';
      default: return '📝';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif text-[#4A5D45] mb-4">Activity History</h2>
      
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-[#7C8B74] italic">No activities recorded yet</p>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="p-4 bg-white/60 rounded-lg border border-[#94A187]/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getActivityIcon(log.type)}</span>
                <div className="flex-1">
                  <h3 className="text-[#4A5D45] capitalize">{log.type}</h3>
                  <p className="text-sm text-[#7C8B74]">{formatDate(log.createdAt)}</p>
                  {log.duration && (
                    <p className="text-sm text-[#7C8B74]">Duration: {log.duration} minutes</p>
                  )}
                </div>
              </div>
              {log.details && (
                <div className="mt-2 text-sm text-[#6B4F3D]">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 