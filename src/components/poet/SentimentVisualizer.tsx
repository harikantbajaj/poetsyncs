import React, { useEffect, useState } from 'react';
import { SentimentAnalysis } from '../../types';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface SentimentVisualizerProps {
  text: string;
}

// Mock function that would be replaced with actual sentiment analysis API call
const mockAnalyzeSentiment = (text: string): SentimentAnalysis => {
  // This is a simplified mock that returns random values
  // In a real implementation, this would call an NLP service API
  if (!text.trim()) {
    return {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      love: 0
    };
  }
  
  const baseValue = Math.random() * 0.5;
  
  return {
    joy: baseValue + Math.random() * 0.5,
    sadness: baseValue + Math.random() * 0.5,
    anger: baseValue * Math.random() * 0.3,
    fear: baseValue * Math.random() * 0.3,
    surprise: baseValue * Math.random() * 0.4,
    love: baseValue + Math.random() * 0.5
  };
};

export const SentimentVisualizer: React.FC<SentimentVisualizerProps> = ({ text }) => {
  const [sentiment, setSentiment] = useState<SentimentAnalysis>({
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    love: 0
  });
  
  useEffect(() => {
    // Debounce the analysis to avoid too many calculations
    const timer = setTimeout(() => {
      if (text.trim()) {
        const newSentiment = mockAnalyzeSentiment(text);
        setSentiment(newSentiment);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [text]);
  
  const emotionColors = {
    joy: 'rgb(250, 204, 21)',
    sadness: 'rgb(96, 165, 250)',
    anger: 'rgb(239, 68, 68)',
    fear: 'rgb(168, 85, 247)',
    surprise: 'rgb(234, 179, 8)',
    love: 'rgb(236, 72, 153)'
  };
  
  const isEmpty = Object.values(sentiment).every(value => value === 0);
  
  if (isEmpty) {
    return null;
  }
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
        <Lightbulb size={16} className="mr-2" />
        Emotional Tones
      </h3>
      
      <div className="space-y-3">
        {Object.entries(sentiment).map(([emotion, value]) => (
          <div key={emotion} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="capitalize">{emotion}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: emotionColors[emotion as keyof typeof emotionColors],
                  width: `${value * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};