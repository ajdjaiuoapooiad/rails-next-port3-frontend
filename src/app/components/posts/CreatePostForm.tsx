'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, ImagePlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string;
  bg_image_url?: string;
  is_following?: boolean;
  display_name?: string | null;
}

interface CreatePostFormProps {
  onPostCreated: () => void;
  userId: string | null;
  postType: string;
  token: string | null;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated, userId, postType, token }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ユーザー情報を取得する関数
  const fetchUserInfo = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error(`Failed to fetch user info: ${res.status}`);
        return null;
      }
      const data: UserProfile = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  // コンポーネントのマウント時にユーザー情報を取得
  useEffect(() => {
    if (userId && token) {
      fetchUserInfo(userId, token).then(userInfo => {
        setUser(userInfo);
      });
    }
  }, [userId, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() || selectedImage) { // テキストか画像があれば投稿可能
      setIsSubmitting(true);
      if (userId && token) {
        const success = await createPost(content, userId, postType, token, selectedImage);
        if (success) {
          setContent('');
          setSelectedImage(null);
          setImagePreview(null);
          onPostCreated();
        } else {
          alert('投稿に失敗しました');
        }
      } else {
        alert('ユーザー情報またはトークンがありません');
      }
      setIsSubmitting(false);
    }
  };

  async function createPost(content: string, userId: string, postType: string, token: string, image: File | null) {
    try {
      const formData = new FormData();
      formData.append('post[content]', content);
      formData.append('post[post_type]', postType);
      formData.append('post[user_id]', userId);

      if (image) {
        formData.append('post[media]', image);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text(); // エラーレスポンスのテキストを取得
        console.error(`Failed to create post: ${res.status} - ${errorText}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Card className="bg-white shadow-md rounded-lg h-48">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Avatar className="h-6 w-6">
            {user?.user_icon_url ? (
              <AvatarImage src={user.user_icon_url} alt={`${user?.display_name || user?.username || '投稿者'}のアイコン`} className="rounded-full" />
            ) : (
              <AvatarFallback className="text-gray-400">
                <User className="h-3 w-3" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-base text-gray-900 truncate">
            {user?.display_name || user?.username || '投稿者'}
          </div>
        </CardTitle>
        <div className="text-xs text-gray-500 pt-1">新しい投稿を作成</div>
      </CardHeader>
      <CardContent className="">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <Textarea
              id="postContent"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 text-sm"
              placeholder="今何してる？"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              maxLength={280}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {content.length} / 280
            </p>
          </div>

          {/* 画像プレビュー */}
          {imagePreview && (
            <div className="relative max-h-48 overflow-hidden rounded-md">
              <img
                src={imagePreview}
                alt="投稿プレビュー"
                className="w-full object-contain"
                style={{ maxHeight: '12rem' }}
              />
              <Button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                size="icon"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          )}

          {/* 画像選択ボタン */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="imageInput">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors text-xs px-2 py-1"
                disabled={isSubmitting}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                画像
              </Button>
            </label>
            {selectedImage && (
              <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[150px]">{selectedImage.name}</span>
            )}
          </div>

          <CardFooter className="justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              className={cn(
                "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200 text-sm",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  投稿
                </>
              ) : (
                '投稿'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
