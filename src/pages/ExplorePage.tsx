// src/pages/ExplorePage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  Search,
  Users,
  Eye,
  Star,
  Edit3,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  ArrowUp
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { SuggestEditModal } from '../components/SuggestEditModal';
import { samplePoems, Poem } from '../data/samplePoems';
import { PoeticForm } from '../types';
import { usePoemStore } from '../store/poemStore';
import { useAuthStore } from '../store/authStore';

// Type definitions
type FilterType = 'all' | 'collaborative' | 'trending' | 'recent' | 'popular';
type SortType = 'recent' | 'popular' | 'title' | 'author';

// Remove PullRequestData and import PullRequestCreate from its definition
import { PullRequestCreate } from '../types'; // Adjust the import path if needed

// Author interface
interface Author {
  id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

// Extended Poem interface to handle missing properties
interface ExtendedPoem {
  id: string;
  title: string;
  content: string;
  form: string;
  author: Author;
  allowCollaboration?: boolean;
  pullRequestsReceived?: number;
  publishedAt?: string;
  createdAt?: string;
  isPublic?: boolean;
  likes?: number;
  views?: number;
  excerpt?: string;
  tags?: string[];
}

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [selectedPoem, setSelectedPoem] = useState<ExtendedPoem | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [likedPoems, setLikedPoems] = useState<Set<string>>(new Set());
  const [bookmarkedPoems, setBookmarkedPoems] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Store hooks
  const { user } = useAuthStore();
  
  // Transform sample poems to match ExtendedPoem interface
  const transformedPoems = useMemo(() => {
    return samplePoems.map((poem): ExtendedPoem => ({
      id: (poem as any).id || `poem-${Math.random().toString(36).substr(2, 9)}`,
      title: poem.title,
      content: poem.excerpt || '',
      form: poem.form,
      author: typeof poem.author === 'string' 
        ? { 
            id: `author-${Math.random().toString(36).substr(2, 9)}`, 
            name: poem.author,
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            verified: false
          }
        : (poem.author && typeof poem.author === 'object'
            ? {
                id: (poem.author as Author).id || `author-${Math.random().toString(36).substr(2, 9)}`,
                name: (poem.author as Author).name || 'Unknown Author',
                avatar: (poem.author as Author).avatar || "https://randomuser.me/api/portraits/women/44.jpg",
                verified: (poem.author as Author).verified || false
              }
            : {
                id: `author-${Math.random().toString(36).substr(2, 9)}`,
                name: 'Unknown Author',
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                verified: false
              }
          ),
      allowCollaboration: poem.allowCollaboration ?? false,
      pullRequestsReceived: 0,
      publishedAt: undefined,
      createdAt: poem.createdAt,
      isPublic: poem.isPublic ?? true,
      likes: poem.likes ?? Math.floor(Math.random() * 20),
      views: poem.views ?? Math.floor(Math.random() * 100),
      excerpt: poem.excerpt || poem.content?.substring(0, 200) || '',
      tags: poem.tags || []
    }));
  }, []);

  // Load user preferences on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedPoems');
    const savedBookmarks = localStorage.getItem('bookmarkedPoems');
    
    if (savedLikes) {
      try {
        setLikedPoems(new Set(JSON.parse(savedLikes)));
      } catch (error) {
        console.error('Error loading liked poems:', error);
      }
    }
    
