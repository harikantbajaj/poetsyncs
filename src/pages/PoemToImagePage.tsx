import React, { useState } from 'react';
import { usePoemStore } from '../store/poemStore';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, ImageIcon, Sparkles } from 'lucide-react';

// Define the Poem type if not already imported
interface Poem {
  id: string;
  title: string;
  content: string;
}

export const PoemToImagePage: React.FC = () => {
  const poemStore = usePoemStore();
  const savedPoems = poemStore.myPoems || [];
  const [selectedId, setSelectedId] = useState<string>('');
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    const selectedPoem: Poem | undefined = savedPoems.find((p: Poem) => p.id === selectedId);
    if (!selectedPoem) return;

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/generate-image', {
        title: selectedPoem.title,
        content: selectedPoem.content,
      });

      setImageURL(`data:image/png;base64,${response.data.image}`);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPoem = savedPoems.find(p => p.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Transform Your Poem into Visual Art
          </h1>
          <p className="text-lg text-gray-600">
            Select one of your saved poems and watch AI bring your words to life as stunning imagery.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Select Poem</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Choose a poem --</option>
              {savedPoems.map(poem => (
                <option key={poem.id} value={poem.id}>
                  {poem.title}
                </option>
              ))}
            </select>
          </div>

          {selectedPoem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 border rounded-lg p-4 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{selectedPoem.title}</h2>
              <p className="text-gray-600 whitespace-pre-line text-sm">{selectedPoem.content}</p>
            </motion.div>
          )}

          <div className="flex justify-center">
            <button
              onClick={generateImage}
              disabled={loading || !selectedId}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {imageURL && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-10 text-center"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Image</h3>
              <img
                src={imageURL}
                alt="Poem visualization"
                className="max-w-xl mx-auto rounded-xl shadow-lg"
              />
            </motion.div>
          )}

          {!imageURL && !loading && selectedId && (
            <div className="mt-10 text-center text-gray-400 flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12" />
              <p className="text-sm">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
