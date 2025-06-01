// src/components/SuggestEditModal.tsx

import React, { useState } from 'react';
import { Button } from './ui/Button'; // Adjust path if needed
import { PullRequestCreate, Poem } from '../types'; // Adjust path if needed

interface SuggestEditModalProps {
  poem: Poem; // The original poem being edited
  onClose: () => void;
  onSubmit: (prData: PullRequestCreate) => void;
}

export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({ poem, onClose, onSubmit }) => {
  const [proposedTitle, setProposedTitle] = useState(poem.title);
  const [proposedContent, setProposedContent] = useState(poem.content);
  // You might want to add a field for a 'description' or 'justification' for the PR
  const [justification, setJustification] = useState('');

  const handleSubmit = () => {
    if (!proposedContent.trim()) {
      alert('Proposed content cannot be empty.');
      return;
    }

    // Assuming you have the current user's ID and name available
    // You'll need to get this from your Auth store (e.g., useAuthStore().user.id)
    // For now, using placeholders:
    const currentUserId = 'mock-user-id'; // Replace with actual user ID from Auth store
    const currentUserName = 'Mock Collaborator'; // Replace with actual user name from Auth store

    onSubmit({
      poem_id: poem.id,
      original_content: poem.content, // Pass original content for backend comparison
      proposed_content: proposedContent,
      proposed_title: proposedTitle !== poem.title ? proposedTitle : undefined, // Only send if title changed
      author_id: currentUserId,
      author_name: currentUserName,
      // justification: justification, // Add if your backend PR schema supports it
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Suggest an Edit for "{poem.title}"</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="proposed-title" className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Title
            </label>
            <input
              id="proposed-title"
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              placeholder="Suggest a new title"
            />
          </div>
          <div>
            <label htmlFor="proposed-content" className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Content
            </label>
            <textarea
              id="proposed-content"
              rows={10}
              className="w-full border border-gray-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-blue-500"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              placeholder="Type your suggested changes here..."
            />
          </div>
          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1">
              Justification (Why this change?)
            </label>
            <textarea
              id="justification"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-blue-500"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain your proposed changes..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Submit Suggestion</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};