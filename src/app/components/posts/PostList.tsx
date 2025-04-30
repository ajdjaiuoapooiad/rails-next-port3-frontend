// components/PostList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface Post {
  id: number;
  content: string;
  created_at: string;
  user?: {
    username?: string;
  };
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
          cache: 'no-store', // キャッシュを無効にする（必要に応じて変更）
        });
        if (!res.ok) {
          const errorMessage = `Failed to fetch posts: ${res.status}`;
          console.error(errorMessage);
          setError(errorMessage);
          return;
        }
        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError('投稿の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
              <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
              <span className="text-sm font-semibold text-gray-800">
                {post.user?.username || '不明'}
              </span>
            </div>
            <br /> {/* ユーザー名とコンテンツの間の改行 */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">
                  <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                    {post.content?.substring(0, 70) + '...'}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
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
                <button className="flex items-center space-x-1 hover:text-red-500 focus:outline-none">
                  <HeartIcon className="h-5 w-5" />
                </button>
                <button className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
                  <ShareIcon className="h-5 w-5" />
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