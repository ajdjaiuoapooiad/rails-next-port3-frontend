'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import LikeButton from '@/app/components/posts/LikeButton';

interface Post {
  id: number;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    user_icon_url?: string;
  };
  likes_count?: number;
  is_liked_by_current_user?: boolean;
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to fetch post with id ${id}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    return null;
  }
}

export default function DetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailedPost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    const fetchedPost = await fetchPost(postId);
    if (fetchedPost) {
      setPost(fetchedPost);
    } else {
      setError('投稿の読み込みに失敗しました。');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDetailedPost(id);
  }, [fetchDetailedPost, id]);

  const handleLikeChange = (postId: number, liked: boolean) => {
    if (post && post.id === postId) { // 正しい投稿の ID を確認
      setPost((prevPost) => ({
        ...prevPost!,
        likes_count: liked ? (prevPost?.likes_count || 0) + 1 : (prevPost?.likes_count || 1) - 1,
        is_liked_by_current_user: liked,
      }));
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!post) {
    return <div>投稿が見つかりませんでした。</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md p-6 mt-8">
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex items-center flex-shrink-0">
          <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
          <span className="text-sm font-semibold text-gray-800">
            {post.user?.username || '不明'}
          </span>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
      <div className="flex justify-between text-gray-500 text-sm mt-2">
        <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
          <ChatBubbleLeftIcon className="h-5 w-5" />
        </button>
        <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
          {/* カスタム SVG リツイートアイコン */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
          </svg>
        </button>
        <div className="flex items-center space-x-1">
          <LikeButton
            postId={post.id}
            isLiked={post.is_liked_by_current_user || false}
            onLikeChange={handleLikeChange} // 修正後の handleLikeChange を渡す
          />
          <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
        </div>
        <button className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
          <ShareIcon className="h-5 w-5" />
        </button>
        <button className="hover:text-gray-700 focus:outline-none">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        <span><strong>作成日時:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}