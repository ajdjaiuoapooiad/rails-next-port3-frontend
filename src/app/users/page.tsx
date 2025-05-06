'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '../../utils/types';
import { UserCircleIcon } from '@heroicons/react/24/solid'; // デフォルトアイコン用
import { Skeleton } from '@/components/ui/skeleton'; // UIライブラリのSkeletonコンポーネント (任意)

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
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                    <h1 className="text-2xl font-semibold mb-6 text-center">ユーザー一覧</h1>
                    <div className="space-y-4">
                        {/* ローディング中は Skeleton を表示 */}
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="animate-pulse flex items-center p-3 rounded-md bg-gray-100 border border-gray-200">
                                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                    <h1 className="text-xl font-semibold mb-4 text-center text-red-500">エラーが発生しました</h1>
                    <p className="text-gray-700 text-center">{error}</p>
                    <div className="text-center mt-4">
                        <Link href="/users" className="text-blue-500 hover:underline">ホームに戻る</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
            <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 bg-white rounded-md shadow-md">
                <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">ユーザー一覧</h1>
                <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <li key={user.id} className="py-3 flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {user.user_icon_url || user.avatar ? (
                                    <img
                                        src={user.user_icon_url || user.avatar}
                                        alt={`${user.username}のアイコン`}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                        }}
                                    />
                                ) : (
                                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/users/${user.id}`} className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true"></span>
                                    <p className="text-sm font-medium text-gray-900">{user.display_name || user.username}</p>
                                    {user.username && <p className="text-sm text-gray-500 truncate">@{user.username}</p>}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="text-center mt-6">
                    <Link href="/users" className="inline-block text-blue-500 hover:underline">ホームに戻る</Link>
                </div>
            </div>
        </div>
    );
};

export default UsersIndexPage;