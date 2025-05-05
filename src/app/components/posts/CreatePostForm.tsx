'use client';

import React, { useState, FormEvent } from 'react';
import { Textarea } from "@/components/ui/textarea" //shadcn/ui
import { Button } from "@/components/ui/button"  //shadcn/ui
import { Card, CardContent, CardFooter } from "@/components/ui/card" //shadcn/ui

interface CreatePostFormProps {
  onPostCreated: () => void;
  userId: string | null;
  postType: string;
  token: string | null;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated, userId, postType, token }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      setIsSubmitting(true); // 投稿処理中フラグを立てる
      if (userId && token) {
        const success = await createPost(content, userId, postType, token);
        if (success) {
          setContent('');
          onPostCreated();
        } else {
          alert('投稿に失敗しました');
        }
      } else {
        alert('ユーザー情報またはトークンがありません');
      }
      setIsSubmitting(false); // 投稿処理終了フラグを下げる
    }
  };

  async function createPost(content: string, userId: string, postType: string, token: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 認証トークンをヘッダーに含める
        },
        body: JSON.stringify({
          post: {
            content: content,
            post_type: postType,
            user_id: parseInt(userId, 10),
          },
        }),
      });
      if (!res.ok) {
        console.error(`Failed to create post: ${res.status}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  }

  return (
    <Card className="bg-white shadow-md rounded-md">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              id="postContent"
              rows={3}
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="今何してる？"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting} // 投稿中は入力不可にする
            />
          </div>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              disabled={isSubmitting} // 投稿中はボタンを無効化
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  投稿中...
                </>
              ) : (
                '投稿する'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
