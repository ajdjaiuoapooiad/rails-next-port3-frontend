// components/CreatePostForm.tsx
'use client';

import React, { useState, FormEvent } from 'react';

interface CreatePostFormProps {
  onPostCreated: () => void;
  userId: string | null;
  postType: string;
  token: string | null;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated, userId, postType, token }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
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
    <div className="bg-white shadow-md rounded-md p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="postContent" className="sr-only">
            投稿内容
          </label>
          <textarea
            id="postContent"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="今何してる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
          >
            投稿する
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;