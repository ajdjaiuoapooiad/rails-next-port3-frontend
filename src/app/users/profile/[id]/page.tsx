// pages/profile.tsx
'use client';

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  // その他のプロフィール情報
  bio?: string;
  location?: string;
  website?: string;
}

const ProfilePage: React.FC = () => {
  // ここでユーザーのプロフィール情報を取得する処理を記述します
  // 例: state で管理、useEffect で API からフェッチなど
  const userProfile: UserProfile = {
    id: 1, // 仮のユーザーID
    username: 'ユーザー名',
    email: 'user@example.com',
    bio: '自己紹介文が入ります。',
    location: '日本のどこか',
    website: 'https://example.com',
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md overflow-hidden">
        {/* プロフィールヘッダー */}
        <div className="bg-blue-500 h-32 relative">
          {/* 背景画像などを配置しても良い */}
        </div>
        <div className="px-4 py-4">
          {/* アバター */}
          <div className="-mt-16 relative">
            <UserCircleIcon className="mx-auto h-24 w-24 rounded-full border-4 border-white bg-gray-300 text-gray-500" />
          </div>

          {/* ユーザー情報 */}
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold text-gray-800">{userProfile.username}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
            {userProfile.bio && <p className="text-gray-700 mt-2">{userProfile.bio}</p>}
            {userProfile.location && <p className="text-gray-700 mt-1">場所: {userProfile.location}</p>}
            {userProfile.website && (
              <p className="text-gray-700 mt-1">
                ウェブサイト: <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userProfile.website}</a>
              </p>
            )}
          </div>

          {/* アクションボタンなど (必要に応じて) */}
          <div className="mt-4 flex justify-center space-x-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              フォロー
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              メッセージ
            </button>
            {/* 編集ボタンなど */}
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              プロフィール編集
            </button>
          </div>

          {/* その他のユーザーコンテンツ (投稿一覧など) を表示するエリア */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">最近の投稿</h3>
            {/* ここに投稿リストなどのコンポーネントを配置 */}
            <p className="text-gray-500">まだ投稿はありません。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;