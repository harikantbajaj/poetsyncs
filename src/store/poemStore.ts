// src/store/poemStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Type Definitions ---
// Assuming these are strings for simplicity based on your usage
type PoeticForm = string;
type PoeticTone = string;

interface PoemRevision {
  id: string;
  content: string;
  timestamp: Date;
  author: 'user' | 'ai';
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  form: PoeticForm;
  tone: PoeticTone;
  createdAt: string;
  updatedAt: string;
  revisions?: PoemRevision[]; // Make revisions optional as it might not be present in initial API loads
  collaborators?: string[];
  isPublic: boolean;
  isPublished: boolean;
  allowCollaboration: boolean;
  author_id?: string; // Added for API consistency
  author_name?: string; // Added for API consistency
  publishedAt?: string; // Add publishedAt
  author?: { // Add author object based on previous discussions/snippets
    name: string;
    email: string;
  };
  stats?: { // Add stats object
    views: number;
    likes: number;
    shares: number;
  };
  description?: string; // Added for the PublishModal's description field
}

interface PoemState {
  currentPoem: Poem | null;
  myPoems: Poem[]; // Renamed from savedPoems for consistency and clarity
  explorePoems: Poem[];
  libraryPoems: Poem[]; // New list for poems in the user's library (published or saved)

  isGenerating: boolean;
  error: string | null;
  isLoading: boolean;

  // Actions
  createNewPoem: (form: PoeticForm, tone: PoeticTone, author: { name: string; email: string }) => void; // Added author parameter
  updatePoemContent: (content: string) => void;
  updateTitle: (title: string) => void;
  generateAICompletion: (prompt: string) => Promise<void>;
  saveRevision: (author: 'user' | 'ai', content: string) => void;
  savePoem: (poem?: Poem) => void; // Made poem optional for existing savePoem calls
  loadPoem: (id: string) => void;
  deletePoem: (id: string) => void;

  // API actions
  // Updated publishPoem signature to accept publishData directly,
  // matching the PublishModal component's onPublish signature.
  publishPoem: (userId: string, userName: string, publishData: { isPublic: boolean; allowCollaboration: boolean; description?: string }) => Promise<void>;
  loadExplorePoems: () => Promise<void>;
  loadUserPoems: (userId: string) => Promise<void>; // Will populate `myPoems`
  updatePoemVisibility: (isPublic: boolean) => void; // This might be used internally or for quick toggles, but publishPoem handles the main publish logic.
  mergePullRequest: (poemId: string, pullRequestId: string) => Promise<void>;

  // New actions for managing lists
  addToExplore: (poem: Poem) => void;
  addToLibrary: (poem: Poem) => void;
}

// Mock function to simulate AI
const mockGenerateCompletion = async (prompt: string, form: PoeticForm, tone: PoeticTone): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `${prompt}\n\nHere's an AI-generated continuation based on your ${form} with a ${tone} tone...`;
};

// API base URL
const API_BASE = 'http://localhost:8000/api';

