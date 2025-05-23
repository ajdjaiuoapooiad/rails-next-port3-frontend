'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import LikeButton from './LikeButton';
import { useRouter } from 'next/navigation';
import { Post } from '@/app/utils/types';

interface PostListProps {
  userId?: number; // 特定のユーザーの投稿をフェッチする場合に使用
}

const CurrentUserPostList: React.FC<PostListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ellipsisButtonRef = useRef<HTMLButtonElement>(null);
  const loggedInUserId = localStorage.getItem('userId'); // localStorage からログインユーザーIDを取得


  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません。');
      }
      let url = `${apiUrl}/posts`;
      if (userId) {
        url += `?user_id=${userId}`;
      }

      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
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
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeChange = (postId: number, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, likes_count: liked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1, is_liked_by_current_user: liked }
          : post
      )
    );
  };

  const toggleDropdown = (postId: number, event: React.MouseEvent<HTMLButtonElement>, postUserId: number | undefined) => {
    // 投稿の user_id とログインしている user_id が一致する場合のみドロップダウンを開く
    if (postUserId?.toString() === loggedInUserId) {
      setOpenDropdownId((prevId) => (prevId === postId ? null : postId));
      ellipsisButtonRef.current = event.currentTarget;
    }
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('本当にこの投稿を削除しますか？')) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!res.ok) {
        const errorMessage = `Failed to delete post: ${res.status}`;
        console.error(errorMessage);
        alert('投稿の削除に失敗しました。');
        return;
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      closeDropdown();
      router.refresh();
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert('投稿の削除中にエラーが発生しました。');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && ellipsisButtonRef.current !== event.target) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition duration-300 relative">
          <div className="flex items-start space-x-3">
            <div className="flex items-center flex-shrink-0">
              <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
              <span className="text-sm font-semibold text-gray-800">
                {post.user?.username || '不明'}
              </span>
            </div>
            <br />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">
                  <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                  {post.content?.length > 70 ? post.content.substring(0, 70) + '...' : post.content}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between text-gray-500 text-sm mt-2">
                <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                  4
                </button>
                <div className="flex items-center space-x-1">
                  <LikeButton postId={post.id} isLiked={post.is_liked_by_current_user || false} onLikeChange={handleLikeChange} />
                  <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={(event) => toggleDropdown(post.id, event, post.user?.id)} // post.user?.id を渡す
                    className="hover:text-gray-700 focus:outline-none"
                    aria-label="投稿オプション"
                    ref={ellipsisButtonRef}
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  {openDropdownId === post.id && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md z-10">
                      <button
                        onClick={() => router.push(`/posts/${post.id}/edit`) }
                        className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none"
                      >
                        編集
                      </button>
                      {/* 他のオプションもここに追加できます */}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none"
                      >
                        詳細
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 focus:outline-none"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CurrentUserPostList;