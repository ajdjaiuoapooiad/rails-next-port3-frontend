'use client';

import React, { useState, useEffect, useCallback } from 'react';

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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link';

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
        return (
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-20 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {likedPosts.map((post) => (
                <Card key={post.id} className="transition-shadow hover:shadow-lg border-0">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            {post.user_icon_url ? (
                                <img
                                    src={post.user_icon_url}
                                    alt={`${post.user?.display_name || post.user?.username || '不明'}さんのアイコン`}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 rounded-full text-gray-400" />
                            )}
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    {post.user?.display_name || post.user?.username || '不明'}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-gray-700 leading-relaxed">
                                <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition-colors">
                                    {post.content?.length > 70 ? post.content.substring(0, 70) + '...' : post.content}
                                </Link>
                            </p>
                            <div className="flex justify-between items-center text-gray-500 text-sm">
                                 <div className="flex space-x-4">
                                    <Button variant="ghost" size="sm" className="hover:text-blue-500">
                                        <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                                        <span>{post.comments_count || 0}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="hover:text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                        </svg>
                                        4
                                    </Button>
                                    <div className="flex items-center">
                                        <LikeButton postId={post.id} isLiked={post.is_liked_by_current_user || false} onLikeChange={handleLikeChange} />
                                        <span className="text-gray-600 text-sm ml-1">{post.likes_count || 0}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="hover:text-gray-700">
                                    <EllipsisHorizontalIcon className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default LikedPostsList;
