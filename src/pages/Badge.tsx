import React from 'react';
import BadgeTab from '../components/BadgeTab';

const BadgePage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <BadgeTab />
    </div>
  );
};

export default BadgePage;
