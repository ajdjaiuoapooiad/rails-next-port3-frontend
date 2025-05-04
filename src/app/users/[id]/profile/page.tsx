'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import PostList from '@/app/components/posts/PostList';
import Link from 'next/link';
import CurrentUserPostList from '@/app/components/posts/CurrentUserPostList';
import LikedPostsList from '@/app/components/posts/LikedPostsList';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    location?: string;
    website?: string;
    user_icon_url?: string;
    bg_image_url?: string;
    is_following?: boolean;
}

const UserProfilePage: React.FC = () => {
    const params = useParams();
    const { id: paramId } = params;
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'following'>('posts');
    const [followLoading, setFollowLoading] = useState(false);
    const [followError, setFollowError] = useState<string | null>(null);
    const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [conversationError, setConversationError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (paramId) {
            setUserId(Array.isArray(paramId) ? paramId[0] : paramId);
        } else {
            setUserId(null);
        }
    }, [paramId]);

    const fetchUserProfile = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('API URLが設定されていません。');
            }
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${apiUrl}/profiles/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `ユーザーID ${userId} のプロフィール情報の取得に失敗しました。`);
            }

            const data: UserProfile = await response.json();
            setUserProfile(data);
            const loggedInUserId = localStorage.getItem('userId');
            setIsCurrentUserProfile(data.id === parseInt(loggedInUserId || '', 10));
        } catch (err: any) {
            setError(err.message);
            console.error('プロフィール情報取得エラー:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleFollow = async () => {
        if (!userProfile) return;
        setFollowLoading(true);
        setFollowError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('認証トークンが見つかりません。');
            }
            const response = await fetch(`${apiUrl}/follows`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ following_id: userProfile.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'フォローに失敗しました。');
            }
            fetchUserProfile();
        } catch (err: any) {
            setFollowError(err.message);
            console.error('フォローエラー:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!userProfile) return;
        setFollowLoading(true);
        setFollowError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('認証トークンが見つかりません。');
            }
            const response = await fetch(`${apiUrl}/follows/${userProfile.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ following_id: userProfile.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'フォロー解除に失敗しました。');
            }
            fetchUserProfile();
        } catch (err: any) {
            setFollowError(err.message);
            console.error('アンフォローエラー:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleStartConversation = async () => {
        if (!userProfile?.id) return;
        setIsCreatingConversation(true);
        setConversationError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const token = localStorage.getItem('authToken');
            const loggedInUserId = localStorage.getItem('userId');

            if (!apiUrl || !token || !loggedInUserId) {
                console.error('API URL、トークン、またはユーザーIDがありません');
                setConversationError('認証エラーが発生しました。');
                return;
            }

            // 会話を作成
            const conversationResponse = await fetch(`${apiUrl}/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ recipient_id: userProfile.id }),
            });

            if (!conversationResponse.ok) {
                const errorData = await conversationResponse.json();
                console.error('会話作成エラー:', errorData);
                setConversationError(errorData?.error || 'メッセージの送信に失敗しました。');
                return;
            }

            const conversationData = await conversationResponse.json();
            const conversationId = conversationData.id;

            // 最初のメッセージを送信 (任意)
            const initialMessage = `はじめまして、${userProfile.username}さん。`;
            const messageResponse = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: initialMessage }),
            });

            if (!messageResponse.ok) {
                const errorData = await messageResponse.json();
                console.error('メッセージ送信エラー:', errorData);
                setConversationError(errorData?.error || 'メッセージの送信に失敗しました。');
            }

            router.push(`/messages/${conversationId}`);

        } catch (error) {
            console.error('メッセージ送信処理中にエラーが発生しました:', error);
            setConversationError('メッセージの送信中にエラーが発生しました。');
        } finally {
            setIsCreatingConversation(false);
        }
    };


    if (loading) {
        return (
            <div className="bg-gray-100 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="mt-4">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-1/3 mt-2" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </TabsList>
                            </Tabs>
                            <div className="mt-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full mt-2" />
                                <Skeleton className="h-8 w-full mt-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>エラー</CardTitle>
                            <CardDescription>エラーが発生しました: {error}</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="bg-gray-100 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>ユーザーが見つかりません</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto">
                <Card className="overflow-hidden">
                    {/* 背景画像 */}
                    <div className="relative h-48 overflow-hidden">
                        {userProfile.bg_image_url ? (
                            <img
                                src={userProfile.bg_image_url}
                                alt="プロフィール背景"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={process.env.NEXT_PUBLIC_DEFAULT_BG_IMAGE_URL}
                                alt="デフォルトのプロフィール背景"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ layout: 'fill', objectFit: 'cover' }}
                            />
                        )}
                        <div className="absolute inset-0 bg-black opacity-20"></div>
                    </div>

                    <CardHeader className="relative">
                        {/* アバター */}
                        <div className="-mt-16 absolute left-4">
                            {userProfile.user_icon_url ? (
                                <img
                                    src={userProfile.user_icon_url}
                                    alt="プロフィールアイコン"
                                    className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 shadow-md object-cover"
                                />
                            ) : (
                                <img
                                    src={process.env.NEXT_PUBLIC_DEFAULT_USER_ICON_URL}
                                    alt="デフォルトのプロフィールアイコン"
                                    className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 shadow-md object-cover"
                                    width={96}
                                    height={96}
                                />
                            )}
                        </div>

                        {/* ユーザー情報 */}
                        <div className="mt-6 ml-32 text-left">
                            <CardTitle className="text-xl">{userProfile.username}</CardTitle>
                            <CardDescription className="text-gray-600 text-sm">{userProfile.email}</CardDescription>
                            {userProfile.bio && (
                                <p className="text-gray-700 mt-2 text-sm whitespace-pre-wrap">
                                    {userProfile.bio}
                                </p>
                            )}
                            {userProfile.location && <p className="text-gray-700 mt-1 text-sm"><span className='font-bold'>場所:</span> {userProfile.location}</p>}
                            {userProfile.website && (
                                <p className="text-gray-700 mt-1 text-sm">
                                    <span className='font-bold'>ウェブサイト:</span> <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userProfile.website}</a>
                                </p>
                            )}
                        </div>


                        {/* アクションボタン */}
                        <div className="mt-4 flex justify-around space-x-2">
                            {!isCurrentUserProfile && (
                                <>
                                    {userProfile.is_following ? (
                                        <Button
                                            onClick={handleUnfollow}
                                            disabled={followLoading}
                                            variant="secondary"
                                            className="flex-1 text-sm"
                                        >
                                            {followLoading ? 'フォロー解除中...' : 'フォロー中'}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className="flex-1 text-sm"
                                        >
                                            {followLoading ? 'フォロー...' : 'フォロー'}
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleStartConversation}
                                        disabled={isCreatingConversation}
                                        variant="outline"
                                        className="flex-1 text-sm"
                                    >
                                        {isCreatingConversation ? 'メッセージ送信中...' : 'メッセージ'}
                                    </Button>
                                </>
                            )}
                            {isCurrentUserProfile && (
                                <Button className="flex-1 text-sm">
                                    <Link href={`/users/${userProfile.id}/profile/edit`}>編集</Link>
                                </Button>
                            )}
                        </div>

                        {followError && <p className="mt-2 text-red-500 text-sm">{followError}</p>}
                        {conversationError && <p className="mt-2 text-red-500 text-sm">{conversationError}</p>}
                    </CardHeader>

                    <CardContent>
                        {/* ナビゲーションバー */}
                        <Tabs defaultValue="posts" className="w-full" onValueChange={(value) => setActiveTab(value as 'posts' | 'liked' | 'following')}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="posts">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                                    </svg>
                                    自分の投稿
                                </TabsTrigger>
                                <TabsTrigger value="liked">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                    </svg>
                                    いいね
                                </TabsTrigger>
                                <TabsTrigger value="following">
                                    {/* フォローアイコン */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                        <path d="M8 9a3 3 0 1 0 0-6 0 3 3 0 0 0 0 6ZM8 11a3 3 0 0 1 3 3v1a1 1 0 1 1-2 0v-1a1 1 0 0 0-1-1 1 1 0 0 0-1 1v.2a2.5 2.5 0 0 1-2.5 2.5H4.5a2.5 2.5 0 0 1-2.5-2.5V13a3 3 0 0 1 3-3h4Z" />
                                        <path d="M13.5 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM13 7a3 3 0 0 0 3 3v1a1 1 0 1 1-2 0v-1a1 1 0 0 0-1-1h-.2a2.5 2.5 0 0 1-2.5 2.5H15a2.5 2.5 0 0 1-2.5-2.5V10a3 3 0 0 0 3-3h.5Z" />
                                    </svg>
                                    フォロー
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts">
                                <CurrentUserPostList userId={userProfile.id} />
                            </TabsContent>
                            <TabsContent value="liked">
                                <LikedPostsList userId={userProfile.id} />
                            </TabsContent>
                            <TabsContent value="following">
                                <div>フォロー中のユーザーリストを表示するコンポーネントをここに配置します。</div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserProfilePage;
