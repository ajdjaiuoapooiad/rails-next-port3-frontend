'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/app/utils/types';

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
        return <div>ユーザー情報を読み込み中...</div>;
    }

    if (error) {
        return <div>エラーが発生しました: {error}</div>;
    }

    if (!user) {
        return <div>ユーザーが見つかりません。</div>;
    }

    const isCurrentUser = loggedInUserId === String(user.id);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setDisplayName(user.display_name || ''); // キャンセル時に元の値を戻す
        setEmail(user.email);
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
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser); // 成功したら state を更新
                setIsEditing(false); // 編集モードを閉じる
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
        <div>
            <h1>ユーザー詳細</h1>
            <div className="mb-4 p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        {(user.user_icon_url || user.avatar) && (
                            <img
                                src={user.user_icon_url || user.avatar || '/images/default-avatar.png'}
                                alt={`${user.username}のアイコン`}
                                className="w-16 h-16 rounded-full mr-4 object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                }}
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{user.display_name || user.username}</h2>
                            <p className="text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    {isCurrentUser && !isEditing && (
                        <button onClick={handleEditClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            編集
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="mb-2">
                            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">
                                表示名:
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                                メールアドレス:
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-end">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                                type="submit"
                            >
                                保存
                            </button>
                            <button onClick={handleCancelEdit} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                                キャンセル
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p><strong>メールアドレス:</strong> {user?.email}</p>
                        {/* 他のユーザー情報があればここに表示 */}
                    </>
                )}
            </div>
            <Link href="/users/index">ユーザー一覧に戻る</Link>
        </div>
    );
};

export default UserDetailPage;