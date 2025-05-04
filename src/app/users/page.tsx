'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';


interface User {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
}

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
        <div>
            <h1>ユーザー一覧</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id} className="mb-2 p-2 border rounded">
                        <div className="flex items-center">
                            {user.avatar && (
                                <img
                                    src={user.avatar}
                                    alt={`${user.username}のアバター`}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                            )}
                            <div>
                                <Link href={`/users/${user.id}`}>
                                    <span className="font-semibold">{user.display_name || user.username}</span>
                                    {user.username && <span className="text-gray-500 ml-1">(@{user.username})</span>}
                                </Link>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <Link href="/">ホームに戻る</Link>
        </div>
    );
};

export default UsersIndexPage;