// pages/profile.tsx
'use client';

import React, { useState } from 'react';
import { UserCircleIcon,  DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import PostList from '@/app/components/posts/PostList';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  backgroundImageUrl?: string;
}

const ProfilePage: React.FC = () => {
  const userProfile: UserProfile = {
    id: 1,
    username: 'ユーザー名',
    email: 'user@example.com',
    bio: '自己紹介文が入ります。',
    location: '日本のどこか',
    website: 'https://example.com',
    backgroundImageUrl: '/images/default-profile-bg.jpg',
  };

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'following'>('posts');

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
          <div className="absolute inset-0 bg-black opacity-20"></div>
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

          {/* ナビゲーションバー */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                }`}
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-1 inline-block" />
                自分の投稿
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'liked'
                    ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                }`}
              >
                
                いいね
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'following'
                    ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                }`}
              >
                {/* フォローアイコン */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-1 inline-block">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.125h15.003m-15.003-5.25a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm7.5-5.25h4.5" />
                </svg>
                フォロー
              </button>
            </nav>
          </div>

          {/* コンテンツ表示エリア */}
          <div className="mt-4">
            {activeTab === 'posts' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">自分の投稿</h3>
                <PostList /> {/* PostList コンポーネントを配置 */}
              </div>
            )}

            {activeTab === 'liked' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">いいねした投稿</h3>
                <PostList /> {/* PostList コンポーネントを配置 */}
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">フォロー</h3>
                {/* フォローしているユーザーのリスト表示 (API 実装後に具体的なコンポーネントや処理を追加) */}
                <p className="text-gray-500 text-sm">フォローしているユーザーのリストを表示します (API 実装後)。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;