// File: src/components/PullRequestReviewModal.tsx

import React, { useState } from 'react';
import { Button } from './ui/Button'; // Assuming your Button component path
import { MessageSquare, Users, Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge'; // Assuming your Badge component path

// IMPORTANT: Ensure these interfaces are consistent with src/store/poemStore.ts and src/store/pullrequeststore.tsx
// Ideally, import them from a shared types file (e.g., ../types/index.ts)
export interface Poem {
  id: string;
  title: string;
  content: string;
  form: string;
  tone: string;
  isPublished: boolean;
  isPublic: boolean;
  allowCollaboration: boolean;
  description?: string;
  publishedAt?: string;
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  author: {
    name: string;
  };
  createdAt: string;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
}

interface PullRequestReviewModalProps {
  pullRequest: PullRequest;
  poem: Poem | null; // The original poem being reviewed
  onClose: () => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment?: string) => void;
  onAddComment: (comment: string) => void;
}

export const PullRequestReviewModal: React.FC<PullRequestReviewModalProps> = ({
  pullRequest,
  poem, // The original poem (not the PR's proposed changes)
  onClose,
  onApprove,
  onReject,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  // Helper functions for status icons and colors (copied from CreatePage for self-containment)
  const getStatusIcon = () => {
    switch (pullRequest.status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'approved':
        return <Check className="text-green-600" size={16} />;
      case 'rejected':
        return <X className="text-red-600" size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (pullRequest.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-lg transform transition-all sm:my-8 sm:w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          {getStatusIcon()} {pullRequest.title}
          <Badge variant="outline" className="text-xs">
            #{pullRequest.id.slice(-6)}
          </Badge>
        </h2>
        <p className="text-gray-600 mb-4">{pullRequest.description}</p>

        {/* Original Poem Content (for comparison, if needed) */}
        {poem && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Original Poem: {poem.title}</h3>
            <div className="text-sm text-gray-700 max-h-20 overflow-y-auto whitespace-pre-wrap">
              {poem.content || 'No content available for original poem.'}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6 mb-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare size={18} /> Comments ({pullRequest.comments?.length || 0})
          </h3>
          {pullRequest.comments && pullRequest.comments.length > 0 ? (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {pullRequest.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-100 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-gray-800">{comment.author}</p>
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
          <div className="mt-4 flex gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button
            onClick={() => onApprove(pullRequest.id, commentText)}
            className="bg-green-600 hover:bg-green-700"
            disabled={pullRequest.status !== 'pending'} // Disable if not pending
          >
            Approve & Merge
          </Button>
          <Button
            variant="outline"
            onClick={() => onReject(pullRequest.id, commentText)}
            disabled={pullRequest.status !== 'pending'} // Disable if not pending
          >
            Reject
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
