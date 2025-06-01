// index.ts

export type PoeticForm = 'sonnet' | 'haiku' | 'free-verse' | 'limerick' | 'villanelle' | 'ghazal';
export type PoeticTone = 'melancholic' | 'romantic' | 'surrealist' | 'joyful' | 'contemplative' | 'dramatic' | 'mystical' | 'rebellious';

export interface Poem {
  id: string;
  title: string;
  content: string;
  form: PoeticForm;
  tone: PoeticTone;
  isPublished: boolean;
  isPublic: boolean;
  allowCollaboration: boolean;
  collaborators?: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  revisions?: PoemRevision[]; // Optional if not always present
}

export interface PoemRevision {
  id: string;
  content: string;
  timestamp: Date;
  author: 'user' | 'ai';
}

export interface SentimentAnalysis {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  love: number;
}

export interface StyleOption {
  id: PoeticForm | PoeticTone;
  name: string;
  description: string;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  author: User;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}
// src/types/index.ts (add/update this interface)

export interface Poem {
  id: string;
  title: string;
  content: string;
  author_id: string; // Match backend
  author_name: string; // Match backend
  is_public: boolean;
  is_published: boolean;
  allow_collaboration: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Add other fields from PoemResponse in main.py if they are relevant
  views?: number;
  likes?: number;
  shares?: number;
  // pullRequests is on the PoemModel in backend but usually fetched separately or not included in the main PoemResponse
  // pull_requests?: PullRequest[]; // Only if poem response includes nested PRs
}

export interface PullRequestComment {
  id: string;
  text: string;
  author_name: string; // Changed from 'author' to 'author_name' to match typical naming
  created_at: string;
}

export interface PullRequest {
  id: string;
  poem_id: string; // Link to the poem it's for
  original_content: string; // The content of the poem when PR was created
  proposed_content: string; // The suggested new content
  proposed_title?: string; // Optional suggested title change
  author_id: string;
  author_name: string;
  status: 'pending' | 'approved' | 'rejected'; // Match backend statuses
  created_at: string;
  updated_at: string; // For PR updates
}

// You might also want these for API requests
export interface PullRequestCreate {
  poem_id: string;
  original_content: string;
  proposed_content: string;
  proposed_title?: string;
  author_id: string;
  author_name: string;
}

export interface PullRequestUpdateStatus {
  status: 'approved' | 'rejected';
  comment?: string; // Optional comment when approving/rejecting
}