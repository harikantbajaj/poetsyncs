import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { usePoemStore } from '../../store/poemStore';
import { motion } from 'framer-motion';

type PullRequest = {
  id: number;
  poem_id: number;
  new_content: string;
  contributor: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export const PoemCollaborationPanel: React.FC = () => {
  const { currentPoem } = usePoemStore();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [suggestionText, setSuggestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPullRequests = async () => {
    try {
      const response = await axios.get<PullRequest[]>('/pull-requests');
      if (currentPoem) {
        setPullRequests(response.data.filter(pr => pr.poem_id === Number(currentPoem.id)));
      }
    } catch (error) {
      console.error('Failed to fetch pull requests:', error);
    }
  };

  const submitSuggestion = async () => {
    if (!suggestionText.trim() || !currentPoem) return;
    setSubmitting(true);
    try {
      await axios.post('/pull-requests', {
        id: Date.now(), // simple unique ID for demo
        poem_id: currentPoem.id,
        new_content: suggestionText,
        contributor: 'guest',
        status: 'pending'
      });
      setSuggestionText('');
      await fetchPullRequests();
    } catch (error) {
      console.error('Failed to submit pull request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updatePullRequestStatus = async (pr_id: number, action: 'accept' | 'reject') => {
    try {
      await axios.post(`/pull-requests/${pr_id}/${action}`);
      await fetchPullRequests();
    } catch (error) {
      console.error(`Failed to ${action} pull request:`, error);
    }
  };

  useEffect(() => {
    if (currentPoem) {
      fetchPullRequests();
    }
  }, [currentPoem]);

  if (!currentPoem) {
    return (
      <div className="text-gray-500 text-center py-6">
        Select or create a poem to collaborate on suggestions.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-serif font-semibold mb-2">Suggest an Edit</h2>
      <TextArea
        value={suggestionText}
        onChange={(e) => setSuggestionText(e.target.value)}
        placeholder="Propose a change to this poem..."
        className="mb-2"
      />
      <Button 
        onClick={submitSuggestion} 
        isLoading={submitting}
        disabled={submitting || !suggestionText.trim()}
      >
        Submit Suggestion
      </Button>

      <hr className="my-6" />

      <h3 className="text-lg font-serif font-medium mb-3">Pull Requests</h3>
      {pullRequests.length === 0 ? (
        <p className="text-sm text-gray-500">No pull requests for this poem yet.</p>
      ) : (
        <ul className="space-y-4">
          {pullRequests.map((pr) => (
            <motion.li 
              key={pr.id} 
              className="bg-gray-50 p-3 rounded-md shadow-sm border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="mb-2 font-mono text-sm whitespace-pre-wrap">{pr.new_content}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>By: {pr.contributor} • Status: <strong>{pr.status}</strong></span>
                {pr.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updatePullRequestStatus(pr.id, 'accept')}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => updatePullRequestStatus(pr.id, 'reject')}>Reject</Button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};
