'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string;
  bg_image_url?: string;
  display_name?: string;
}

const ProfileEditPage: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません');
        }
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('認証トークンが見つかりません');
        }
        const response = await fetch(`${apiUrl}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'プロフィールの取得に失敗しました');
        }
        const data: UserProfile = await response.json();
        setProfileData(data);
      } catch (err: any) {
        setError(err.message);
        console.error('プロフィールの取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    // ここでAPIに更新データを送信する処理を実装
    console.log('保存処理', profileData);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません');
      }
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const response = await fetch(`${apiUrl}/profile`, { // PUTリクエストに変更する想定
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData), // 更新するデータを送信
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'プロフィールの更新に失敗しました');
      }

      // 更新成功時の処理 (例: プロフィールページにリダイレクト)
      router.push(`/users/profile/${profileData?.id}`); // プロフィールページにリダイレクト
    } catch (err: any) {
      setError(err.message);
      console.error('プロフィールの更新エラー:', err);
    }
  };

  const handleCancel = () => {
    router.push(`/users/profile/${profileData?.id}`); // プロフィールページにリダイレクト
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading) {
    return <div>プロフィール情報を読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  if (!profileData) {
    return <div>プロフィール情報が見つかりません。</div>;
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-lg font-semibold mb-4">プロフィール編集</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">表示名</label>
            <input type="text" id="displayName" name="display_name" value={profileData.display_name || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">自己紹介</label>
            <textarea id="bio" name="bio" value={profileData.bio || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">場所</label>
            <input type="text" id="location" name="location" value={profileData.location || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="website" className="block text-gray-700 text-sm font-bold mb-2">ウェブサイト</label>
            <input type="text" id="website" name="website" value={profileData.website || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          {/* 画像アップロードのinput要素もここに追加 */}
          <div className="flex justify-end">
            <button type="button" onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
              キャンセル
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;