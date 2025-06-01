// src/store/pullrequeststore.tsx

import { create } from 'zustand';
import { PullRequest, PullRequestCreate, PullRequestUpdateStatus, PullRequestComment } from '../types'; // Adjust path if needed

interface PullRequestState {
  pullRequests: PullRequest[];
  loading: boolean;
  error: string | null;
  fetchPullRequestsForPoem: (poemId: string) => Promise<void>;
  createPullRequest: (prData: PullRequestCreate) => Promise<PullRequest | null>;
  updatePullRequestStatus: (prId: string, statusUpdate: PullRequestUpdateStatus) => Promise<void>;
  addCommentToPullRequest: (prId: string, commentText: string, authorName: string) => Promise<void>;
}

export const usePullRequestStore = create<PullRequestState>((set, get) => ({
  pullRequests: [],
  loading: false,
  error: null,

  fetchPullRequestsForPoem: async (poemId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/poems/${poemId}/pull_requests`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch pull requests');
      }
      const data: PullRequest[] = await response.json();
      set({ pullRequests: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching pull requests:', err);
      set({ error: err.message || 'An unknown error occurred while fetching pull requests.', loading: false });
    }
  },

  createPullRequest: async (prData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pull_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your backend requires it
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create pull request');
      }

      const newPr: PullRequest = await response.json();
      set((state) => ({
        pullRequests: [...state.pullRequests, newPr],
        loading: false,
      }));
      return newPr;
    } catch (err: any) {
      console.error('Error creating pull request:', err);
      set({ error: err.message || 'An unknown error occurred while creating pull request.', loading: false });
      return null;
    }
  },

  updatePullRequestStatus: async (prId, statusUpdate) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pull_requests/${prId}/${statusUpdate.status}`, { // /approve or /reject
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${statusUpdate.status} pull request`);
      }

      const updatedPr: PullRequest = await response.json();
      set((state) => ({
        pullRequests: state.pullRequests.map((pr) =>
          pr.id === prId ? updatedPr : pr
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error(`Error updating pull request status to ${statusUpdate.status}:`, err);
      set({ error: err.message || `An unknown error occurred while updating pull request status.`, loading: false });
    }
  },

  addCommentToPullRequest: async (prId, commentText, authorName) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pull_requests/${prId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText, author_name: authorName }), // Match backend expected body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add comment');
      }

      const updatedPr: PullRequest = await response.json(); // Backend should return the updated PR
      set((state) => ({
        pullRequests: state.pullRequests.map((pr) =>
          pr.id === prId ? updatedPr : pr
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error adding comment to pull request:', err);
      set({ error: err.message || 'An unknown error occurred while adding comment.', loading: false });
    }
  },
}));