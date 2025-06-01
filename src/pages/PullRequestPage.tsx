import React from 'react';
import { useParams } from 'react-router-dom';

interface RouteParams {
  pullRequestId: string;
}

export const PullRequestPage: React.FC = () => {
  const { pullRequestId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pull Request</h1>
      <p>Pull Request ID: {pullRequestId}</p>
    </div>
  );
};
