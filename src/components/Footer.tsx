import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-transparent text-white text-center py-4 mt-8 w-full">
    <div className="space-y-1">
      <p className="text-sm">
        Made with Fun by{" "}
        <a
          href="https://twitter.com/Somnia_Network"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon hover:underline"
        >
          Somnia Guess
        </a>
      </p>
      <p className="text-xs opacity-70">© 2025 All rights reserved</p>
    </div>
  </footer>
);

export default Footer;
