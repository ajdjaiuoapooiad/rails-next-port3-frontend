// pages/index.tsx (または app/page.tsx)
'use client';

import React from 'react';
import PostList from '../components/posts/PostList';
import CreatePostForm from '../components/posts/CreatePostForm';


const PostIndexPage = () => {
  // 例: ローカルストレージから user_id と token を取得
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const postType = 'text';

  const handlePostCreated = () => {
    window.location.reload();
  };

  if (!userId || !authToken) {
    return <div>ログインしてください</div>; // ログインしていない場合の処理
  }

  return (
    <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
          投稿一覧
        </h1>
        <CreatePostForm
          onPostCreated={handlePostCreated}
          userId={userId}
          postType={postType}
          token={authToken}
        />
        <PostList />
      </div>
    </div>
  );
};

export default PostIndexPage;