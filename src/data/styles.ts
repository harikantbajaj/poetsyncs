import { StyleOption } from '../types';

// (Removed duplicate poeticForms and poeticTones declarations to avoid redeclaration error)

// File: src/data/styles.ts
export const poeticForms = [
  { 
    value: 'sonnet', 
    label: 'Sonnet', 
    description: 'A 14-line poem with a specific rhyme scheme, traditionally expressing deep emotions or philosophical thoughts.' 
  },
  { 
    value: 'haiku', 
    label: 'Haiku', 
    description: 'A traditional Japanese three-line poem with a 5-7-5 syllable pattern, capturing moments in nature.' 
  },
  { 
    value: 'free-verse', 
    label: 'Free Verse', 
    description: 'Poetry without regular rhyme, rhythm, or structure, allowing for creative expression and natural speech patterns.' 
  },
  { 
    value: 'limerick', 
    label: 'Limerick', 
    description: 'A humorous five-line poem with an AABBA rhyme scheme, often telling a funny story.' 
  },
  { 
    value: 'villanelle', 
    label: 'Villanelle', 
    description: 'A complex 19-line poem with repeating rhymes and refrains, creating a musical, circular effect.' 
  },
  { 
    value: 'ghazal', 
    label: 'Ghazal', 
    description: 'A lyrical poem consisting of rhyming couplets, traditionally expressing loss, love, or longing.' 
  }
];

export const poeticTones = [
  { 
    value: 'romantic', 
    label: 'Romantic', 
    description: 'Expressing love, passion, and deep emotional connection with beauty and tenderness.' 
  },
  { 
    value: 'melancholic', 
    label: 'Melancholic', 
    description: 'Reflective and somewhat sad, exploring themes of loss, nostalgia, and contemplation.' 
  },
  { 
    value: 'joyful', 
    label: 'Joyful', 
    description: 'Happy, uplifting, and celebratory, expressing enthusiasm and positive emotions.' 
  },
  { 
    value: 'contemplative', 
    label: 'Contemplative', 
    description: 'Thoughtful and meditative, exploring deep philosophical questions and inner reflection.' 
  },
  { 
    value: 'mystical', 
    label: 'Mystical', 
    description: 'Spiritual and otherworldly, exploring themes of transcendence and the divine.' 
  },
  { 
    value: 'rebellious', 
    label: 'Rebellious', 
    description: 'Challenging conventions and expressing defiance, protest, or revolutionary spirit.' 
  }
];