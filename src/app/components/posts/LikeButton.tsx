// components/LikeButton.tsx
import React, { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid'; // 例
import HeartFillIcon from './HeartFillIcon';

interface LikeButtonProps {
  postId: number;
  isLiked: boolean;
  onLikeChange: (postId: number, isLiked: boolean) => void; // いいね状態が変更されたことを親コンポーネントに通知するコールバック
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, isLiked: initialIsLiked, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleLike = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('認証トークンが見つかりません。');
      }
      const response = await fetch(`${apiUrl}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ like: { post_id: postId } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'いいねに失敗しました。');
      }
      setIsLiked(true);
      onLikeChange(postId, true); // 親コンポーネントに通知
    } catch (err: any) {
      setError(err.message);
      console.error('いいねエラー:', err);
      // 必要に応じてエラー表示
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('認証トークンが見つかりません。');
      }
      // DELETEリクエストのbodyでパラメータを送ることは一般的ではないため、query parameterを使用
      const response = await fetch(`${apiUrl}/likes?like[post_id]=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'いいね解除に失敗しました。');
      }
      setIsLiked(false);
      onLikeChange(postId, false); // 親コンポーネントに通知
    } catch (err: any) {
      setError(err.message);
      console.error('いいね解除エラー:', err);
      // 必要に応じてエラー表示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isLiked ? (
        <button onClick={handleUnlike} disabled={loading}>
          {loading ? <HeartIcon className="h-5 w-5 text-gray-500" /> : <HeartFillIcon className="h-5 w-5 text-red-500" />}
        </button>
      ) : (
        <button onClick={handleLike} disabled={loading}>
          {loading ? <HeartIcon className="h-5 w-5 text-gray-500" /> : <HeartFillIcon className="h-5 w-5 text-gray-500" />}
        </button>
      )}
    </div>
  );
};

export default LikeButton;