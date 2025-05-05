'use client';

import React from 'react';
import PostList from '../components/posts/PostList';
import CreatePostForm from '../components/posts/CreatePostForm';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card" // UI Components
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button" // UI Components

const PostIndexPage = () => {
  // 例: ローカルストレージから user_id と token を取得
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const postType = 'text';

  const handlePostCreated = () => {
    // リロードではなく、新しい投稿をリストに追加する処理が理想的ですが、
    // 今回は簡易的にページ全体をリロードします。
    window.location.reload();
  };

  if (!userId || !authToken) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Card className="max-w-lg shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">ログインが必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                投稿を閲覧・作成するには、ログインしてください。
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild>
                <a href="/login">ログインページへ</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          みんなの投稿
        </h1>
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">新規投稿</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePostForm
              onPostCreated={handlePostCreated}
              userId={userId}
              postType={postType}
              token={authToken}
            />
          </CardContent>
        </Card>
        <PostList />
      </div>
    </div>
  );
};

export default PostIndexPage;
