'use client';

import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationWithSender {
    id: number;
    recipient_id: number;
    sender_id: number | null;
    notifiable_type: string;
    notifiable_id: number;
    notification_type: string;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    sender_display_name: string | null;
    sender_user_icon_url: string | null;
}

interface ApiResponse {
    notifications: NotificationWithSender[];
    unread_count: number;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('認証されていません。');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(`通知の取得に失敗しました: ${errorData.message || response.statusText}`);
                    setLoading(false);
                    return;
                }

                const data: ApiResponse = await response.json();
                const myNotifications = data.notifications.filter((notification) => notification.recipient_id === userId);
                const sortedNotifications = myNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setNotifications(sortedNotifications);
                setUnreadCount(data.unread_count);
                setLoading(false);
            } catch (err: any) {
                setError(`通知の取得中にエラーが発生しました: ${err.message}`);
                setLoading(false);
            }
        };

        if (userId !== null) {
            fetchNotifications();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const markAsReadLocal = (notificationId: number) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification
            )
        );
        setUnreadCount(prevCount => prevCount > 0 ? prevCount - 1 : 0);
        // ここでバックエンドの API を呼び出して read_at を更新することも可能です
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/mark_as_read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                if (!response.ok) {
                    console.error('既読状態の更新に失敗しました');
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
                        通知
                    </h1>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="bg-white shadow rounded-md p-4 flex items-center space-x-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="w-12 h-4 bg-gray-300 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-md p-6 text-center">
                        <h1 className="text-xl font-bold text-red-500 mb-4">エラー</h1>
                        <p className="text-gray-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-md p-6 text-center">
                        <h1 className="text-xl font-semibold text-gray-800 mb-4">通知</h1>
                        <p className="text-gray-600">まだ通知はありません。</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
                    通知 ({unreadCount} 件の未読)
                </h1>
                <ul className="space-y-3">
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`bg-white shadow rounded-md p-4 flex items-center space-x-3 ${notification.read_at ? 'opacity-50' : ''}`}
                        >
                            <div className="flex-shrink-0">
                                {notification.sender_user_icon_url ? (
                                    <img
                                        src={notification.sender_user_icon_url}
                                        alt={`${notification.sender_display_name || '不明'}のアイコン`}
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
                                <div className="text-sm font-medium text-gray-900">
                                    {notification.sender_display_name || '不明なユーザー'}
                                    <span className="ml-1 text-gray-500">さんが</span>
                                    {notification.notification_type === 'like' && 'いいね！しました'}
                                    {notification.notification_type === 'comment' && 'コメントしました'}
                                    {notification.notification_type === 'follow' && 'あなたをフォローしました'}
                                    {notification.notification_type === 'message' && '新しいメッセージを送信しました'}
                                </div>
                                {notification.notifiable_id && (
                                    <p className="text-sm text-gray-500 truncate">
                                        {notification.notification_type === 'comment' && `(コメント ID: ${notification.notifiable_id})`}
                                        {notification.notification_type === 'like' && `(投稿 ID: ${notification.notifiable_id})`}
                                        {notification.notification_type === 'follow' && ''}
                                        {notification.notification_type === 'message' && `(メッセージ ID: ${notification.notifiable_id})`}
                                    </p>
                                )}
                                <p className="text-xs text-gray-600 mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                    {!notification.read_at && (
                                        <span className="ml-2 text-blue-500">[未読]</span>
                                    )}
                                    {notification.read_at && (
                                        <span className="ml-2 text-gray-500">[既読]</span>
                                    )}
                                </p>
                            </div>
                            {!notification.read_at && (
                                <button
                                    className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => markAsReadLocal(notification.id)}
                                >
                                    既読にする
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NotificationsPage;