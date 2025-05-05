'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/outline';
import LikeButton from './LikeButton';
import Image from 'next/image';

interface Post {
  id: number;
  user_id: number;
  content: string;
  post_type: string | null;
  media_url: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    password_digest: string;
    username: string;
    display_name: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    profile?: {
      id: number;
      user_id: number;
      bio: string | null;
      location: string | null;
      website: string | null;
      display_name: string | null;
      created_at: string;
      updated_at: string;
    };
  };
  likes_count?: number;
  is_liked_by_current_user?: boolean;
  user_icon_url?: string;
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (!res.ok) {
        const errorMessage = `Failed to fetch posts: ${res.status}`;
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }
      const data: Post[] = await res.json(); // 型アサーション
      setPosts(data);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('投稿の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeChange = (postId: number, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, likes_count: liked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1, is_liked_by_current_user: liked }
          : post
      )
    );
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <ul className="mt-6 space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition duration-300">
          <div className="flex items-start space-x-3">
            <div className="flex items-center flex-shrink-0 ">
              {post?.user_icon_url ? (
                <img
                  src={post.user_icon_url}
                  alt={`${post.user?.username || '不明'}のアイコン`}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
              )}
              <span className="text-sm font-semibold text-gray-800">
                {post.user?.username || '不明'}
              </span>
            </div>
            <br />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">
                  <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                    {post.content?.length > 70 ? post.content.substring(0, 70) + '...' : post.content}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between text-gray-500 text-sm mt-2">
                <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032-.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                  4
                </button>
                <div className="flex items-center space-x-1">
                  <LikeButton postId={post.id} isLiked={post.is_liked_by_current_user || false} onLikeChange={handleLikeChange} />
                  <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
                </div>
                <button className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
                  <ShareIcon className="h-5 w-5" />
                  <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
                </button>
                <button className="hover:text-gray-700 focus:outline-none">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;