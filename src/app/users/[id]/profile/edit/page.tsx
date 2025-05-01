'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  const params = useParams();
  const { id: userIdFromParams } = params; // URLパラメータからidを取得
  const [userIcon, setUserIcon] = useState<File | null>(null);
  const [bgImage, setBgImage] = useState<File | null>(null);

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
        if (!userIdFromParams) {
          throw new Error('ユーザーIDがURLパラメータにありません');
        }
        const response = await fetch(`${apiUrl}/profiles/${userIdFromParams}`, { // URLパラメータのIDを使用
          headers: {
            'Authorization': `Bearer ${token}`,
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
  }, [userIdFromParams]); // userIdFromParams が変更されたら再実行

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
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
      if (!profileData?.id) {
        throw new Error('更新するユーザーのIDがありません');
      }

      const formData = new FormData();
      formData.append('display_name', profileData.display_name || '');
      formData.append('bio', profileData.bio || '');
      formData.append('location', profileData.location || '');
      formData.append('website', profileData.website || '');
      if (userIcon) {
        formData.append('user_icon', userIcon);
      }
      if (bgImage) {
        formData.append('bg_image', bgImage);
      }

      const response = await fetch(`${apiUrl}/profiles/${profileData.id}`, { // profileData.id を使用
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'プロフィールの更新に失敗しました');
      }

      router.push(`/users/${profileData.id}/profile`);
    } catch (err: any) {
      setError(err.message);
      console.error('プロフィールの更新エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/users/${profileData?.id}/profile`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUserIcon(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prevData) => ({ ...prevData, user_icon_url: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBgImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prevData) => ({ ...prevData, bg_image_url: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
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
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-lg font-semibold mb-4">プロフィール編集</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">表示名</label>
            <input type="text" id="displayName" name="display_name" value={profileData.display_name || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">自己紹介</label>
            <textarea id="bio" name="bio" value={profileData.bio || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 pb-72 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">場所</label>
            <input type="text" id="location" name="location" value={profileData.location || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="website" className="block text-gray-700 text-sm font-bold mb-2">ウェブサイト</label>
            <input type="text" id="website" name="website" value={profileData.website || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="userIcon" className="block text-gray-700 text-sm font-bold mb-2">プロフィールアイコン</label>
            {profileData?.user_icon_url && (
              <div className="mb-2">
                <img src={profileData.user_icon_url} alt="現在のアイコン" className="h-16 w-16 rounded-full object-cover" />
              </div>
            )}
            <input type="file" id="userIcon" name="user_icon" accept="image/*" onChange={handleUserIconChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="bgImage" className="block text-gray-700 text-sm font-bold mb-2">背景画像</label>
            {profileData?.bg_image_url && (
              <div className="mb-2">
                <img src={profileData.bg_image_url} alt="現在の背景画像" className="h-32 w-full object-cover rounded" />
              </div>
            )}
            <input type="file" id="bgImage" name="bg_image" accept="image/*" onChange={handleBgImageChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
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