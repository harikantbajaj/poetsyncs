// File: src/store/PullRequestContext.tsx

import React, { ReactNode } from 'react';
import { create } from 'zustand'; // Import create from zustand

// --- Type Definitions ---
// IMPORTANT: This PullRequest interface should be consistent across your project
// (e.g., with src/store/pullrequeststore.tsx and src/pages/CreatePage.tsx)
// I'm aligning it with the 'pending' | 'approved' | 'rejected' statuses.
export interface PullRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected'; // Updated status types for consistency
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  poemId: string;
  userId: string;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
}

// Define the interface for the Zustand store's state and actions
interface PullRequestZustandStore {
  pullRequests: PullRequest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPullRequests: (poemId: string) => Promise<void>;
  addPullRequest: (pr: PullRequest) => void; // Added for completeness, though API might handle creation
  updatePullRequest: (updatedPR: PullRequest) => void;
  approvePullRequest: (pullRequestId: string, comment?: string) => Promise<void>;
  rejectPullRequest: (pullRequestId: string, comment?: string) => Promise<void>;
  addComment: (pullRequestId: string, comment: string, author: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock API base URL - ensure this matches your backend API endpoint
const API_BASE = 'http://localhost:8000/api';

// Create the Zustand store
export const usePullRequestStore = create<PullRequestZustandStore>((set, get) => ({
  pullRequests: [],
  isLoading: false,
  error: null,

  /**
   * Fetches pull requests for a specific poem from a mock API.
   * In a real app, this would make an actual API call.
   * @param poemId The ID of the poem to fetch pull requests for.
   */
  fetchPullRequests: async (poemId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // --- Mock data for demonstration ---
      // In a real application, you would make an API call here:
      // const response = await fetch(`${API_BASE}/poems/${poemId}/pull-requests`);
      // if (!response.ok) throw new Error('Failed to fetch pull requests');
      // const data = await response.json();
      // set({ pullRequests: data, isLoading: false });

      const mockPullRequests: PullRequest[] = [
        {
          id: '1',
          title: 'Improve metaphor in line 3',
          description: 'Suggested improvement to make the metaphor more vivid and emotionally resonant.',
          status: 'pending',
          author: {
            id: 'user-jane',
            name: 'Jane Smith'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          poemId: poemId,
          userId: 'user-jane',
          comments: []
        },
        {
          id: '2',
          title: 'Fix rhythm in second stanza',
          description: 'The meter feels off in lines 6-8. This change maintains the flow while preserving meaning.',
          status: 'pending',
          author: {
            id: 'user-alice',
            name: 'Alice Johnson'
          },
          createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          poemId: poemId,
          userId: 'user-alice',
          comments: []
        },
        {
          id: '3',
          title: 'Suggest alternative ending',
          description: 'A more impactful closing for the poem, considering the emotional arc.',
          status: 'approved',
          author: {
            id: 'user-bob',
            name: 'Bob White'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          poemId: poemId,
          userId: 'user-bob',
          comments: [{ id: 'c1', text: 'Looks good!', author: 'John Doe', createdAt: new Date().toISOString() }]
        }
      ];
      set({ pullRequests: mockPullRequests, isLoading: false });

    } catch (err: any) {
      console.error("Error fetching pull requests:", err);
      set({ error: err.message || 'Failed to fetch pull requests.', isLoading: false });
      throw err;
    }
  },

  /**
   * Adds a new pull request to the store.
   * This might be used if pull requests are created client-side before API sync.
   * @param pr The pull request object to add.
   */
  addPullRequest: (pr: PullRequest) => {
    set(state => ({
      pullRequests: [...state.pullRequests, pr]
    }));
  },

  /**
   * Updates an existing pull request in the store.
   * @param updatedPR The updated pull request object.
   */
  updatePullRequest: (updatedPR: PullRequest) => {
    set(state => ({
      pullRequests: state.pullRequests.map(pr =>
        pr.id === updatedPR.id ? updatedPR : pr
      )
    }));
  },

  /**
   * Approves a specific pull request.
   * Simulates an API call and updates the status in the store.
   * @param pullRequestId The ID of the pull request to approve.
   * @param comment Optional comment to add upon approval.
   */
  approvePullRequest: async (pullRequestId: string, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call to update status on backend
      await new Promise(resolve => setTimeout(resolve, 300));
      // In a real app: await fetch(`${API_BASE}/pull-requests/${pullRequestId}/approve`, { method: 'POST', body: JSON.stringify({ comment }) });

      set((state) => ({
        pullRequests: state.pullRequests.map(pr =>
          pr.id === pullRequestId
            ? {
                ...pr,
                status: 'approved', // Update status to 'approved'
                comments: comment ? [...(pr.comments || []), { id: Date.now().toString(), text: comment, author: 'System/Reviewer', createdAt: new Date().toISOString() }] : pr.comments
              }
            : pr
        ),
        isLoading: false
      }));
      console.log(`Pull request ${pullRequestId} approved.`);
    } catch (err: any) {
      console.error("Error approving pull request:", err);
      set({ error: err.message || 'Failed to approve pull request.', isLoading: false });
      throw err;
    }
  },

  /**
   * Rejects a specific pull request.
   * Simulates an API call and updates the status in the store.
   * @param pullRequestId The ID of the pull request to reject.
   * @param comment Optional comment to add upon rejection.
   */
  rejectPullRequest: async (pullRequestId: string, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call to update status on backend
      await new Promise(resolve => setTimeout(resolve, 300));
      // In a real app: await fetch(`${API_BASE}/pull-requests/${pullRequestId}/reject`, { method: 'POST', body: JSON.stringify({ comment }) });

      set((state) => ({
        pullRequests: state.pullRequests.map(pr =>
          pr.id === pullRequestId
            ? {
                ...pr,
                status: 'rejected', // Update status to 'rejected'
                comments: comment ? [...(pr.comments || []), { id: Date.now().toString(), text: comment, author: 'System/Reviewer', createdAt: new Date().toISOString() }] : pr.comments
              }
            : pr
        ),
        isLoading: false
      }));
      console.log(`Pull request ${pullRequestId} rejected.`);
    } catch (err: any) {
      console.error("Error rejecting pull request:", err);
      set({ error: err.message || 'Failed to reject pull request.', isLoading: false });
      throw err;
    }
  },

  /**
   * Adds a comment to a specific pull request.
   * Simulates an API call and updates the comments array in the store.
   * @param pullRequestId The ID of the pull request to add a comment to.
   * @param comment The text of the comment.
   * @param author The author of the comment (e.g., current user's name).
   */
  addComment: async (pullRequestId: string, comment: string, author: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      // In a real app: await fetch(`${API_BASE}/pull-requests/${pullRequestId}/comments`, { method: 'POST', body: JSON.stringify({ comment, author }) });

      set((state) => ({
        pullRequests: state.pullRequests.map(pr =>
          pr.id === pullRequestId
            ? {
                ...pr,
                comments: [
                  ...(pr.comments || []),
                  {
                    id: Date.now().toString(),
                    text: comment,
                    author: author,
                    createdAt: new Date().toISOString()
                  }
                ]
              }
            : pr
        ),
        isLoading: false
      }));
      console.log(`Comment added to pull request ${pullRequestId}.`);
    } catch (err: any) {
      console.error("Error adding comment:", err);
      set({ error: err.message || 'Failed to add comment.', isLoading: false });
      throw err;
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// The PullRequestProvider component now simply wraps children,
// as Zustand hooks do not require a Provider for global access.
// This keeps the import path in App.tsx valid.
interface PullRequestProviderProps {
  children: ReactNode;
}

export const PullRequestProvider: React.FC<PullRequestProviderProps> = ({ children }) => {
  // No state or context value needed here, Zustand manages state directly.
  return <>{children}</>;
};
