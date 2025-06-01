import React from 'react';
import { usePoemStore } from '../../store/poemStore';
import { motion } from 'framer-motion';
import { History, User, Sparkles } from 'lucide-react';

export const RevisionHistory: React.FC = () => {
  const { currentPoem } = usePoemStore();
  
  if (!currentPoem || !currentPoem.revisions || currentPoem.revisions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <History className="mx-auto mb-2" />
        <p>No revision history yet</p>
      </div>
    );
  }
  
  return (
    <div className="p-2">
      <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
        <History size={16} className="mr-2" />
        Revision History
      </h3>
      
      <div className="space-y-3">
        {currentPoem.revisions
          .slice()
          .reverse()
          .map((revision, index) => (
            <motion.div
              key={revision.id}
              className={`p-3 rounded-lg border ${
                revision.author === 'ai' 
                  ? 'border-secondary-200 bg-secondary-50'
                  : 'border-gray-200 bg-white'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {revision.author === 'ai' ? (
                    <Sparkles size={14} className="text-secondary-500 mr-1" />
                  ) : (
                    <User size={14} className="text-gray-500 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {revision.author === 'ai' ? 'AI' : 'You'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(revision.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="text-xs font-serif whitespace-pre-wrap line-clamp-3 text-gray-700">
                {revision.content}
              </div>
              
              <button 
                className="mt-1 text-xs text-primary-600 hover:underline"
                onClick={() => usePoemStore.getState().updatePoemContent(revision.content)}
              >
                Restore this version
              </button>
            </motion.div>
          ))}
      </div>
    </div>
  );
};