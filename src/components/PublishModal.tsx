// File: src/components/PublishModal.tsx

import React, { useState } from 'react';
import { Button } from './ui/Button'; // Assuming your Button component path
import { AlertCircle, Eye, EyeOff, Users, Share2 } from 'lucide-react';

// IMPORTANT: Ensure this Poem interface is consistent with src/store/poemStore.ts
// Ideally, import it from a shared types file (e.g., ../types or ../store/poemStore)
export interface Poem {
  id: string;
  title: string;
  content: string;
  form: string;
  tone: string;
  isPublished: boolean;
  isPublic: boolean;
  allowCollaboration: boolean;
  description?: string; // <--- ADDED THIS to match poemStore.ts
  publishedAt?: string; // <--- ADDED THIS to match poemStore.ts
  // Add any other properties defined in your Poem type in poemStore.ts
}

interface PublishModalProps {
  poem: Poem | null;
  onClose: () => void;
  // onPublish is now expected to be an async function as it handles loading/error states
  onPublish: (data: { isPublic: boolean; allowCollaboration: boolean; description?: string }) => Promise<void>;
}

export const PublishModal: React.FC<PublishModalProps> = ({ poem, onClose, onPublish }) => {
  // Initialize states with existing poem data or defaults
  const [isPublic, setIsPublic] = useState(poem?.isPublic ?? false); // Use nullish coalescing for better default handling
  const [allowCollaboration, setAllowCollaboration] = useState(poem?.allowCollaboration ?? false);
  const [description, setDescription] = useState(poem?.description || ''); // <--- INITIALIZE WITH EXISTING DESCRIPTION
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If poem is null, don't render the modal
  if (!poem) return null;

  const handlePublish = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      await onPublish({
        isPublic,
        allowCollaboration,
        description: description.trim() || undefined // Pass description only if not empty
      });
      onClose(); // Close modal on successful publish
    } catch (err: any) { // Use 'any' for error to handle various types
      setError(err.message || 'Failed to publish poem.'); // Display error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-lg transform transition-all sm:my-8 sm:w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Share2 size={20} className="text-blue-600" />
          {poem.isPublished ? 'Update Publication' : 'Publish Poem'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Poem Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{poem.title}</h3>
          <div className="text-sm text-gray-600 mb-2">
            {poem.form} • {poem.tone}
          </div>
          {/* Display existing description if any */}
          {poem.description && (
            <div className="text-xs text-gray-500 italic mb-2">
              <span className="font-medium">Original Description:</span> {poem.description}
            </div>
          )}
          <div className="text-sm text-gray-700 max-h-20 overflow-y-auto whitespace-pre-wrap">
            {poem.content || 'No content yet...'}
          </div>
        </div>

        {/* Publishing Options */}
        <div className="space-y-3 mb-4">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
            <div className="flex items-center gap-3">
              {isPublic ? <Eye size={18} className="text-blue-600" /> : <EyeOff size={18} className="text-gray-400" />}
              <div>
                <div className="font-medium text-gray-900">Make Public</div>
                <div className="text-xs text-gray-600">
                  {isPublic ? 'Visible in the Explore page for discovery.' : 'Only you will be able to see this poem.'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-colors duration-200 ease-in-out"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
            <div className="flex items-center gap-3">
              <Users size={18} className={allowCollaboration ? "text-green-600" : "text-gray-400"} />
              <div>
                <div className="font-medium text-gray-900">Allow Collaboration</div>
                <div className="text-xs text-gray-600">
                  {allowCollaboration ? 'Other poets can suggest edits via pull requests.' : 'No collaboration allowed on this poem.'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowCollaboration}
              onChange={(e) => setAllowCollaboration(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300 transition-colors duration-200 ease-in-out"
            />
          </label>
        </div>

        {/* Optional Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description or note about this poem (e.g., inspiration, themes, or goals for collaboration)..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            maxLength={200}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {description.length}/200 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex-1 py-2.5 text-base font-semibold"
          >
            {isLoading ? (poem.isPublished ? 'Updating...' : 'Publishing...') : (poem.isPublished ? 'Update Settings' : 'Publish Poem')}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="py-2.5 text-base font-semibold"
          >
            Cancel
          </Button>
        </div>

        {/* Publishing Info */}
        <div className="text-xs text-gray-500 pt-4 mt-4 border-t border-gray-200">
          <p className="mb-1 flex items-center gap-1">📚 Your poem will always be saved in your **My Poems** section.</p>
          {isPublic && <p className="mb-1 flex items-center gap-1">🌍 Public poems will also appear in the **Explore** page for wider discovery.</p>}
          {allowCollaboration && <p className="flex items-center gap-1">🤝 Enabling collaboration allows other poets to suggest improvements via **pull requests**.</p>}
        </div>
      </div>
    </div>
  );
};
