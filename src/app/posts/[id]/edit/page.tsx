'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  content: string;
  // 他の投稿データ
}

interface EditPostPageProps {
  params: {
    id: string;
  };
}

const EditPostPage: React.FC<EditPostPageProps> = ({ params }) => {
  const postId = parseInt(params.id, 10);
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません。');
        }
        const res = await fetch(`${apiUrl}/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });
        if (!res.ok) {
          const errorMessage = `投稿の読み込みに失敗しました: ${res.status}`;
          console.error(errorMessage);
          setError(errorMessage);
          return;
        }
        const data = await res.json() as Post;
        setPost(data);
        setContent(data.content); // 初期値を設定
      } catch (err: any) {
        console.error('投稿の読み込みエラー:', err);
        setError('投稿の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(postId)) {
      fetchPost();
    } else {
      setError('無効な投稿IDです');
      setLoading(false);
    }
  }, [postId]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません。');
      }
      const res = await fetch(`${apiUrl}/posts/${postId}`, {
        method: 'PUT', // または PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errorMessage = `投稿の更新に失敗しました: ${res.status}`;
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }
      router.push(`/posts/${postId}`); // 成功したら詳細ページへリダイレクト
    } catch (err: any) {
      console.error('投稿の更新エラー:', err);
      setError('投稿の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (!post) {
    return <div>投稿が見つかりません</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">投稿を編集</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              className="shadow appearance-none border rounded w-full pb-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={5}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? '更新中...' : '更新'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;