import Link from 'next/link';
import React from 'react';

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
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                  {post.title || post.content?.substring(0, 50) + '...'}
                </Link>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3">{post.content}</p>
              <div className="text-sm text-gray-500">
                <span><strong>作成者:</strong> {post.user?.username || '不明'}</span>
                <br />
                <span><strong>作成日時:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}