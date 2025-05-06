'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/app/utils/types';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Skeleton } from '@/components/ui/skeleton';

interface UserDetailPageParams {
    id: string;
}

const UserDetailPage = () => {
    const params = useParams<UserDetailPageParams>();
    const { id } = params;
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        setLoggedInUserId(storedUserId);

        const fetchUser = async () => {
            if (!id) return;
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const token = localStorage.getItem('authToken');
                if (!apiUrl) {
                    throw new Error('API URLが設定されていません。');
                }
                const response = await fetch(`${apiUrl}/users/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error || `ユーザー情報の取得に失敗しました (ID: ${id}, ${response.status})`);
                }
                const data: User = await response.json();
                setUser(data);
                setDisplayName(data.display_name || '');
                setEmail(data.email);
                setUsername(data.username || '');
            } catch (err: any) {
                setError(err.message);
                console.error(`ユーザー詳細取得エラー (ID: ${id}):`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">ユーザー詳細</h1>
                    <div className="animate-pulse flex flex-col items-center p-6 rounded-md bg-gray-100 border border-gray-200">
                        <div className="w-24 h-24 rounded-full bg-gray-300 mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                    <h1 className="text-xl font-bold text-red-500 sm:text-2xl lg:text-3xl text-center mb-6">エラー</h1>
                    <p className="text-gray-700 text-center">{error}</p>
                    <div className="text-center mt-4">
                        <Link href="/users/index" className="text-blue-500 hover:underline">ユーザー一覧に戻る</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">ユーザー詳細</h1>
                    <p className="text-gray-700 text-center">ユーザーが見つかりません。</p>
                    <div className="text-center mt-4">
                        <Link href="/users/index" className="text-blue-500 hover:underline">ユーザー一覧に戻る</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isCurrentUser = loggedInUserId === String(user.id);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setDisplayName(user.display_name || '');
        setEmail(user.email);
        setUsername(user.username || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const token = localStorage.getItem('authToken');
            if (!apiUrl) {
                throw new Error('API URLが設定されていません。');
            }
            const response = await fetch(`${apiUrl}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    display_name: displayName,
                    email: email,
                    username: username,
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setIsEditing(false);
                console.log('ユーザー情報が更新されました');
            } else {
                const errorData = await response.json();
                setError(errorData?.errors?.join(', ') || 'ユーザー情報の更新に失敗しました');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('ユーザー情報更新エラー:', err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
            <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">ユーザー詳細</h1>
                <div className="p-6 rounded-md border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {user.user_icon_url || user.avatar ? (
                                    <img
                                        src={user.user_icon_url || user.avatar}
                                        alt={`${user.username}のアイコン`}
                                        className="w-16 h-16 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                        }}
                                    />
                                ) : (
                                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-gray-900">{user.display_name || user.username}</h2>
                                <p className="text-gray-500">@{user.username}</p>
                            </div>
                        </div>
                        {isCurrentUser && !isEditing && (
                            <button onClick={handleEditClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                編集
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">表示名:</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">ユーザー名:</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス:</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-4 space-y-2">
                            <p><strong className="text-gray-700">表示名:</strong> <span className="text-gray-600">{user?.display_name || user?.username}</span></p>
                            <p><strong className="text-gray-700">ユーザー名:</strong> <span className="text-gray-600">@{user?.username}</span></p>
                            <p><strong className="text-gray-700">メールアドレス:</strong> <span className="text-gray-600">{user?.email}</span></p>
                            {/* 他のユーザー情報があればここに表示 */}
                        </div>
                    )}
                </div>
                <div className="text-center mt-6">
                    <Link href="/users/index" className="inline-block text-blue-500 hover:underline">ユーザー一覧に戻る</Link>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;