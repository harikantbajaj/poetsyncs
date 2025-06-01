import React, { useState, useEffect } from 'react';
import { usePoemStore } from '../../store/poemStore'; // Adjust path if necessary
import { TextArea } from '../ui/TextArea'; // Assuming these UI components exist
import { Button } from '../ui/Button';   // Assuming these UI components exist
import { Send, RefreshCcw, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const PoemEditor: React.FC = () => {
  const {
    currentPoem,
    updatePoemContent,
    updateTitle, // Renamed from updatePoemTitle in the merged poemStore
    generateAICompletion,
    isGenerating,
    savePoem,
    saveRevision,
  } = usePoemStore();

  const [userInput, setUserInput] = useState('');
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Effect to sync currentPoem content with local userInput state
  useEffect(() => {
    if (currentPoem) {
      setUserInput(currentPoem.content);
    }
  }, [currentPoem]);

  // Handle changes in the textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  // Saves the current user input as a revision and updates poem content
  const handleSaveUserInput = () => {
    if (!userInput.trim()) return;

    // Only update if content has actually changed from the current poem's content
    if (currentPoem?.content !== userInput) {
      updatePoemContent(userInput);
      saveRevision('user', userInput);
    }
  };

  // Trigger AI completion
  const handleGenerateCompletion = async () => {
    if (!userInput.trim()) return;

    // First, save the user's latest input before AI generates
    handleSaveUserInput();

    // Then, generate AI completion based on the current user input
    await generateAICompletion(userInput);
  };

  // Handles saving the entire poem
  const handleSavePoem = () => {
    handleSaveUserInput(); // Ensure latest user input is saved to currentPoem first
    savePoem(); // Call the store's savePoem action

    setSavedSuccessfully(true);

    // Reset the saved message after 3 seconds
    setTimeout(() => {
      setSavedSuccessfully(false);
    }, 3000);
  };

  // Render a placeholder if no poem is active
  if (!currentPoem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No poem is currently active. Create or select a poem to begin.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center mb-4">
        {/* Title input merged from the first snippet */}
        <input
          type="text"
          value={currentPoem.title}
          onChange={(e) => updateTitle(e.target.value)} // Using updateTitle from usePoemStore
          className="text-2xl font-serif font-bold border-none focus:outline-none focus:ring-0 w-full bg-transparent"
          placeholder="Untitled Poem"
        />
      </div>

      <div className="mb-2 flex items-center text-sm text-gray-500">
        <span className="mr-2">Form: {currentPoem.form}</span>
        <span className="mx-2">•</span>
        <span>Tone: {currentPoem.tone}</span>
      </div>

      <div className="mb-4 relative">
        <TextArea
          value={userInput}
          onChange={handleInputChange}
          onBlur={handleSaveUserInput} // Save user input when textarea loses focus
          placeholder="Begin writing your poem here..."
          className="min-h-[200px] font-serif leading-relaxed p-4 bg-white/50 backdrop-blur-sm"
          autoResize
        />

        <motion.div
          className="absolute bottom-4 right-4 flex space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={handleSavePoem}
            leftIcon={<Save size={16} />}
          >
            Save
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGenerateCompletion()} // Regenerate/Continue with current input
            leftIcon={<RefreshCcw size={16} />}
            isLoading={isGenerating}
            disabled={isGenerating || !userInput.trim()}
          >
            Regenerate
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleGenerateCompletion} // Continue/Generate new content
            leftIcon={<Send size={16} />}
            isLoading={isGenerating}
            disabled={isGenerating || !userInput.trim()}
          >
            Continue
          </Button>
        </motion.div>
      </div>

      {savedSuccessfully && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          Poem saved successfully
        </motion.div>
      )}
    </div>
  );
};