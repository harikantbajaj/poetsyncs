// LibraryPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePoemStore, Poem } from '../store/poemStore';
import { Edit, Trash2, Eye, Plus, X, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const LibraryPage: React.FC = () => {
  const { myPoems, loadPoem, loadUserPoems, setMyPoems } = usePoemStore();
  const navigate = useNavigate();

  const [previewPoem, setPreviewPoem] = useState<Poem | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);

  const userId = 'YOUR_USER_ID_HERE'; // Replace with actual auth logic

  useEffect(() => {
    if (userId && myPoems.length === 0) {
      loadUserPoems(userId);
    }
  }, [loadUserPoems, userId, myPoems.length]);

  const generatePoemImage = async (poemId: string) => {
    const poem = myPoems.find((p: Poem) => p.id === poemId);
    if (!poem) return;

    setLoadingImageId(poemId);
    try {
      const response = await axios.post('http://localhost:8000/generate-image', {
        title: poem.title,
        content: poem.content
      });

      setGeneratedImages(prev => ({
        ...prev,
        [poemId]: `data:image/png;base64,${response.data.image}`
      }));
    } catch (err) {
      alert("Failed to generate image.");
      console.error(err);
    } finally {
      setLoadingImageId(null);
    }
  };

  const deletePoem = async (poemId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this poem?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/poems/${poemId}`);
      setMyPoems(myPoems.filter(poem => poem.id !== poemId));
    } catch (err) {
      alert('Failed to delete poem.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">My Poetry Library</h1>
            <p className="text-gray-600">Your collection of saved poems and drafts.</p>
          </div>

          <Link
            to="/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus size={16} className="mr-2" />
            New Poem
          </Link>
        </header>

        {myPoems.length === 0 ? (
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium mb-2">Your library is empty</h3>
              <p className="text-gray-600 mb-6">
                Start creating poems and they will appear here for easy access.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Poem
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myPoems.map((poem: Poem) => (
                    <React.Fragment key={poem.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {poem.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                            {poem.form}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(poem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(poem.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-primary-600 hover:text-primary-800"
                              title="Edit"
                              onClick={() => {
                                loadPoem(poem.id);
                                navigate('/create');
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-800"
                              title="Preview"
                              onClick={() => setPreviewPoem(poem)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                              onClick={() => deletePoem(poem.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="Generate Image"
                              onClick={() => generatePoemImage(poem.id)}
                              disabled={loadingImageId === poem.id}
                            >
                              <ImageIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {generatedImages[poem.id] && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center bg-gray-50">
                            <img
                              src={generatedImages[poem.id]}
                              alt="Generated poem"
                              className="max-w-lg mx-auto rounded shadow"
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {previewPoem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setPreviewPoem(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold mb-4">{previewPoem.title}</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-serif">{previewPoem.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
