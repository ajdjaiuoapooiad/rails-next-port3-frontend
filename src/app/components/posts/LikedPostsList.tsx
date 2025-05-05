// src/app/components/posts/LikedPostsList.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ChatBubbleLeftIcon,
    HeartIcon as HeartOutlineIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    UserCircleIcon,
    HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/outline';
import LikeButton from './LikeButton';
import { Post } from '@/app/utils/types';
import Image from 'next/image'; // Image コンポーネントをインポート

interface LikedPostsListProps {
    userId: number; // 特定のユーザーがいいねした投稿をフェッチするために使用
}

const LikedPostsList: React.FC<LikedPostsListProps> = ({ userId }) => {
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLikedPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('API URLが設定されていません。');
            }
            const token = localStorage.getItem('authToken');
            const url = `${apiUrl}/posts?user_id=${userId}&is_liked_by_current_user=true`;

            const res = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const errorMessage = `Failed to fetch liked posts: ${res.status}`;
                console.error(errorMessage);
                setError(errorMessage);
                return;
            }
            const data = await res.json();
            setLikedPosts(data);
        } catch (err: any) {
            console.error('Error fetching liked posts:', err);
            setError('いいねした投稿の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchLikedPosts();
    }, [fetchLikedPosts]);

    const handleLikeChange = (postId: number, liked: boolean) => {
        setLikedPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, likes_count: liked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1, is_liked_by_current_user: liked }
                    : post
            )
        );
    };

    if (loading) {
        return <div className="text-center py-4">いいねした投稿を読み込み中...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <ul className="space-y-4">
            {likedPosts.map((post) => (
                <li key={post.id} className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition duration-300">
                    <div className="flex items-start space-x-3">
                        <div className="flex items-center flex-shrink-0">
                            {post.user_icon_url? (
                                <img
                                    src={post.user_icon_url}
                                    alt={`${post.user?.display_name || post.user?.username || '不明'}のアイコン`}
                                    width={32}
                                    height={32}
                                    className="rounded-full mr-2"
                                />
                            ) : (
                                <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
                            )}
                            <span className="text-sm font-semibold text-gray-800">
                                {post.user?.display_name || post.user?.username || '不明'}
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
                                    <span className="text-gray-600 text-sm">{post.comments_count || 0}</span>
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
                                <button className="hover:text-gray-700 focus:outline-none">
                                    <EllipsisHorizontalIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default LikedPostsList;