// src/pages/PoemDetailPage.tsx (Highly abbreviated for focus on PR functionality)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePoemStore } from '../store/poemStore';
import { usePullRequestStore } from '../store/pullrequeststore'; // Import the new store
import { useAuthStore } from '../store/authStore'; // To get current user info
import { Button } from '../components/ui/Button';
import { SuggestEditModal } from '../components/SuggestEditModal'; // Import the modal
import { Share2, Edit, GitPullRequest } from 'lucide-react'; // Example icons

export const PoemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPoem, loadPoemById } = usePoemStore(); // Assuming loadPoemById sets currentPoem
  const { user } = useAuthStore(); // Get logged-in user info
  const { createPullRequest, loading: prLoading, error: prError } = usePullRequestStore();

  const [showSuggestEditModal, setShowSuggestEditModal] = useState(false);
  const [poemLoaded, setPoemLoaded] = useState(false); // Track if poem is loaded

  useEffect(() => {
    if (id) {
      loadPoemById(id);
      setPoemLoaded(true); // Indicate loading has started
    }
  }, [id, loadPoemById]);

  // Optionally, you might want to fetch pull requests related to this poem here
  // const { fetchPullRequestsForPoem, pullRequests } = usePullRequestStore();
  // useEffect(() => {
  //   if (currentPoem?.id && currentPoem.isPublished) {
  //     fetchPullRequestsForPoem(currentPoem.id);
  //   }
  // }, [currentPoem?.id, currentPoem?.isPublished, fetchPullRequestsForPoem]);


  const handleSuggestEdit = async (prData: Parameters<typeof createPullRequest>[0]) => {
    // You'll need to combine prData with the actual user_id and user_name from your auth store
    if (!user) {
      alert('You must be logged in to suggest an edit.');
      return;
    }

    const fullPrData = {
      ...prData,
      author_id: user.id, // Assuming user.id exists
      author_name: user.name, // Assuming user.name exists
    };

    const newPr = await createPullRequest(fullPrData);
    if (newPr) {
      alert('Your edit suggestion has been submitted!');
    } else if (prError) {
      alert(`Failed to submit suggestion: ${prError}`);
    } else {
      alert('Failed to submit suggestion.');
    }
    setShowSuggestEditModal(false);
  };

  if (!poemLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading poem...</p>
      </div>
    );
  }

  if (!currentPoem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Poem not found or could not be loaded.</p>
      </div>
    );
  }

  // Determine if the "Suggest Edit" button should be visible
  const canSuggestEdit = currentPoem.isPublished && currentPoem.allowCollaboration && user && user.id !== currentPoem.author_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{currentPoem.title}</h1>
          <p className="text-md text-gray-700 whitespace-pre-wrap leading-relaxed">{currentPoem.content}</p>

          <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4 mt-4">
            <span>
              By <span className="font-medium text-gray-700">{currentPoem.author_name}</span> • {currentPoem.form} • {currentPoem.tone}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Share2 size={16} />}>Share</Button>
              {canSuggestEdit && (
                <Button
                  size="sm"
                  onClick={() => setShowSuggestEditModal(true)}
                  leftIcon={<GitPullRequest size={16} />}
                  disabled={prLoading}
                >
                  {prLoading ? 'Submitting...' : 'Suggest Edit'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuggestEditModal && currentPoem && (
        <SuggestEditModal
          poem={currentPoem}
          onClose={() => setShowSuggestEditModal(false)}
          onSubmit={handleSuggestEdit}
        />
      )}
    </div>
  );
};