import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './store/AuthContext';
import { PoemProvider } from './store/PoemContext';
import { PullRequestProvider } from './store/PullRequestContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { ExplorePage } from './pages/ExplorePage';
import { LibraryPage } from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { PoemToImagePage } from './pages/PoemToImagePage';

// New Collaboration Pages
import { SuggestEditPage } from './pages/SuggestEditPage';
import { PullRequestPage } from './pages/PullRequestPage';
import { PoemDetailPage } from './pages/PoemDetailPage';
import { CollaborationDashboard } from './pages/CollaborationDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminReviewPage } from './pages/AdminReviewPage'; // <--- ADDED: Import AdminReviewPage

// Utility Components
import { ScrollToTop } from './components/utils/ScrollToTop';
import { LoadingProvider } from './components/utils/LoadingProvider';

function App() {
  return (
    <AuthProvider>
      <PoemProvider>
        <PullRequestProvider>
          <LoadingProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/poem/:id" element={<PoemDetailPage />} />

                    {/* Protected Routes - Require Authentication */}
                    <Route path="/create" element={
                      <ProtectedRoute>
                        <CreatePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/library" element={
                      <ProtectedRoute>
                        <LibraryPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/poem-to-image" element={
                      <ProtectedRoute>
                        <PoemToImagePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />

                    {/* Collaboration Routes */}
                    <Route path="/suggest-edit/:poemId" element={
                      <ProtectedRoute>
                        <SuggestEditPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/pull-request/:pullRequestId" element={
                      <ProtectedRoute>
                        <PullRequestPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/collaboration" element={
                      <ProtectedRoute>
                        <CollaborationDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Admin Route - Typically also protected and role-gated */}
                    <Route path="/admin/review" element={
                      <ProtectedRoute>
                        <AdminReviewPage />
                      </ProtectedRoute>
                    } />

                    {/* Dynamic Routes for Poem Management */}
                    <Route path="/poem/:id/edit" element={
                      <ProtectedRoute>
                        <CreatePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/poem/:id/pull-requests" element={
                      <ProtectedRoute>
                        <PullRequestPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/poem/:id/collaborators" element={
                      <ProtectedRoute>
                        <CollaborationDashboard />
                      </ProtectedRoute>
                    } />

                    {/* User Profile Routes */}
                    <Route path="/user/:userId" element={<ProfilePage />} />
                    <Route path="/user/:userId/poems" element={<LibraryPage />} />

                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>

                <Footer />
              </div>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '16px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </Router>
          </LoadingProvider>
        </PullRequestProvider>
      </PoemProvider>
    </AuthProvider>
  );
}

export default App;
