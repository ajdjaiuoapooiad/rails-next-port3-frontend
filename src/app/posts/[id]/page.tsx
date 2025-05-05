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
import { Comment, Post } from '@/app/utils/types';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`, { // ユーザーIDで取得するのは不適切なので修正が必要
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
    }, [id]);

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
                await fetchPostComments(id); // コメント投稿後に一覧を再読み込み
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
        return (
            <Card className="max-w-2xl mx-auto mt-8 border-0">
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
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4"><Skeleton className="h-6 w-1/3" /></h3>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="mb-4">
                                <div className="flex items-start space-x-4">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-full mt-2" />
                                                <Skeleton className="h-3 w-1/4 mt-2" />
                                            </div>
                                            <Skeleton className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2"><Skeleton className="h-6 w-1/3" /></h3>
                        <Skeleton className="h-10 w-full" />
                        <div className="mt-2">
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="max-w-2xl mx-auto mt-8 border-0">
                <CardContent>
                    <div className="text-center py-4 text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!post) {
        return (
            <Card className="max-w-2xl mx-auto mt-8 border-0">
                <CardContent>
                    <div className="text-center py-4">投稿が見つかりませんでした。</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto mt-8 border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar>
                        {post.user_icon_url ? (
                            <AvatarImage
                                src={post.user_icon_url}
                                alt={`${post.user?.display_name || post.user?.username || '不明'}のアイコン`}
                                onError={(e) => {
                                    console.error('Failed to load user icon:', post.user_icon_url);
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).src = '';
                                }}
                            />
                        ) : (
                            <AvatarFallback className="text-gray-400">
                                <UserCircleIcon className="h-8 w-8" />
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            <Link href={`/users/${post.user_id}/profile`} className="hover:text-blue-500 transition-colors">
                                {post.user?.display_name || post.user?.username || '不明'}
                            </Link>
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>
                <div className="flex justify-between items-center text-gray-500 text-sm">
                    <div className="flex space-x-4">
                        <Button variant="ghost" size="sm" className="hover:text-blue-500">
                            <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                            <span>{comments.length}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                            </svg>
                        </Button>
                        <div className="flex items-center">
                            <LikeButton
                                postId={post.id}
                                isLiked={post.is_liked_by_current_user || false}
                                onLikeChange={handleLikeChange}
                            />
                            <span className="text-gray-600 text-sm ml-1">{post.likes_count || 0}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:text-gray-700 focus:outline-none">
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
                <span>作成日時: {new Date(post.created_at).toLocaleDateString()}</span>
            </CardFooter>

            {/* コメント表示 */}
            <CardContent className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">コメント</h3>
                {loadingComments ? (
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-full mt-2" />
                                            <Skeleton className="h-3 w-1/4 mt-2" />
                                        </div>
                                        <Skeleton className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : errorComments ? (
                    <div className="text-red-500">{errorComments}</div>
                ) : comments.length > 0 ? (
                    <ul className="space-y-4">
                        {comments.map((comment) => (
                            <li key={comment.id} className="bg-gray-100 rounded-md p-4">
                                <div className="flex items-start space-x-4">
                                    <Avatar>
                                        {comment.user_icon_url ? (
                                            <AvatarImage
                                                src={comment.user_icon_url}
                                                alt={`${comment.display_name || comment.user?.username || '不明'}のアイコン`}
                                                onError={(e) => {
                                                    console.error('Failed to load user icon:', comment.user?.user_icon_url);
                                                    (e.target as HTMLImageElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = '';
                                                }}
                                            />
                                        ) : (
                                            <AvatarFallback className="text-gray-400">
                                                <UserCircleIcon className="h-8 w-8" />
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/users/${comment.user_id}/profile`} className="hover:text-blue-500 transition-colors">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {comment.user?.display_name || comment.user?.username || '不明'}
                                                        </p>
                                                    </Link>
                                                </div>
                                                <p className="text-gray-700 text-sm whitespace-pre-line">{comment.content}</p>
                                                <p className="text-gray-500 text-xs mt-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                                            </div>
                                            {currentUserId === comment.user?.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                                    aria-label="コメントを削除"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500">まだコメントはありません。</div>
                )}
            </CardContent>

            {/* コメント入力フォーム */}
            <CardContent className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">コメントする</h3>
                <Textarea
                    value={commentInput}
                    onChange={handleCommentInputChange}
                    rows={3}
                    className="w-full border rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="コメントを入力してください..."
                    aria-label="コメント入力欄"
                />
                <Button
                    onClick={handleSubmitComment}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-2 focus:outline-none focus:shadow-outline"
                >
                    送信
                </Button>
            </CardContent>
        </Card>
    );
}
