import React from 'react';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link'; // Link コンポーネントを追加

async function fetchPost(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/posts/${id}`, {
      cache: 'no-store', // キャッシュを無効にする
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

export default async function DetailPage({ params }) {
  const { id } = params;
  const post = await fetchPost(id);

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
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
      <div className="text-sm text-gray-500 mt-2">
        <span><strong>作成日時:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}