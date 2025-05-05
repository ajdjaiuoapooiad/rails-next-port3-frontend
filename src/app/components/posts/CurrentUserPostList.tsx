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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface PostListProps {
    userId?: number;
}

const CurrentUserPostList: React.FC<PostListProps> = ({ userId }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const ellipsisButtonRef = useRef<HTMLButtonElement>(null);
    const loggedInUserId = localStorage.getItem('userId');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('API URLが設定されてないみたい。');
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
                const errorMessage = `投稿の取得に失敗しちゃった: ${res.status}`;
                console.error(errorMessage);
                setError(errorMessage);
                return;
            }
            const data: Post[] = await res.json();
            setPosts(data);
        } catch (err: any) {
            console.error('投稿の取得でエラーが発生しちゃった:', err);
            setError('投稿の読み込みに失敗しちゃった');
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
        if (postUserId?.toString() === loggedInUserId) {
            setOpenDropdownId((prevId) => (prevId === postId ? null : postId));
            ellipsisButtonRef.current = event.currentTarget;
        }
    };

    const closeDropdown = () => {
        setOpenDropdownId(null);
    };

    const handleDeletePost = async (postId: number) => {
        if (confirm('本当にこの投稿を削除しちゃう？')) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                    },
                });

                if (!res.ok) {
                    const errorMessage = `投稿の削除に失敗しちゃった: ${res.status}`;
                    console.error(errorMessage);
                    alert('投稿の削除に失敗しちゃった。');
                    return;
                }

                setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
                closeDropdown();
                router.refresh();
            } catch (err: any) {
                console.error('投稿の削除中にエラーが発生しちゃった:', err);
                alert('投稿の削除中にエラーが発生しちゃった。');
            }
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
            {posts.map((post) => (
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:text-gray-700"
                                            aria-label="投稿オプション"
                                            ref={ellipsisButtonRef}
                                            onClick={(event) => toggleDropdown(post.id, event, post.user?.id)}
                                        >
                                            <EllipsisHorizontalIcon className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem
                                            onClick={() => router.push(`/posts/${post.id}/edit`)}
                                            className="hover:bg-gray-100 focus:outline-none"
                                        >
                                            編集
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-red-500 hover:bg-gray-100 focus:outline-none"
                                        >
                                            削除
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default CurrentUserPostList;
