// File: src/pages/CreatePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Share2,
  Eye,
  EyeOff,
  Save,
  Users,
  GitPullRequest,
  GitMerge,
  GitBranch,
  Clock,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  UserCheck,
  Calendar,
} from 'lucide-react';

import { StyleSelector } from '../components/ui/StyleSelector';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';

// --- Import REAL Zustand Stores and Types ---
import { usePoemStore, Poem } from '../store/poemStore';
import { useAuthStore } from '../store/authStore';

// Mock data for poetic forms and tones (these can stay local)
const poeticForms = [
  { value: 'sonnet', label: 'Sonnet', description: 'A 14-line poem with a specific rhyme scheme' },
  { value: 'haiku', label: 'Haiku', description: 'A traditional Japanese three-line poem' },
  { value: 'free-verse', label: 'Free Verse', description: 'Poetry without regular rhyme or meter' },
  { value: 'limerick', label: 'Limerick', description: 'A humorous five-line poem with AABBA rhyme' },
];

const poeticTones = [
  { value: 'romantic', label: 'Romantic', description: 'Expressing love and affection' },
  { value: 'melancholic', label: 'Melancholic', description: 'Reflective and somewhat sad' },
  { value: 'joyful', label: 'Joyful', description: 'Happy and uplifting' },
  { value: 'contemplative', label: 'Contemplative', 'description': 'Thoughtful and meditative' },
];

// Types
type PoeticForm = 'sonnet' | 'haiku' | 'free-verse' | 'limerick';
type PoeticTone = 'romantic' | 'melancholic' | 'joyful' | 'contemplative';

interface PullRequest {
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

// --- Mock usePullRequestStore (you'll likely replace this with a real Zustand store too) ---
const usePullRequestStore = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);

  const fetchPullRequests = useCallback(async (poemId: string) => {
    console.log('Fetching mock pull requests for poem:', poemId);
    setPullRequests([
      {
        id: '1',
        title: 'Improve metaphor in line 3',
        description: 'Suggested improvement to make the metaphor more vivid',
        status: 'pending',
        author: { name: 'Jane Smith' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        comments: [],
      },
      {
        id: '2',
        title: 'Add a new stanza about nature',
        description: 'Expanding on the theme with a nature-inspired stanza',
        status: 'pending',
        author: { name: 'Peter Green' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        comments: [{ id: 'c1', text: 'Great idea!', author: 'John Doe', createdAt: new Date().toISOString() }],
      },
    ]);
  }, []);

  return {
    pullRequests,
    fetchPullRequests,
    approvePullRequest: async (pullRequestId: string, comment?: string) => {
      console.log(`Approving mock pull request ${pullRequestId} with comment: ${comment || 'N/A'}`);
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === pullRequestId
            ? { ...pr, status: 'approved' as const, comments: comment ? [...(pr.comments || []), { id: Date.now().toString(), text: comment, author: 'John Doe', createdAt: new Date().toISOString() }] : pr.comments }
            : pr
        )
      );
    },
    rejectPullRequest: async (pullRequestId: string, comment?: string) => {
      console.log(`Rejecting mock pull request ${pullRequestId} with comment: ${comment || 'N/A'}`);
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === pullRequestId
            ? { ...pr, status: 'rejected' as const, comments: comment ? [...(pr.comments || []), { id: Date.now().toString(), text: comment, author: 'John Doe', createdAt: new Date().toISOString() }] : pr.comments }
            : pr
        )
      );
    },
    addComment: async (pullRequestId: string, comment: string) => {
      console.log(`Adding mock comment to PR ${pullRequestId}: ${comment}`);
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === pullRequestId
            ? { ...pr, comments: [...(pr.comments || []), { id: Date.now().toString(), text: comment, author: 'John Doe', createdAt: new Date().toISOString() }] }
            : pr
        )
      );
    },
  };
};

// --- Updated PoemEditor to be controlled by Zustand store ---
const PoemEditor: React.FC<{
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}> = ({ title, content, onTitleChange, onContentChange }) => (
  <div className="space-y-4">
    <input
      type="text"
      placeholder="Enter poem title..."
      className="w-full text-xl font-serif border-none outline-none bg-transparent"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
    />
    <textarea
      placeholder="Write your poem here..."
      rows={12}
      className="w-full border border-gray-300 rounded-lg p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
    />
  </div>
);

