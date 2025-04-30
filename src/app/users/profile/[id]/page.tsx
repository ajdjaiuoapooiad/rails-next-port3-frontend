// pages/profile.tsx
'use client';

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import PostList from '@/app/components/posts/PostList';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  backgroundImageUrl?: string; // 背景画像の URL を追加
}

const ProfilePage: React.FC = () => {
  const userProfile: UserProfile = {
    id: 1,
    username: 'ユーザー名',
    email: 'user@example.com',
    bio: '自己紹介文が入ります。',
    location: '日本のどこか',
    website: 'https://example.com',
    backgroundImageUrl: '/images/default-profile-bg.jpg', // デフォルトの背景画像パス
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md overflow-hidden">
        {/* プロフィールヘッダー (背景画像) */}
        <div className="relative h-48 overflow-hidden">
          {userProfile.backgroundImageUrl && (
            <img
              src={userProfile.backgroundImageUrl}
              alt="プロフィール背景"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black opacity-20"></div> {/* 背景画像を少し暗くするオーバーレイ */}
        </div>

        <div className="px-4 py-4 relative">
          {/* アバター (左寄せ、背景画像に重ねる) */}
          <div className="-mt-16 absolute left-4">
            <UserCircleIcon className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 text-gray-500 shadow-md" />
          </div>

          {/* ユーザー情報 (アバターの右側に配置) */}
          <div className="mt-6 ml-32 text-left">
            <h2 className="text-xl font-semibold text-gray-800">{userProfile.username}</h2>
            <p className="text-gray-600 text-sm">{userProfile.email}</p>
            {userProfile.bio && <p className="text-gray-700 mt-2 text-sm">{userProfile.bio}</p>}
            {userProfile.location && <p className="text-gray-700 mt-1 text-sm">場所: {userProfile.location}</p>}
            {userProfile.website && (
              <p className="text-gray-700 mt-1 text-sm">
                ウェブサイト: <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userProfile.website}</a>
              </p>
            )}
          </div>

          {/* アクションボタン */}
          <div className="mt-4 flex justify-around space-x-2">
            <button className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
              フォロー
            </button>
            <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
              メッセージ
            </button>
            <button className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
              編集
            </button>
          </div>

          {/* その他のユーザーコンテンツ */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">最近の投稿</h3>
            <PostList /> {/* 投稿リストコンポーネントを追加 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;