import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
      <p className="text-lg mb-4">Page not found.</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};
