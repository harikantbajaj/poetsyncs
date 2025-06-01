//poemcontext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Poem } from '../types'; // Adjust the import path if needed

type PoemContextType = {
  poems: Poem[];
  addPoem: (poem: Poem) => void;
  updatePoem: (updatedPoem: Poem) => void;
  deletePoem: (poemId: string) => void;
  setPoems: React.Dispatch<React.SetStateAction<Poem[]>>;
};

const PoemContext = createContext<PoemContextType | undefined>(undefined);

export const PoemProvider = ({ children }: { children: ReactNode }) => {
  const [poems, setPoems] = useState<Poem[]>([]);

  const addPoem = (poem: Poem) => {
    setPoems((prev) => [...prev, poem]);
  };

  const updatePoem = (updatedPoem: Poem) => {
    setPoems((prev) =>
      prev.map((poem) => (poem.id === updatedPoem.id ? updatedPoem : poem))
    );
  };

  const deletePoem = (poemId: string) => {
    setPoems((prev) => prev.filter((poem) => poem.id !== poemId));
  };

  return (
    <PoemContext.Provider value={{ poems, addPoem, updatePoem, deletePoem, setPoems }}>
      {children}
    </PoemContext.Provider>
  );
};

export const usePoemContext = (): PoemContextType => {
  const context = useContext(PoemContext);
  if (!context) {
    throw new Error('usePoemContext must be used within a PoemProvider');
  }
  return context;
};
