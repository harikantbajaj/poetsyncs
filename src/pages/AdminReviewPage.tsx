// src/pages/AdminReviewPage.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';

type PullRequest = {
  id: string;
  poem_id: string;
  proposed_content: string;
  author_id: string;
  status: string;
  created_at: string;
};

export const AdminReviewPage: React.FC = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPullRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pull-requests?status=pending');
      if (!res.ok) throw new Error('Failed to fetch pull requests');
      const data = await res.json();
      setPullRequests(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching pull requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPullRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/pull-request/${id}/${action}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.detail || 'Action failed');
      }
      await fetchPullRequests(); // refresh list after action
    } catch (err: any) {
      setError(err.message || 'Error processing action');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading pull requests...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (pullRequests.length === 0) return <p className="text-center mt-20">No pending pull requests.</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-serif font-bold mb-6">Pending Pull Requests</h1>
      <ul className="space-y-6">
        {pullRequests.map((pr) => (
          <li
            key={pr.id}
            className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white"
          >
            <p><strong>Poem ID:</strong> {pr.poem_id}</p>
            <p><strong>Author ID:</strong> {pr.author_id}</p>
            <p><strong>Proposed Edit:</strong></p>
            <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">{pr.proposed_content}</pre>
            <p className="text-sm text-gray-500 mt-1">Submitted at: {new Date(pr.created_at).toLocaleString()}</p>

            <div className="mt-4 flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleAction(pr.id, 'approve')}
                disabled={processingId === pr.id}
              >
                {processingId === pr.id ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction(pr.id, 'reject')}
                disabled={processingId === pr.id}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
