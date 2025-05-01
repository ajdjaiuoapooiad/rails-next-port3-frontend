'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string;
  bg_image_url?: string;
  // 他のプロフィール情報
}

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const { id } = params; // URL の `[id]` 部分を取得
  const userId = Array.isArray(id) ? id[0] : id; // `id` が文字列または文字列の配列の場合に対応
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('ユーザーIDが無効です。');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません。');
        }

        // ユーザープロフィールを取得するAPIエンドポイントに合わせて修正
        const response = await fetch(`${apiUrl}/profiles/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || `ユーザーID ${userId} のプロフィール情報の取得に失敗しました。`);
        }

        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message);
        console.error('プロフィール情報取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]); // `userId` が変更された場合に再実行

  if (loading) {
    return <div>プロフィールを読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  if (!userProfile) {
    return <div>ユーザーが見つかりません。</div>;
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md overflow-hidden">
        {/* 背景画像 */}
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
          {/* アバター */}
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

          {/* ユーザー情報 */}
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
            {/* 他のプロフィール情報を表示 */}
          </div>

          {/* 必要に応じてフォローボタンなどを追加 */}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;