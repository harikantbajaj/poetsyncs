# Verse Echo - AI Poetry Collaborator

Verse Echo is an innovative web application that empowers poets to create, collaborate, and share poetry with the assistance of AI. Whether you're a seasoned wordsmith or a beginner exploring poetic expression, Verse Echo provides tools to help you craft meaningful verses and connect with a community of fellow poets.

## Features

### AI-Powered Poetry Creation
- **Style Selection**: Choose from various poetic forms (Sonnet, Haiku, Free Verse, Limerick, Villanelle, Ghazal)
- **Tone Guidance**: Set the emotional tone (Romantic, Melancholic, Joyful, Contemplative, Mystical, Rebellious)
- **AI Assistance**: Get AI-generated suggestions to enhance your poetic expression

### Collaborative Poetry Platform
- **Git-Style Collaboration**: Suggest edits to other poets' work through pull requests
- **Review System**: Authors can approve or reject suggested changes
- **Community Engagement**: Connect with other poets and build upon each other's work

### Poetry Visualization
- **Poem-to-Image Generation**: Transform your poems into stunning visual representations using AI
- **Shareable Art**: Export your poem visualizations to share on social media

### Personal Library
- **Private Workspace**: Save and organize your unpublished poems
- **Public Portfolio**: Publish selected works to showcase your talent
- **Revision History**: Track changes and revert to previous versions

## Technology Stack

### Frontend
- **React** with TypeScript for a robust user interface
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **Firebase** for authentication
- **Lucide React** for icons

### Backend
- **FastAPI** for the REST API
- **SQLite** for data storage
- **SQLAlchemy** for database ORM
- **Stable Diffusion** for image generation

### Key Libraries
- **react-router-dom** for navigation
- **react-hot-toast** for notifications
- **framer-motion** for animations
- **react-markdown** for rendering poem content

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd verse-echo
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory with the following:
   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   python backend/main.py
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be available in the `dist` directory.

## Usage

### Creating a Poem
1. Navigate to the "Create" page
2. Select a poetic form and tone
3. Write your poem in the editor
4. Use the AI assistant for suggestions if needed
5. Save or publish your poem

### Collaborating on Poems
1. Browse the "Explore" page to find public poems
2. Click on a poem that allows collaboration
3. Click "Suggest Edit" to create a pull request
4. Propose your changes and submit
5. The poem author can review and merge your suggestions

### Generating Poem Visualizations
1. Go to the "Poem to Image" page
2. Select a poem from your library
3. The AI will generate an image based on your poem's content
4. Download or share the generated image

## Project Structure

```
project/
├── backend/           # FastAPI backend server
├── src/                # React frontend source code
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores for state management
│   ├── data/          # Sample data and constants
│   └── types/        # TypeScript type definitions
├── public/             # Static assets
├── dist/               # Production build output
├── requirements.txt    # Python dependencies
└── package.json       # Node.js dependencies and scripts
```

## API Endpoints

### Poems
- `POST /api/poems` - Create a new poem
- `GET /api/poems/explore` - Get all public poems
- `GET /api/poems/user/{user_id}` - Get all poems for a specific user
- `GET /api/poems/{poem_id}` - Get a specific poem
- `PUT /api/poems/{poem_id}` - Update a poem
- `DELETE /api/poems/{poem_id}` - Delete a poem

### Pull Requests
- `POST /api/pull-requests` - Create a new pull request
- `GET /api/pull-requests` - Get pull requests with optional filtering
- `GET /api/pull-requests/poem/{poem_id}` - Get all pull requests for a specific poem
- `GET /api/pull-requests/{pr_id}` - Get a specific pull request
- `POST /api/pull-requests/{pr_id}/approve` - Approve a pull request
- `POST /api/pull-requests/{pr_id}/reject` - Reject a pull request

## Contributing

We welcome contributions to Verse Echo! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the poets who inspire us with their beautiful words
- Stable Diffusion community for the image generation model
- Open source libraries that made this project possible
