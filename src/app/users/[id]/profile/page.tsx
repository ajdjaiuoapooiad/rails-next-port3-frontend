'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import PostList from '@/app/components/posts/PostList';
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
    is_following?: boolean; // 現在のユーザーがこのプロフィールをフォローしているか
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${userId}`, {
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
            // プロフィールIDとログインユーザーIDを比較
            const loggedInUserId = localStorage.getItem('userId'); // ログインユーザーIDをlocalStorageから取得
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
            // フォロー成功したら、UserProfile を再取得して is_following を更新
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follows/${userProfile.id}`, {
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
            // アンフォロー成功したら、UserProfile を再取得して is_following を更新
            fetchUserProfile();
        } catch (err: any) {
            setFollowError(err.message);
            console.error('アンフォローエラー:', err);
        } finally {
            setFollowLoading(false);
        }
    };


    if (loading) {
        return <div>プロフィールを読み込み中...</div>;
    }

    if (error) {
        return <div>エラーが発生しました: {error}</div>;
    }

    if (!userProfile) {
        return <div>ユーザーが見つかりません。</div>;
    }

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md overflow-hidden">
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

                <div className="px-4 py-4 relative">
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
                        <h2 className="text-xl font-semibold text-gray-800">{userProfile.username}</h2>
                        <p className="text-gray-600 text-sm">{userProfile.email}</p>
                        {userProfile.bio && <p className="text-gray-700 mt-2 text-sm">{userProfile.bio}</p>}
                        {userProfile.location && <p className="text-gray-700 mt-1 text-sm">場所: {userProfile.location}</p>}
                        {userProfile.website && (
                            <p className="text-gray-700 mt-1 text-sm">
                                ウェブサイト: <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userProfile.website}</a>
                            </p>
                        )}
                        {/* 他のプロフィール情報を表示 */}
                    </div>


                    {/* アクションボタン */}
                    <div className="mt-4 flex justify-around space-x-2">
                        {!isCurrentUserProfile && (
                            <>
                                {userProfile.is_following ? (
                                    <button
                                        onClick={handleUnfollow}
                                        disabled={followLoading}
                                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm"
                                    >
                                        {followLoading ? 'フォロー解除中...' : 'フォロー中'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm"
                                    >
                                        {followLoading ? 'フォロー...' : 'フォロー'}
                                    </button>
                                )}
                                <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
                                    メッセージ
                                </button>
                            </>
                        )}
                        {/* 自分のプロフィールの場合のみ編集ボタンを表示 */}
                        {isCurrentUserProfile && (
                            <button className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
                                <Link href={`/users/${userProfile.id}/profile/edit`}>編集</Link>
                            </button>
                        )}
                    </div>

                    {followError && <p className="mt-2 text-red-500 text-sm">{followError}</p>}


                    {/* ナビゲーションバー */}
                    <div className="mt-6 border-b border-gray-200 w-full flex justify-center">
                        <nav className="-mb-px flex space-x-4 max-w-3xl mx-auto" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'posts'
                                        ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                                </svg>
                                自分の投稿
                            </button>
                            <button
                                onClick={() => setActiveTab('liked')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'liked'
                                        ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                </svg>
                                いいね
                            </button>
                            <button
                                onClick={() => setActiveTab('following')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'following'
                                        ? 'border-blue-500 text-blue-600 focus:border-blue-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-400'
                                }`}
                            >
                                {/* フォローアイコン */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-1 inline-block">
                                    <path d="M8 9a3 3 0 1 0 0-6 0 3 3 0 0 0 0 6ZM8 11a3 3 0 0 1 3 3v1a1 1 0 1 1-2 0v-1a1 1 0 0 0-1-1 1 1 0 0 0-1 1v.2a2.5 2.5 0 0 1-2.5 2.5H4.5a2.5 2.5 0 0 1-2.5-2.5V13a3 3 0 0 1 3-3h4Z" />
                                    <path d="M13.5 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM13 7a3 3 0 0 0 3 3v1a1 1 0 1 1-2 0v-1a1 1 0 0 0-1-1h-.2a2.5 2.5 0 0 1-2.5 2.5H15a2.5 2.5 0 0 1-2.5-2.5V10a3 3 0 0 0 3-3h.5Z" />
                                </svg>
                                フォロー
                            </button>
                        </nav>
                    </div>

                    {/* コンテンツの表示 */}
                    <div className="mt-4">
                        {activeTab === 'posts' && <div><PostList userId={userProfile.id} /></div>}
                        {activeTab === 'liked' && <div>いいねした投稿リストを表示するコンポーネントをここに配置します。</div>}
                        {activeTab === 'following' && <div>フォロー中のユーザーリストを表示するコンポーネントをここに配置します。</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;