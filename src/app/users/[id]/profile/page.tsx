'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Loader2,
    AlertTriangle,
    Users,
    Heart,
    FileText,
    Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
//import PostList from '@/app/components/posts/PostList'; // 独自のPostListコンポーネントは一旦コメントアウト
import CurrentUserPostList from '@/app/components/posts/CurrentUserPostList';
import LikedPostsList from '@/app/components/posts/LikedPostsList';
import Link from 'next/link';


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
    display_name?: string | null;
    followers_count?: number;
    following_count?: number;
    created_at: string;
    updated_at: string;
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

            // 既存の会話を検索
            const existingConversationResponse = await fetch(`${apiUrl}/conversations?user_id=${userProfile.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!existingConversationResponse.ok) {
                const errorData = await existingConversationResponse.json();
                console.error('既存の会話検索エラー:', errorData);
                setConversationError(errorData?.error || 'メッセージの送信に失敗しました。');
                return;
            }

            const existingConversations = await existingConversationResponse.json();

            if (existingConversations.length !== 0) { // 修正：配列の長さを確認
                // 既存の会話があればそちらにリダイレクト
                const conversationId = existingConversations.id; // 最初の会話にリダイレクト
                router.push(`/messages/${conversationId}`);
            } else {
                // 新しい会話を作成
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
                router.push(`/messages/${conversationId}`);
            }

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
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div>
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-4 w-1/3 mt-2" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </TabsList>
                                <div className="mt-4">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full mt-2" />
                                    <Skeleton className="h-8 w-full mt-2" />
                                </div>
                            </Tabs>
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
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <CardHeader className="relative">
                        {/* アバター */}
                        <div className="-mt-16 absolute left-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                {userProfile.user_icon_url ? (
                                    <AvatarImage
                                        src={userProfile.user_icon_url}
                                        alt={`${userProfile.display_name || userProfile.username || '不明'}のプロフィールアイコン`}
                                        className="object-cover"
                                    />
                                ) : (
                                    <AvatarFallback>
                                        <User className="h-12 w-12 text-gray-400" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </div>

                        {/* ユーザー情報 */}
                        <div className="mt-6 ml-32 text-left space-y-1.5">
                            <CardTitle className="text-2xl font-bold text-gray-900">{userProfile.display_name || userProfile.username}</CardTitle>
                            <CardDescription className="text-gray-600 text-sm">{userProfile.email}</CardDescription>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 text-sm">
                                    <span className="font-semibold">{userProfile.following_count || 0}</span> フォロー
                                </span>
                                <span className="text-gray-700 text-sm">
                                    <span className="font-semibold">{userProfile.followers_count || 0}</span> フォロワー
                                </span>
                            </div>
                            {userProfile.bio && (
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                    {userProfile.bio}
                                </p>
                            )}
                            {userProfile.location && (
                                <p className="text-gray-700 text-sm">
                                    <span className='font-semibold'>場所:</span> {userProfile.location}
                                </p>
                            )}
                            {userProfile.website && (
                                <p className="text-gray-700 text-sm flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-1" />
                                    <a
                                        href={userProfile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        {userProfile.website}
                                    </a>
                                </p>
                            )}
                        </div>


                        {/* アクションボタン */}
                        <div className="mt-6 flex justify-around space-x-2">
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
                        <Tabs
                            defaultValue="posts"
                            className="w-full"
                            onValueChange={(value) => setActiveTab(value as 'posts' | 'liked' | 'following')}
                        >
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="posts" className="data-[state=active]:text-blue-500">
                                    <FileText className="h-4 w-4 mr-1 inline-block" />
                                    自分の投稿
                                </TabsTrigger>
                                <TabsTrigger value="liked" className="data-[state=active]:text-red-500">
                                    <Heart className="h-4 w-4 mr-1 inline-block" />
                                    いいね
                                </TabsTrigger>
                                <TabsTrigger value="following" className="data-[state=active]:text-green-500">
                                    <Users className="h-4 w-4 mr-1 inline-block" />
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
