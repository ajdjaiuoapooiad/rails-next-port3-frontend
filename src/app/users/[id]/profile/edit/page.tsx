'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ImagePlus, Loader2, User, File } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isSaving, setIsSaving] = useState(false);
  const [userIconPreview, setUserIconPreview] = useState<string | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);


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
        if (data.user_icon_url) {
          setUserIconPreview(data.user_icon_url)
        }
        if (data.bg_image_url) {
          setBgImagePreview(data.bg_image_url);
        }

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
    setIsSaving(true);
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
      setIsSaving(false);
      setLoading(false); // エラー発生時もローディング状態を解除
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
      const file = e.target.files[0];
      setUserIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserIconPreview(reader.result as string);
        setProfileData((prevData) => ({ ...prevData, user_icon_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setUserIcon(null);
      setUserIconPreview(null)
    }
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImagePreview(reader.result as string);
        setProfileData((prevData) => ({ ...prevData, bg_image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setBgImage(null);
      setBgImagePreview(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-md p-6">
          <h2 className="text-lg font-semibold mb-4"><Skeleton className="h-8 w-32" /></h2>
          <div className="space-y-4">
            <div>
              <Label><Skeleton className="h-4 w-24" /></Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Label><Skeleton className="h-4 w-24" /></Label>
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Label><Skeleton className="h-4 w-24" /></Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Label><Skeleton className="h-4 w-24" /></Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Label><Skeleton className="h-4 w-32" /></Label>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Label><Skeleton className="h-4 w-32" /></Label>
              <div className="flex flex-col gap-4">
                <Skeleton className="h-32 w-full rounded" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 mr-2" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-md p-6">
          <div className="text-red-500">エラーが発生しました: {error}</div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-md p-6">
          <div className="text-gray-600">プロフィール情報が見つかりません。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">プロフィール編集</CardTitle>
            <CardDescription>
              {profileData.username} のプロフィールを編集します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label htmlFor="displayName" className="text-sm font-medium">表示名</Label>
                <Input
                  type="text"
                  id="displayName"
                  name="display_name"
                  value={profileData.display_name || ''}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="表示名を入力してください"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-sm font-medium">自己紹介</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleChange}
                  className="mt-1 min-h-[120px] resize-y"
                  placeholder="自己紹介を入力してください"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">場所</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location || ''}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="場所を入力してください"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-sm font-medium">ウェブサイト</Label>
                <Input
                  type="text"
                  id="website"
                  name="website"
                  value={profileData.website || ''}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="ウェブサイトのURLを入力してください"
                />
              </div>
              <div>
                <Label htmlFor="userIcon" className="text-sm font-medium">プロフィールアイコン</Label>
                <div className="mt-1 flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    {userIconPreview ? (
                      <AvatarImage src={userIconPreview} alt="プロフィールアイコン" className="rounded-full" />
                    ) : profileData?.user_icon_url ? (
                      <AvatarImage src={profileData.user_icon_url} alt="現在のアイコン" className="rounded-full" />
                    ) : (
                      <AvatarFallback>
                        <User className="h-6 w-6 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <Input
                      type="file"
                      id="userIcon"
                      name="user_icon"
                      accept="image/*"
                      onChange={handleUserIconChange}
                      className="w-full"
                    />
                    {userIcon && (
                      <span className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{userIcon.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="bgImage" className="text-sm font-medium">背景画像</Label>
                <div className="mt-1 flex flex-col gap-4">
                  {bgImagePreview && (
                    <div className="relative max-h-48 overflow-hidden rounded-md">
                      <img
                        src={bgImagePreview}
                        alt="背景画像プレビュー"
                        className="w-full object-cover"
                        style={{ maxHeight: '12rem' }}
                      />
                    </div>
                  )}
                  {profileData?.bg_image_url && !bgImagePreview && (
                    <div className="relative max-h-48 overflow-hidden rounded-md">
                      <img
                        src={profileData.bg_image_url}
                        alt="現在の背景画像"
                        className="w-full object-cover"
                        style={{ maxHeight: '12rem' }}
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    id="bgImage"
                    name="bg_image"
                    accept="image/*"
                    onChange={handleBgImageChange}
                    className="w-full"
                  />
                  {bgImage && (
                    <span className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{bgImage.name}</span>
                  )}
                </div>
              </div>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      保存しています...
                    </>
                  ) : (
                    '保存'
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEditPage;