    if (savedBookmarks) {
      try {
        setBookmarkedPoems(new Set(JSON.parse(savedBookmarks)));
      } catch (error) {
        console.error('Error loading bookmarked poems:', error);
      }
    }
  }, []);

  // Scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtering and sorting logic
  const filteredAndSortedPoems = useMemo(() => {
    let filtered = transformedPoems.filter(poem => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchFields = [
          poem.title,
          poem.content,
          poem.author.name,
          poem.form,
          poem.tags?.join(' ') || ''
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(query)) {
          return false;
        }
      }

      // Type filter
      switch (filterType) {
        case 'collaborative':
          return (poem.allowCollaboration ?? false) && (poem.isPublic ?? true);
        case 'trending':
          return (poem.pullRequestsReceived ?? 0) > 0 || (poem.likes ?? 0) > 10;
        case 'recent':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const publishDate = poem.publishedAt ? new Date(poem.publishedAt) : poem.createdAt ? new Date(poem.createdAt) : new Date();
          return publishDate > oneWeekAgo;
        case 'popular':
          return (poem.likes ?? 0) > 5 || (poem.views ?? 0) > 50;
        default:
          return (poem.isPublic ?? true) !== false;
      }
    });

    // Sorting logic
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'popular':
          const scoreA = (a.likes ?? 0) + (a.views ?? 0) / 10;
          const scoreB = (b.likes ?? 0) + (b.views ?? 0) / 10;
          return scoreB - scoreA;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.name.localeCompare(b.author.name);
        case 'recent':
        default:
          const dateA = a.publishedAt ? new Date(a.publishedAt) : a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.publishedAt ? new Date(b.publishedAt) : b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
      }
    });

    return filtered;
  }, [transformedPoems, searchQuery, filterType, sortType]);

  // Event handlers
  const handleLike = useCallback((poemId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    setLikedPoems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poemId)) {
        newSet.delete(poemId);
      } else {
        newSet.add(poemId);
      }
      
      try {
        localStorage.setItem('likedPoems', JSON.stringify([...newSet]));
      } catch (error) {
        console.error('Error saving liked poems:', error);
      }
      
      return newSet;
    });
  }, []);

  const handleBookmark = useCallback((poemId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    setBookmarkedPoems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poemId)) {
        newSet.delete(poemId);
      } else {
        newSet.add(poemId);
      }
      
      try {
        localStorage.setItem('bookmarkedPoems', JSON.stringify([...newSet]));
      } catch (error) {
        console.error('Error saving bookmarked poems:', error);
      }
      
      return newSet;
    });
  }, []);

  const handleShare = useCallback(async (poem: ExtendedPoem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    const url = `${window.location.origin}/poem/${poem.id}`;
    try {
      await navigator.clipboard.writeText(url);
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }, []);

  const handleSuggestEdit = useCallback((poem: ExtendedPoem, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!(poem.allowCollaboration ?? false)) {
      console.warn('This poem is not open for collaboration');
      return;
    }
    
    if (poem.author.id === user.id) {
      navigate(`/edit/${poem.id}`);
      return;
    }
    
    setSelectedPoem(poem);
    setShowSuggestModal(true);
  }, [user, navigate]);

  const handlePoemClick = useCallback((poem: ExtendedPoem) => {
    navigate(`/poem/${poem.id}`);
  }, [navigate]);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Accept PullRequestCreate type as required by SuggestEditModal
  const handlePullRequestSubmit = useCallback((prData: PullRequestCreate) => {
    console.log('Pull request submitted:', prData);
    setShowSuggestModal(false);
    setSelectedPoem(null);
  }, []);

  // Calculate stats for header
  const stats = useMemo(() => {
    const totalPoems = transformedPoems.length;
    const collaborativePoems = transformedPoems.filter(poem => poem.allowCollaboration).length;
    return { totalPoems, collaborativePoems };
  }, [transformedPoems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-10 lg:py-14">
        {/* Page Header */}
        <header className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
              Explore & Collaborate
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              Discover original works, contribute to collaborative poems, and connect with poets worldwide.
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-gray-600 flex-wrap">
              <span>{stats.totalPoems} Published Poems</span>
              <span>{stats.collaborativePoems} Open for Collaboration</span>
            </div>
          </motion.div>
        </header>

        {/* Search and Filter Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search poems, authors, themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'collaborative', 'trending', 'recent', 'popular'] as FilterType[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filter)}
                    className="text-sm"
                  >
                    {filter === 'collaborative' && <Users size={14} className="mr-1" />}
                    {filter === 'trending' && <TrendingUp size={14} className="mr-1" />}
                    {filter === 'recent' && <Clock size={14} className="mr-1" />}
                    {filter === 'popular' && <Star size={14} className="mr-1" />}
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAndSortedPoems.length} poem{filteredAndSortedPoems.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Poem Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredAndSortedPoems.map((poem: ExtendedPoem, index: number) => {
              const isLiked = likedPoems.has(poem.id);
              const isBookmarked = bookmarkedPoems.has(poem.id);
              const isOwner = user?.id === poem.author.id;
              const displayDate = poem.publishedAt ? new Date(poem.publishedAt) : poem.createdAt ? new Date(poem.createdAt) : new Date();

              return (
                <motion.article
                  key={poem.id}
                  className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handlePoemClick(poem)}
                >
                  <div className="p-6 flex flex-col h-full">
                    {/* Header with badges */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {poem.form}
                        </Badge>
                        {(poem.allowCollaboration ?? false) && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <Users size={10} className="mr-1" />
                            Collaborative
                          </Badge>
                        )}
                        {isOwner && (
                          <Badge variant="default" className="text-xs">
                            Your Poem
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {displayDate.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title and Content */}
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {poem.title}
                    </h3>

                    <div className="text-gray-700 font-serif prose prose-sm mb-4 line-clamp-4 whitespace-pre-line flex-1">
                      {poem.excerpt || poem.content.substring(0, 200) + (poem.content.length > 200 ? '...' : '')}
                    </div>

                    {/* Stats */}
                    <div className="mb-4 flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {poem.views ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {poem.likes ?? 0}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t pt-4 mt-auto">
                      <div className="flex gap-3">
                        <button
                          className={`hover:scale-110 transition-all ${
                            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                          onClick={(e) => handleLike(poem.id, e)}
                        >
                          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all"
                          onClick={(e) => handleShare(poem, e)}
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          className={`hover:scale-110 transition-all ${
                            isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          onClick={(e) => handleBookmark(poem.id, e)}
                        >
                          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                        
                        {(poem.allowCollaboration ?? false) && user && (
                          <button
                            className="text-gray-400 hover:text-indigo-600 hover:scale-110 transition-all"
                            onClick={(e) => handleSuggestEdit(poem, e)}
                          >
                            <Edit3 size={18} />
                          </button>
                        )}
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center text-sm text-gray-500">
                        <img
                          src={poem.author.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                          alt={poem.author.name}
                          className="w-6 h-6 rounded-full mr-2 object-cover"
                        />
                        <span className="truncate max-w-24">{poem.author.name}</span>
                        {poem.author.verified && (
                          <CheckCircle size={14} className="ml-1 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>

        {/* Empty State */}
        {filteredAndSortedPoems.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No poems found</h3>
            <p className="text-gray-600 mb-6">
              No results match your current search and filters.
            </p>
          </motion.div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            onClick={handleScrollToTop}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Suggest Edit Modal */}
      <AnimatePresence>
        {showSuggestModal && selectedPoem && (
          <SuggestEditModal
            poem={{
              id: selectedPoem.id,
              title: selectedPoem.title,
              form: selectedPoem.form as PoeticForm,
              content: selectedPoem.content || selectedPoem.excerpt || '',
              author_name: selectedPoem.author.name,
              author_id: selectedPoem.author.id,
              tone: (selectedPoem as any).tone ?? '',
              is_public: selectedPoem.isPublic ?? true,
              is_published: (selectedPoem as any).is_published ?? (selectedPoem as any).isPublished ?? true,
              isPublished: (selectedPoem as any).isPublished ?? true,
              updatedAt: (selectedPoem as any).updatedAt ?? selectedPoem.createdAt ?? new Date().toISOString(),
              allowCollaboration: selectedPoem.allowCollaboration ?? false,
              published_at: selectedPoem.publishedAt ?? '',
              createdAt: selectedPoem.createdAt ?? '',
              likes: selectedPoem.likes ?? 0,
              views: selectedPoem.views ?? 0,
              // Add required properties for Poem type
              isPublic: selectedPoem.isPublic ?? true,
              allow_collaboration: selectedPoem.allowCollaboration ?? false,
              created_at: selectedPoem.createdAt ?? '',
              updated_at: (selectedPoem as any).updatedAt ?? selectedPoem.createdAt ?? new Date().toISOString(),
            }}
            onClose={() => {
              setShowSuggestModal(false);
              setSelectedPoem(null);
            }}
            onSubmit={handlePullRequestSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};