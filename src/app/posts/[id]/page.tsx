'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  HeartIcon as HeartSolidIcon,
  TrashIcon, // 削除アイコンを追加
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import LikeButton from '@/app/components/posts/LikeButton';

interface Post {
  id: number;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    user_icon_url?: string;
  };
  likes_count?: number;
  is_liked_by_current_user?: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number; // 追加: ユーザー ID
  post_id: number; // 追加: 投稿 ID
  user?: {
    id?: number; // コメント投稿者の ID
    username?: string;
    user_icon_url?: string;
  };
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
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

async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to fetch comments for post ${postId}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
}

async function postComment(postId: string, content: string): Promise<Comment | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify({ comment: { content } }),
    });
    if (!res.ok) {
      console.error(`Failed to post comment for post ${postId}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error posting comment for post ${postId}:`, error);
    return null;
  }
}

async function deleteComment(commentId: number): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (res.ok) {
      return true;
    } else {
      console.error(`Failed to delete comment with id ${commentId}: ${res.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting comment with id ${commentId}:`, error);
    return false;
  }
}

export default function DetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // 現在のユーザーの ID を保持

  const fetchDetailedPost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    const fetchedPost = await fetchPost(postId);
    if (fetchedPost) {
      setPost(fetchedPost);
    } else {
      setError('投稿の読み込みに失敗しました。');
    }
    setLoading(false);
  }, []);

  const fetchPostComments = useCallback(async (postId: string) => {
    setLoadingComments(true);
    setErrorComments(null);
    const fetchedComments = await fetchComments(postId);
    setComments(fetchedComments);
    setLoadingComments(false);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUserId(userData.id);
      } else {
        console.error('Failed to fetch current user');
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    fetchDetailedPost(id);
    fetchPostComments(id);
    fetchCurrentUser();
  }, [fetchDetailedPost, fetchPostComments, fetchCurrentUser, id]);

  const handleLikeChange = (postId: number, liked: boolean) => {
    if (post && post.id === postId) {
      setPost((prevPost) => ({
        ...prevPost!,
        likes_count: liked ? (prevPost?.likes_count || 0) + 1 : (prevPost?.likes_count || 1) - 1,
        is_liked_by_current_user: liked,
      }));
    }
  };

  const handleCommentInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentInput(event.target.value);
  };

  const handleSubmitComment = async () => {
    if (commentInput.trim()) {
      const newComment = await postComment(id, commentInput);
      if (newComment) {
        setCommentInput('');
        fetchPostComments(id); // コメント投稿後に一覧を再読み込み
      } else {
        console.error('コメントの投稿に失敗しました。');
        // 必要に応じてエラーメッセージを表示
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    } else {
      console.error(`コメント ID ${commentId} の削除に失敗しました。`);
      // 必要に応じてエラーメッセージを表示
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!post) {
    return <div>投稿が見つかりませんでした。</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md p-6 mt-8">
      {/* 投稿の詳細表示 (省略) */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex items-center flex-shrink-0">
          <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
          <span className="text-sm font-semibold text-gray-800">
            {post.user?.username || '不明'}
          </span>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
      <div className="flex justify-between text-gray-500 text-sm mt-2">
        <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="text-gray-600 text-sm">{comments.length}</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
          {/* カスタム SVG リツイートアイコン */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
          </svg>
        </button>
        <div className="flex items-center space-x-1">
          <LikeButton
            postId={post.id}
            isLiked={post.is_liked_by_current_user || false}
            onLikeChange={handleLikeChange}
          />
          <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
        </div>
        <button className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
          <ShareIcon className="h-5 w-5" />
          {/* <span className="text-gray-600 text-sm">{post.likes_count || 0}</span> */}
        </button>
        <button className="hover:text-gray-700 focus:outline-none">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        <span><strong>作成日時:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {/* コメント表示 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">コメント</h3>
        {loadingComments ? (
          <div className="text-gray-500">コメントを読み込み中...</div>
        ) : errorComments ? (
          <div className="text-red-500">{errorComments}</div>
        ) : comments.length > 0 ? (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id} className="bg-gray-100 rounded-md p-3 mb-2">
                <div className="flex items-start space-x-2">
                  <UserCircleIcon className="h-6 w-6 rounded-full text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{comment.user?.username || '不明'}</p>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                        <p className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                  
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <TrashIcon className="h-5 w-5" />
                          削除
                        </button>
               
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">まだコメントはありません。</div>
        )}
      </div>

      {/* コメント入力フォーム */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">コメントする</h3>
        <textarea
          value={commentInput}
          onChange={handleCommentInputChange}
          rows={3}
          className="w-full border rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          placeholder="コメントを入力してください..."
        />
        <button
          onClick={handleSubmitComment}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-2 focus:outline-none focus:shadow-outline"
        >
          送信
        </button>
      </div>
    </div>
  );
}