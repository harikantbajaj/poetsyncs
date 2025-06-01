import React from 'react';
import { useParams } from 'react-router-dom';

interface RouteParams {
  userId?: string;
}

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p>{userId ? `Profile of user: ${userId}` : 'Your profile'}</p>
    </div>
  );
};