// --- Updated PublishModal to include description ---
const PublishModal: React.FC<{
  poem: Poem | null;
  onClose: () => void;
  onPublish: (data: { isPublic: boolean; allowCollaboration: boolean; description?: string }) => void;
}> = ({ poem, onClose, onPublish }) => {
  const [isPublic, setIsPublic] = useState(poem?.isPublic || false);
  const [allowCollaboration, setAllowCollaboration] = useState(poem?.allowCollaboration || false);
  const [description, setDescription] = useState(poem?.description || '');

  const handlePublishClick = () => {
    onPublish({ isPublic, allowCollaboration, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Publish Poem</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="poem-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional, for explore page)
            </label>
            <textarea
              id="poem-description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary for your poem..."
            ></textarea>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span>Make public (visible on Explore page)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={allowCollaboration}
              onChange={(e) => setAllowCollaboration(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span>Allow collaboration (others can suggest edits)</span>
          </label>
          <div className="flex gap-2 pt-4">
            <Button onClick={handlePublishClick}>Publish</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PullRequestReviewModal: React.FC<{
  pullRequest: PullRequest;
  poem: Poem | null;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment?: string) => void;
  onAddComment: (comment: string) => void;
}> = ({ pullRequest, onClose, onApprove, onReject, onAddComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{pullRequest.title}</h2>
        <p className="text-gray-600 mb-4">{pullRequest.description}</p>

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
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-blue-500"
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
          >
            Approve & Merge
          </Button>
          <Button variant="outline" onClick={() => onReject(pullRequest.id, commentText)}>
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

// --- Placeholder Components for PoemCollaborationPanel, RevisionHistory ---
// (SentimentVisualizer removed)

const PoemCollaborationPanel: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500">
      <h3 className="font-semibold text-lg mb-2">Collaboration Tools</h3>
      <p>Features for inviting collaborators and managing contributions will appear here.</p>
    </div>
  );
};

const RevisionHistory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500">
      <h3 className="font-semibold text-lg mb-2">Revision History</h3>
      <p>Track changes and revert to previous versions of your poem.</p>
    </div>
  );
};

// --- End Placeholder Components ---

export const CreatePage: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'writing'>('setup');
  const [selectedForm, setSelectedForm] = useState<PoeticForm>('sonnet');
  const [selectedTone, setSelectedTone] = useState<PoeticTone>('romantic');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPullRequests, setShowPullRequests] = useState(false);
  const [selectedPullRequest, setSelectedPullRequest] = useState<PullRequest | null>(null);
  const [pullRequestFilter, setPullRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // --- Use the REAL Zustand stores ---
  const { currentPoem, createNewPoem, savePoem, publishPoem, mergePullRequest, updateTitle, updatePoemContent } = usePoemStore();
  const { user } = useAuthStore();

  // --- Mock usePullRequestStore (you'll likely replace this with a real Zustand store too) ---
  const {
    pullRequests,
    fetchPullRequests,
    approvePullRequest,
    rejectPullRequest,
    addComment,
  } = usePullRequestStore();

  // Fetch pull requests when poem changes or publication status changes
  useEffect(() => {
    if (currentPoem?.id && currentPoem.isPublished) {
      fetchPullRequests(currentPoem.id);
    }
  }, [currentPoem?.id, currentPoem?.isPublished, fetchPullRequests]);

  const handleStartWriting = () => {
    if (user?.name && user?.email) {
      createNewPoem(selectedForm, selectedTone, { name: user.name, email: user.email });
      setStep('writing');
    } else {
      alert('Please log in to create a poem. User email is required.');
    }
  };

  const handleSavePoem = async () => {
    if (currentPoem) {
      await savePoem(currentPoem);
      alert('Poem saved locally!');
    }
  };

  const handlePublishPoem = async (publishData: {
    isPublic: boolean;
    allowCollaboration: boolean;
    description?: string;
  }) => {
    if (currentPoem && user?.email && user?.name) {
      await publishPoem(user.email, user.name, publishData);
      setShowPublishModal(false);
      alert('Poem published successfully!');
    } else {
      alert('Could not publish poem. Make sure you are logged in and the poem has content.');
    }
  };

  const handleApprovePullRequest = async (pullRequestId: string, comment?: string) => {
    await approvePullRequest(pullRequestId, comment);
    if (currentPoem) {
      await mergePullRequest(currentPoem.id, pullRequestId);
    }
    setSelectedPullRequest(null);
  };

  const handleRejectPullRequest = async (pullRequestId: string, comment?: string) => {
    await rejectPullRequest(pullRequestId, comment);
    setSelectedPullRequest(null);
  };

  const filteredPullRequests = pullRequests.filter(pr => {
    if (pullRequestFilter === 'all') return true;
    return pr.status === pullRequestFilter;
  });

  const pendingPRCount = pullRequests.filter(pr => pr.status === 'pending').length;

  const SetupStep = () => (
    <section className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-gray-900">
          Begin Your Poetic Journey
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Choose a poetic form and tone to set the stage. Create, collaborate, and share your poetry with the world.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
        <StyleSelector
          options={poeticForms}
          value={selectedForm}
          onChange={(value) => setSelectedForm(value as PoeticForm)}
          label="Poetic Form"
        />
        <StyleSelector
          options={poeticTones}
          value={selectedTone}
          onChange={(value) => setSelectedTone(value as PoeticTone)}
          label="Tone"
        />

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <GitBranch className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-blue-900">Git-Style Poetry Collaboration</h3>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <p className="flex items-center gap-2">
              <GitPullRequest size={16} />
              Other poets can suggest edits through pull requests
            </p>
            <p className="flex items-center gap-2">
              <UserCheck size={16} />
              You maintain full control - approve or reject changes
            </p>
            <p className="flex items-center gap-2">
              <GitMerge size={16} />
              Approved changes are merged into your poem's history
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            size="lg"
            onClick={handleStartWriting}
            rightIcon={<ArrowRight size={18} />}
          >
            Start Writing
          </Button>
        </div>
      </div>
    </section>
  );

  const WritingStep = () => (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <AnimatedCard delay={0}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {currentPoem?.title || 'Untitled Poem'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentPoem?.form || selectedForm} • {currentPoem?.tone || selectedTone} • by {currentPoem?.author?.name || user?.name || 'Guest'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentPoem?.isPublished && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPullRequests(!showPullRequests)}
                    leftIcon={<GitPullRequest size={16} />}
                  >
                    Pull Requests
                  </Button>
                  {pendingPRCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 min-w-5 h-5 text-xs"
                    >
                      {pendingPRCount}
                    </Badge>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePoem}
                leftIcon={<Save size={16} />}
              >
                Save
              </Button>
              <Button
                size="sm"
                onClick={() => setShowPublishModal(true)}
                leftIcon={currentPoem?.isPublished ? <Eye size={16} /> : <Share2 size={16} />}
              >
                {currentPoem?.isPublished ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>

          {currentPoem?.isPublished && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentPoem.isPublic ? (
                    <>
                      <Eye className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-800">
                        Published & Public
                      </span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-800">
                        Published (Private)
                      </span>
                    </>
                  )}
                  {currentPoem.allowCollaboration && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Users size={12} className="mr-1" />
                      Open for Collaboration
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-green-700">
                  Last updated: {new Date(currentPoem.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <PoemEditor
            title={currentPoem?.title || ''}
            content={currentPoem?.content || ''}
            onTitleChange={updateTitle}
            onContentChange={updatePoemContent}
          />
        </AnimatedCard>

        {showPullRequests && currentPoem?.isPublished && (
          <AnimatedCard delay={0.15}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GitPullRequest size={20} />
                  Pull Requests
                </h3>
                <div className="flex gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={pullRequestFilter === filter ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPullRequestFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter === 'pending' && pendingPRCount > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          {pendingPRCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredPullRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No {pullRequestFilter === 'all' ? '' : pullRequestFilter} pull requests yet</p>
                  {pullRequestFilter === 'all' && (
                    <p className="text-sm mt-2">
                      When your poem is discovered, collaborators can suggest improvements
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPullRequests.map((pr) => (
                    <PullRequestCard
                      key={pr.id}
                      pullRequest={pr}
                      onReview={() => setSelectedPullRequest(pr)}
                    />
                  ))}
                </div>
              )}
            </div>
          </AnimatedCard>
        )}

        <AnimatedCard delay={0.2}>
          <PoemCollaborationPanel />
        </AnimatedCard>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <AnimatedCard delay={0.3}>
          <RevisionHistory />
        </AnimatedCard>

        {currentPoem?.isPublished && (
          <AnimatedCard delay={0.5}>
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Users size={18} />
                Collaboration Insights
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="font-bold text-lg text-blue-900">
                    {pullRequests.length}
                  </div>
                  <div className="text-blue-700">Total Pull Requests</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="font-bold text-lg text-yellow-900">
                    {pendingPRCount}
                  </div>
                  <div className="text-yellow-700">Awaiting Review</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-bold text-lg text-green-900">
                    {pullRequests.filter(pr => pr.status === 'approved').length}
                  </div>
                  <div className="text-green-700">Merged Changes</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="font-bold text-lg text-purple-900">
                    {currentPoem.collaborators?.length || 0}
                  </div>
                  <div className="text-purple-700">Contributors</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}
      </div>
    </section>
  );

  const PullRequestCard: React.FC<{
    pullRequest: PullRequest;
    onReview: () => void;
  }> = ({ pullRequest, onReview }) => {
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
      <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <h4 className="font-medium text-gray-900">
                {pullRequest.title}
              </h4>
              <Badge variant="outline" className="text-xs">
                #{pullRequest.id.slice(-6)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {pullRequest.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={12} />
                by {pullRequest.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(pullRequest.createdAt).toLocaleDateString()}
              </span>
              {pullRequest.comments && pullRequest.comments.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  {pullRequest.comments.length} comments
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onReview}
            >
              Review
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const AnimatedCard: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 opacity-0 animate-fade-in" style={{ animationDelay: `${delay * 100}ms` }}>
      {children}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          {step === 'setup' ? <SetupStep /> : <WritingStep />}
        </div>
      </div>

      {showPublishModal && (
        <PublishModal
          poem={currentPoem}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublishPoem}
        />
      )}

      {selectedPullRequest && (
        <PullRequestReviewModal
          pullRequest={selectedPullRequest}
          poem={currentPoem}
          onClose={() => setSelectedPullRequest(null)}
          onApprove={handleApprovePullRequest}
          onReject={handleRejectPullRequest}
          onAddComment={(comment: string) => addComment(selectedPullRequest.id, comment)}
        />
      )}
    </>
  );
};