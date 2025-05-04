'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/app/utils/types';


interface UserDetailPageParams {
    id: string;
}

const UserDetailPage = () => {
    const params = useParams<UserDetailPageParams>();
    const { id } = params;
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null); // localStorage から取得する ID は文字列の可能性

    useEffect(() => {
        // localStorage からログインしているユーザーの ID を取得
        const storedUserId = localStorage.getItem('userId');
        setLoggedInUserId(storedUserId);

        // ユーザー情報を取得
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

    // localStorage の ID と表示しているユーザーの ID を比較
    const isCurrentUser = loggedInUserId === String(user.id); // 型を合わせて比較

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
                    {isCurrentUser && (
                        <Link href={`/users/${id}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            編集
                        </Link>
                    )}
                </div>
                <p><strong>メールアドレス:</strong> {user.email}</p>
                {/* 他のユーザー情報があればここに表示 */}
            </div>
            <Link href="/users/index">ユーザー一覧に戻る</Link>
        </div>
    );
};

export default UserDetailPage;