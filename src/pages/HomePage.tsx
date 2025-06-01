import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight, BookOpen, PenTool, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-900 leading-tight mb-6">
                Turn Your Emotions into Poetry and Art
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Whether it's joy, anger, or inspiration—express your deepest feelings through powerful poems and transform them into stunning visuals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {/* Start Creating */}
                <Link to="/create" aria-label="Navigate to the poetry creation page">
                  <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                    Start Creating
                  </Button>
                </Link>

                {/* Explore Examples */}
                <Link to="/explore" aria-label="Explore existing poems">
                  <Button size="lg" variant="outline">
                    Explore Examples
                  </Button>
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Need inspiration? Browse featured poems or create your own masterpiece!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI listens to your emotions and crafts poems that echo your soul. Then, bring your words to life by generating real images inspired by your verses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Poetry Styles Section */}
      <section className="bg-secondary-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Express Your Inner Voice</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From raw emotions to structured rhythms, choose a style that fits your mood and message perfectly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {poetryStyles.map((style, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{style.title}</h3>
                  <p className="text-gray-600 mb-4">{style.description}</p>
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-sm text-gray-600">
                    "{style.example}"
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-secondary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Transform Your Words Into Art</h2>
            <p className="text-lg mb-8">
              Join a community of creators who turn raw emotions into heartfelt poems — and then bring those poems to life as vivid images.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary-900"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => navigate('/create')}
              aria-label="Start writing your poem"
            >
              Start Writing Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <PenTool className="w-6 h-6 text-primary-600" />,
    title: "Feel Your Words",
    description: "Express your emotions honestly and let the AI help you shape them into powerful poetry."
  },
  {
    icon: <Sparkles className="w-6 h-6 text-primary-600" />,
    title: "Create Vivid Imagery",
    description: "Transform your poems into breathtaking images that capture the heart of your message."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-primary-600" />,
    title: "Grow Your Voice",
    description: "Discover new ways to express yourself with AI suggestions that inspire and teach."
  }
];

const poetryStyles = [
  {
    title: "Passionate Sonnet",
    description: "Classic 14-line poems to channel strong emotions and rhythm",
    example: "Do not go gentle into that good night. Rage, rage against the dying of the light."
  },
  {
    title: "Reflective Haiku",
    description: "Concise 3-line poems capturing moments of insight and feeling",
    example: "The lamp once out, cool stars enter the window frame. No cloud in sight."
  },
  {
    title: "Free Expression",
    description: "Unstructured poems that flow with your personal voice and feelings",
    example: "Joy and anger blend in wild verse, a river of thoughts unleashed."
  },
  {
    title: "Playful Limerick",
    description: "Lighthearted five-line poems with a rhythmic bounce",
    example: "There once was a poet so fine, whose verses were truly divine..."
  },
  {
    title: "Soulful Tanka",
    description: "Five-line Japanese poems to express deep emotions succinctly",
    example: "An old silent pond... A frog jumps into the pond, splash! Silence again."
  },
  {
    title: "Emotive Villanelle",
    description: "Structured 19-line poems with repeating lines to emphasize feelings",
    example: "Do not go gentle into that good night. Rage, rage against the dying of the light."
  }
];
