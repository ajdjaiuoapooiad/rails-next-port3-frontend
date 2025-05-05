'use client';

import React, { useEffect, useState, useCallback } from 'react';

import {
    MessageCircle,
    Heart,
    Share,
    MoreHorizontal,
    User,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // shadcn/uiのButton
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'; // shadcn/uiのCard
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"  //shadcn/ui
import { cn } from '@/lib/utils'; // utility関数
import { Post } from '@/app/utils/types';
import LikeButton from './LikeButton';
import Link from 'next/link';

const PostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
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
            const data: Post[] = await res.json();
            setPosts(data);
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError('投稿の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

      const handleLikeChange = (postId: number, liked: boolean) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        likes_count: liked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1,
                        is_liked_by_current_user: liked,
                    }
                    : post
            )
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                <span className="ml-2 text-gray-500">読み込み中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8 text-red-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <Card
                    key={post.id}
                    className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <Avatar className="h-9 w-9">
                            {post.user_icon_url ? (
                                <AvatarImage src={post.user_icon_url} alt={`${post.user?.display_name || post.user?.username || '不明'}のアイコン`} />
                            ) : (
                                <AvatarFallback>
                                    <User className="h-6 w-6 text-gray-400" />
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="ml-3">
                            <Link href={`/users/${post.user_id}/profile`} className="hover:underline">
                                <span className="text-sm font-semibold text-gray-800">
                                    {post.user?.display_name || post.user?.username || '不明'}
                                </span>
                            </Link>
                        </div>
                        <div className="ml-auto">
                            <p className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>

                    </CardHeader>
                    <CardContent>
                        <Link href={`/posts/${post.id}`} className="hover:underline">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                {post.content?.length > 70 ? post.content.substring(0, 70) + '...' : post.content}
                            </h2>
                        </Link>
                        {post.media_url && (
                            <div className="mt-2">
                                {/* */}
                                <img src={post.media_url} alt="投稿メディア"  className="rounded-md max-h-64 object-cover w-full"/>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between text-gray-500 text-sm">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
                                <MessageCircle className="h-5 w-5" />
                                <span>{post.comments_count || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032-.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                </svg>
                                <span>4</span>
                            </Button>
                            <div className="flex items-center space-x-1">
                                <LikeButton postId={post.id} isLiked={post.is_liked_by_current_user || false} onLikeChange={handleLikeChange} />
                                <span className="text-gray-600">{post.likes_count || 0}</span>
                            </div>

                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none">
                                <Share className="h-5 w-5" />
                                <span>Share</span>
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="hover:text-gray-700 focus:outline-none">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default PostList;

