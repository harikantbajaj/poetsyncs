export interface Poem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  form: string;
  author: string | {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  allowCollaboration?: boolean;
  createdAt?: string;
  isPublic?: boolean;
  likes?: number;
  views?: number;
  tags?: string[];
}

export const samplePoems: Poem[] = [
  {
    id: '1a2b3c4d-autumn',
    title: 'Whispers of Autumn',
    content:
      'The amber leaves descend in graceful flight,\nAs autumn winds embrace the fading day.\nThe trees stand bare against the dimming light,\nAs summer warmth begins to slip away.',
    excerpt:
      'The amber leaves descend in graceful flight,\nAs autumn winds embrace the fading day...',
    form: 'Sonnet',
    author: {
      id: 'author-emily',
      name: 'Emily Chen',
      verified: true
    },
    allowCollaboration: false,
    createdAt: '2025-05-23T10:30:00Z',
    isPublic: true,
    likes: 120,
    views: 950,
    tags: ['autumn', 'sonnet', 'nature']
  },
  {
    id: '2b3c4d5e-urban',
    title: 'Urban Reflections',
    content:
      'Steel and glass mirrors\nCapture fragments of sky\nBetween hurried footsteps\nAnd forgotten conversations.',
    excerpt:
      'Steel and glass mirrors\nCapture fragments of sky...',
    form: 'Free Verse',
    author: {
      id: 'author-michael',
      name: 'Michael Torres',
    },
    allowCollaboration: true,
    createdAt: '2025-05-20T08:15:00Z',
    isPublic: true,
    likes: 85,
    views: 730,
    tags: ['city', 'modern', 'reflection']
  },
  {
    id: '3c4d5e6f-ocean',
    title: 'Ocean Dreams',
    content:
      'Waves crash on the shore\nSeagulls dance upon the breeze\nPeace finds me at last',
    excerpt:
      'Waves crash on the shore\nSeagulls dance upon the breeze...',
    form: 'Haiku',
    author: {
      id: 'author-aisha',
      name: 'Aisha Johnson',
      avatar: 'https://example.com/avatar/aisha.jpg',
    },
    allowCollaboration: false,
    createdAt: '2025-05-18T17:00:00Z',
    isPublic: true,
    likes: 190,
    views: 1100,
    tags: ['ocean', 'haiku', 'peace']
  },
  {
    id: '4d5e6f7g-midnight',
    title: 'Midnight Thoughts',
    content:
      'In the quiet hours\nWhen the world has gone to sleep\nMy mind wanders through\nLandscapes of possibility\nAnd roads not yet taken.',
    excerpt:
      'In the quiet hours\nWhen the world has gone to sleep...',
    form: 'Free Verse',
    author: {
      id: 'author-james',
      name: 'James Wilson',
    },
    allowCollaboration: true,
    createdAt: '2025-05-18T22:45:00Z',
    isPublic: true,
    likes: 150,
    views: 870,
    tags: ['thoughts', 'night', 'introspection']
  },
  {
    id: '5e6f7g8h-clocktower',
    title: 'The Old Clocktower',
    content:
      'The clocktower stands against the sky,\nMarking minutes, hours, and days.\nTime moves on as years go by.',
    excerpt:
      'The clocktower stands against the sky,\nMarking minutes, hours...',
    form: 'Villanelle',
    author: {
      id: 'author-sophie',
      name: 'Sophie Adams',
      verified: true,
    },
    allowCollaboration: false,
    createdAt: '2025-05-11T13:20:00Z',
    isPublic: false,
    likes: 60,
    views: 420,
    tags: ['time', 'villanelle', 'history']
  },
  {
    id: '6f7g8h9i-wanderlust',
    title: 'Wanderlust',
    content:
      'Distant horizons\nCall to restless wanderers\nSeeking something new\nFeet upon untrodden paths\nHearts full of possibility',
    excerpt:
      'Distant horizons\nCall to restless wanderers...',
    form: 'Tanka',
    author: {
      id: 'author-david',
      name: 'David Park',
    },
    allowCollaboration: true,
    createdAt: '2025-05-04T07:10:00Z',
    isPublic: true,
    likes: 130,
    views: 780,
    tags: ['travel', 'tanka', 'exploration']
  }
];
