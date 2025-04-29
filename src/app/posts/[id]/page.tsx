import React from 'react';

async function fetchPost(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/posts/${id}`);
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
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6 mt-8">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{post.title || 'No Title'}</h1>
      <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
      <div className="text-sm text-gray-500">
        <span><strong>作成者:</strong> {post.user?.username || '不明'}</span>
        <br />
        <span><strong>作成日時:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      {/* 必要に応じて他の情報やアクションを追加 */}
    </div>
  );
}