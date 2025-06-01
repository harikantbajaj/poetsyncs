import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Github, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Feather className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-semibold text-gray-900">PoetSync</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              An advanced AI-powered platform for collaborative poetry generation.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Product
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/features" className="text-sm text-gray-600 hover:text-primary-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-gray-600 hover:text-primary-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 hover:text-primary-600">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Resources
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/blog" className="text-sm text-gray-600 hover:text-primary-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/tutorials" className="text-sm text-gray-600 hover:text-primary-600">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/documentation" className="text-sm text-gray-600 hover:text-primary-600">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} PoetSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};