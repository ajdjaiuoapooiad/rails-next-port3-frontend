'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '../../utils/types'; // 相対パスを修正

const UsersIndexPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const token = localStorage.getItem('authToken');
                if (!apiUrl) {
                    throw new Error('API URLが設定されていません。');
                }
                const response = await fetch(`${apiUrl}/users`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error || `ユーザー一覧の取得に失敗しました (${response.status})`);
                }
                const data: User[] = await response.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
                console.error('ユーザー一覧取得エラー:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div>ユーザー一覧を読み込み中...</div>;
    }

    if (error) {
        return <div>エラーが発生しました: {error}</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12"> {/* 修正 */}
            <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md"> {/* 修正 */}
                <h1 className="text-2xl font-semibold mb-4 text-center">ユーザー一覧</h1>
                <ul>
                    {users.map((user) => (
                        <li key={user.id} className="mb-2 p-2 border rounded flex items-center">
                            {(user.user_icon_url || user.avatar) && (
                                <img
                                    src={user.user_icon_url || user.avatar || '/images/default-avatar.png'}
                                    alt={`${user.username}のアイコン`}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                    }}
                                />
                            )}
                            <div>
                                <Link href={`/users/${user.id}`}>
                                    <span className="font-semibold">{user.display_name || user.username}</span>
                                    {user.username && <span className="text-gray-500 ml-1">(@{user.username})</span>}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="text-center mt-4">
                    <Link href="/" className="text-blue-500 hover:underline">ホームに戻る</Link>
                </div>
            </div>
        </div>
    );
};

export default UsersIndexPage;