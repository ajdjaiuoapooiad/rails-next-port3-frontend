'use client';

import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import PostList from '@/app/components/posts/PostList';
import Link from 'next/link';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string; // プロフィールアイコンのURL
  bg_image_url?: string;   // 背景画像のURL
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'following'>('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // 環境変数からAPI URLを取得
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません');
        }

        // ローカルストレージなどからトークンを取得する処理
        const token = localStorage.getItem('authToken'); // 例：localStorageから取得
        if (!token) {
          throw new Error('認証トークンが見つかりません');
        }

        // APIエンドポイントに合わせて修正してください
        const response = await fetch(`${apiUrl}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Authorizationヘッダーにトークンを設定
            'Content-Type': 'application/json', // 必要に応じてContent-Typeを設定
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'プロフィールの取得に失敗しました');
        }
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message);
        console.error('プロフィールの取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // 空の依存配列で、コンポーネントのマウント時に一度だけ実行

  if (loading) {
    return <div>プロフィールを読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  if (!userProfile) {
    return <div>プロフィール情報が見つかりません。</div>;
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md overflow-hidden">
        {/* プロフィールヘッダー (背景画像) */}
        <div className="relative h-48 overflow-hidden">
          {userProfile.bg_image_url && (
            <img
              src={userProfile.bg_image_url}
              alt="プロフィール背景"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        <div className="px-4 py-4 relative">
          {/* アバター (左寄せ、背景画像に重ねる) */}
          <div className="-mt-16 absolute left-4">
            {userProfile.user_icon_url ? (
              <img
                src={userProfile.user_icon_url}
                alt="プロフィールアイコン"
                className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 shadow-md object-cover"
              />
            ) : (
              <UserCircleIcon className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 text-gray-500 shadow-md" />
            )}
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
              <Link href={`/users/profile/${userProfile.id}/edit`}>編集</Link> 
            </button>
          </div>

          {/* ナビゲーションバー */}
          <div className="mt-6 border-b border-gray-200 w-full flex justify-center">
            <nav className="-mb-px flex space-x-4 max-w-3xl mx-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                  <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                  <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
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