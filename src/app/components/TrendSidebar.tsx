// components/TrendSidebar.tsx
import Link from 'next/link';
import React from 'react';

const TrendSidebar = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        トレンド
      </h2>
      <ul className="space-y-2">
        <li><Link href="#" className="text-blue-500 hover:underline">#React</Link></li>
        <li><Link href="#" className="text-blue-500 hover:underline">#Nextjs</Link></li>
        <li><Link href="#" className="text-blue-500 hover:underline">#JavaScript</Link></li>
        <li><Link href="#" className="text-blue-500 hover:underline">#テクノロジー</Link></li>
      </ul>
    </div>
  );
};

export default TrendSidebar;