export const usePoemStore = create<PoemState>()(
  persist(
    (set, get) => ({
      currentPoem: null,
      myPoems: [], // Replaces savedPoems as the primary list for user's own poems
      explorePoems: [],
      libraryPoems: [], // New state for poems visible in user's library (published or not)
      isGenerating: false,
      error: null,
      isLoading: false,

      createNewPoem: (form, tone, author) => { // Added author
        const newPoem: Poem = {
          id: Date.now().toString(),
          title: 'Untitled Poem',
          content: '',
          form,
          tone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          revisions: [],
          collaborators: ['user'],
          isPublic: false,
          isPublished: false,
          allowCollaboration: false,
          author: author, // Set author
          stats: { views: 0, likes: 0, shares: 0 } // Initialize stats
        };
        set({ currentPoem: newPoem });
        get().savePoem(newPoem); // Automatically save new poem to myPoems
      },

      updatePoemContent: (content) => {
        set(state => {
          if (!state.currentPoem) return state;
          const updatedPoem = {
            ...state.currentPoem,
            content,
            updatedAt: new Date().toISOString()
          };
          // Save revision only if content actually changed
          if (state.currentPoem.content !== content) {
            get().saveRevision('user', content);
          }
          return { currentPoem: updatedPoem };
        });
        get().savePoem(); // Save the updated currentPoem to local storage
      },

      updateTitle: (title) => {
        set(state => {
          if (!state.currentPoem) return state;
          const updatedPoem = {
            ...state.currentPoem,
            title,
            updatedAt: new Date().toISOString()
          };
          return { currentPoem: updatedPoem };
        });
        get().savePoem(); // Save the updated currentPoem to local storage
      },

      generateAICompletion: async (prompt) => {
        const { currentPoem } = get();
        if (!currentPoem) return;

        set({ isGenerating: true, error: null });

        try {
          const completion = await mockGenerateCompletion(
            prompt || currentPoem.content,
            currentPoem.form,
            currentPoem.tone
          );

          set(state => ({
            isGenerating: false,
            currentPoem: state.currentPoem ? {
              ...state.currentPoem,
              content: completion,
              updatedAt: new Date().toISOString()
            } : null
          }));

          get().saveRevision('ai', completion);
          get().savePoem(); // Save the updated currentPoem to local storage
        } catch (error) {
          set({
            isGenerating: false,
            error: error instanceof Error ? error.message : 'Failed to generate completion'
          });
        }
      },

      saveRevision: (author, content) => {
        set(state => {
          if (!state.currentPoem) return state;
          const newRevision: PoemRevision = {
            id: Date.now().toString(),
            content,
            timestamp: new Date(),
            author
          };
          return {
            currentPoem: {
              ...state.currentPoem,
              revisions: [...(state.currentPoem.revisions ?? []), newRevision]
            }
          };
        });
      },

      savePoem: (poemToSave?: Poem) => {
        set(state => {
          const poem = poemToSave || state.currentPoem;
          if (!poem) return state;

          const updatedPoem = { ...poem, updatedAt: new Date().toISOString() };

          // Update in myPoems (formerly savedPoems)
          const myPoemsUpdated = state.myPoems.some(p => p.id === updatedPoem.id)
            ? state.myPoems.map(p => p.id === updatedPoem.id ? updatedPoem : p)
            : [...state.myPoems, updatedPoem];

          // If the poem is public and published, add/update in explorePoems
          let explorePoemsUpdated = state.explorePoems;
          if (updatedPoem.isPublic && updatedPoem.isPublished) {
            explorePoemsUpdated = state.explorePoems.some(p => p.id === updatedPoem.id)
              ? state.explorePoems.map(p => p.id === updatedPoem.id ? updatedPoem : p)
              : [...state.explorePoems, updatedPoem];
          } else if (!updatedPoem.isPublic && updatedPoem.isPublished) {
            // If it becomes private after being public, remove from explore
            explorePoemsUpdated = state.explorePoems.filter(p => p.id !== updatedPoem.id);
          }


          // Always add/update to libraryPoems if published
          let libraryPoemsUpdated = state.libraryPoems.some(p => p.id === updatedPoem.id)
            ? state.libraryPoems.map(p => p.id === updatedPoem.id ? updatedPoem : p)
            : [...state.libraryPoems, updatedPoem];

          return {
            myPoems: myPoemsUpdated,
            explorePoems: explorePoemsUpdated,
            libraryPoems: libraryPoemsUpdated,
            currentPoem: state.currentPoem?.id === updatedPoem.id ? updatedPoem : state.currentPoem,
          };
        });
      },

      loadPoem: (id) => {
        set(state => {
          // Load from myPoems
          const poem = state.myPoems.find(p => p.id === id);
          if (!poem) return state;
          return {
            currentPoem: poem
          };
        });
      },

      deletePoem: (id) => {
        set(state => ({
          myPoems: state.myPoems.filter(poem => poem.id !== id), // Delete from myPoems
          explorePoems: state.explorePoems.filter(poem => poem.id !== id), // Also remove from explore
          libraryPoems: state.libraryPoems.filter(poem => poem.id !== id), // Also remove from library
          currentPoem: state.currentPoem?.id === id ? null : state.currentPoem,
        }));
      },

      publishPoem: async (userId: string, userName: string, publishData: { isPublic: boolean; allowCollaboration: boolean; description?: string }) => {
        const { currentPoem } = get();
        if (!currentPoem) {
          set({ error: 'No poem to publish' });
          return;
        }

        // Validation based on previous discussions
        if (!currentPoem.title.trim() || currentPoem.title === 'Untitled Poem') {
          set({ error: 'Please add a title to your poem before publishing' });
          return;
        }
        if (!currentPoem.content.trim()) {
          set({ error: 'Cannot publish an empty poem' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const payload = {
            title: currentPoem.title,
            content: currentPoem.content,
            form: currentPoem.form,
            tone: currentPoem.tone,
            author_id: userId,
            author_name: userName,
            is_public: publishData.isPublic,
            allow_collaboration: publishData.allowCollaboration,
            description: publishData.description, // Include description
          };

          // If poem is already published, it's an UPDATE call
          const method = currentPoem.isPublished && currentPoem.id && currentPoem.id.length > 10 ? 'PUT' : 'POST'; // Heuristic for checking if it's a server ID
          const url = method === 'PUT' ? `${API_BASE}/poems/${currentPoem.id}` : `${API_BASE}/poems`;

          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to ${method === 'PUT' ? 'update' : 'publish'} poem`);
          }

          const result = await response.json();

          const updatedPoem: Poem = {
            ...currentPoem,
            id: result.id || currentPoem.id, // Use server ID if available, otherwise keep existing
            isPublished: true,
            isPublic: publishData.isPublic,
            allowCollaboration: publishData.allowCollaboration,
            publishedAt: result.published_at || new Date().toISOString(), // Use server timestamp or current
            updatedAt: new Date().toISOString(),
            description: publishData.description,
            // Assuming author and stats are returned or should be updated
            author: currentPoem.author || { name: userName, email: '' },
            stats: currentPoem.stats || { views: 0, likes: 0, shares: 0 },
            // Revisions might be updated on the server side, but client only adds local revisions.
            // For a publish/update, typically you don't overwrite client revisions with server's unless it's a full sync.
          };

          set(state => ({
            currentPoem: updatedPoem,
            isLoading: false
          }));

          // Save the updated poem to local storage and update relevant lists
          get().savePoem(updatedPoem);

          // Refresh explore poems if visibility changed or it's a new public poem
          if (publishData.isPublic || (currentPoem.isPublic !== publishData.isPublic)) {
            get().loadExplorePoems();
          }

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to publish poem',
            isLoading: false
          });
        }
      },

      addToExplore: (poem: Poem) => {
        set(state => ({
          explorePoems: state.explorePoems.some(p => p.id === poem.id)
            ? state.explorePoems.map(p => p.id === poem.id ? poem : p)
            : [poem, ...state.explorePoems] // Add to front for recency
        }));
      },

      addToLibrary: (poem: Poem) => {
        set(state => ({
          libraryPoems: state.libraryPoems.some(p => p.id === poem.id)
            ? state.libraryPoems.map(p => p.id === poem.id ? poem : p)
            : [poem, ...state.libraryPoems] // Add to front for recency
        }));
      },

      loadExplorePoems: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/poems/explore`);
          if (!response.ok) {
            throw new Error('Failed to load explore poems');
          }

          const poems = await response.json();
          set({
            explorePoems: poems.map((poem: any) => ({
              ...poem,
              id: poem.id.toString(), // Ensure ID is string
              createdAt: new Date(poem.created_at).toISOString(),
              updatedAt: new Date(poem.updated_at).toISOString(),
              publishedAt: poem.published_at ? new Date(poem.published_at).toISOString() : undefined,
              isPublic: poem.is_public,
              isPublished: poem.is_published,
              allowCollaboration: poem.allow_collaboration,
              description: poem.description,
              revisions: [], // Revisions not typically returned with explore list
              collaborators: poem.collaborators || [],
              author: { name: poem.author_name || 'Unknown', email: '' }, // Map author data
              stats: { views: poem.views || 0, likes: poem.likes || 0, shares: poem.shares || 0 } // Map stats
            })),
            isLoading: false
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load explore poems',
            isLoading: false
          });
        }
      },

      loadUserPoems: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/poems/user/${userId}`);
          if (!response.ok) {
            throw new Error('Failed to load user poems');
          }

          const poems = await response.json();
          set({
            myPoems: poems.map((poem: any) => ({ // Populate myPoems
              ...poem,
              id: poem.id.toString(), // Ensure ID is string
              createdAt: new Date(poem.created_at).toISOString(),
              updatedAt: new Date(poem.updated_at).toISOString(),
              publishedAt: poem.published_at ? new Date(poem.published_at).toISOString() : undefined,
              isPublic: poem.is_public,
              isPublished: poem.is_published,
              allowCollaboration: poem.allow_collaboration,
              description: poem.description,
              revisions: [],
              collaborators: poem.collaborators || [],
              author: { name: poem.author_name || 'Unknown', email: '' }, // Map author data
              stats: { views: poem.views || 0, likes: poem.likes || 0, shares: 0 } // Map stats
            })),
            isLoading: false
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load user poems',
            isLoading: false
          });
        }
      },

      updatePoemVisibility: (isPublic: boolean) => {
        set(state => {
          if (!state.currentPoem) return state;
          const updatedPoem = {
            ...state.currentPoem,
            isPublic,
            updatedAt: new Date().toISOString()
          };
          return {
            currentPoem: updatedPoem
          };
        });
        get().savePoem(); // Save the updated currentPoem locally
      },

      mergePullRequest: async (poemId: string, pullRequestId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/poems/${poemId}/pull-requests/${pullRequestId}/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to merge pull request');
          }

          const updatedPoemFromServer = await response.json(); // Backend should return the updated poem

          set(state => {
            let updatedCurrentPoem = state.currentPoem;
            if (state.currentPoem?.id === poemId) {
              updatedCurrentPoem = {
                ...state.currentPoem,
                content: updatedPoemFromServer.content, // Update content from merged PR
                revisions: [...(state.currentPoem.revisions || []), {
                  id: Date.now().toString(),
                  content: updatedPoemFromServer.content, // Assuming the merged content is the new revision
                  timestamp: new Date(),
                  author: 'ai' // Or 'collaborator' if you track PR authors
                }],
                updatedAt: new Date().toISOString(),
              };
            }

            return {
              currentPoem: updatedCurrentPoem,
              isLoading: false,
            };
          });
          get().savePoem(get().currentPoem || undefined); // Save the updated poem locally

          console.log('Successfully merged pull request:', pullRequestId, 'for poem:', poemId);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to merge pull request',
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'poem-storage', // key for localStorage
      // Partialize to only store necessary parts if you have a lot of transient state
      partialize: (state) => ({
        myPoems: state.myPoems,
        // You might or might not want to persist explorePoems and libraryPoems
        // if they are always fetched from the API on app load.
        // For now, let's persist them, but consider clearing them on app init
        // and only loading them from API.
        explorePoems: state.explorePoems,
        libraryPoems: state.libraryPoems,
        currentPoem: state.currentPoem, // Persist current poem if user navigates away
      }),
      // Migrate function if your state shape changes in future
      // version: 1,
      // migrate: (persistedState: any, version) => {
      //   if (version === 0) {
      //     // transform state from version 0 to 1
      //   }
      //   return persistedState;
      // },
    }
  )
);