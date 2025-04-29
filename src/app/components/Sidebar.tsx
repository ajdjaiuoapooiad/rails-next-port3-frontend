'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-end">
        <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M18.27 16.27a1 1 0 01-1.414 1.414L12 13.414l-4.853 4.272a1 1 0 01-1.414-1.414L10.586 12 6.314 7.728a1 1 0 011.414-1.414L12 10.586l4.272-4.853a1 1 0 011.414 1.414L13.414 12l4.853 4.272z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <nav className="p-4">
        <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-white">
          Dashboard
        </Link>
        <Link href="/profile" className="block py-2 text-gray-300 hover:text-white">
          Profile
        </Link>
        <Link href="/settings" className="block py-2 text-gray-300 hover:text-white">
          Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;