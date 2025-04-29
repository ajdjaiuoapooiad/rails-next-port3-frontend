import Link from 'next/link';
import React from 'react';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

async function fetchPosts() {
  try {
    const res = await fetch('http://localhost:3000/api/v1/posts');
    if (!res.ok) {
      console.error(`Failed to fetch posts: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function PostIndexPage() {
  const posts = await fetchPosts();

  return (
    <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
          投稿一覧
        </h1>
        <ul className="mt-6 space-y-4">
          {posts.map((post: any) => (
            <li key={post.id} className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition duration-300">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-700 mb-1">
                      <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                        {post.title || post.content?.substring(0, 50) + '...'}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-2">{post.content}</p>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span>コメント</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                      </svg>

                      <span>リツイート</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-500 focus:outline-none">
                      <HeartIcon className="h-5 w-5" />
                      <span>いいね</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
                      <ShareIcon className="h-5 w-5" />
                      <span>シェア</span>
                    </button>
                    <button className="hover:text-gray-700 focus:outline-none">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span><strong>作成者:</strong> {post.user?.username || '不明'}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}