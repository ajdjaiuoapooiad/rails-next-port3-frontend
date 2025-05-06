// components/NotificationList.tsx
import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationItemProps {
    notification: {
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
    };
    markAsRead: (notificationId: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, markAsRead }) => (
    <li
        key={notification.id}
        className={`bg-white shadow rounded-md p-4 flex items-center space-x-3 ${!notification.read_at ? 'border-l-4 border-blue-500' : 'opacity-50'}`}
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
                onClick={() => markAsRead(notification.id)}
            >
                既読にする
            </button>
        )}
    </li>
);

interface NotificationListProps {
    notifications: {
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
    }[];
    loading: boolean;
    error: string | null;
    markAsRead: (notificationId: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, loading, error, markAsRead }) => {
    const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;

    // userId が存在する場合のみフィルタリング
    const myNotifications = userId ? notifications.filter(
        (notification) => notification.recipient_id === userId
    ) : [];

    if (loading) {
        return (
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
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-md p-6 text-center">
                <h1 className="text-xl font-bold text-red-500 mb-4">エラー</h1>
                <p className="text-gray-700">{error}</p>
            </div>
        );
    }

    return (
        <ul>
            {myNotifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                />
            ))}
            {myNotifications.length === 0 && userId !== null && (
                <li className="bg-white shadow rounded-md p-4 mb-2 text-gray-600 text-center">
                    まだ通知はありません。
                </li>
            )}
            {userId === null && (
                <li className="bg-white shadow rounded-md p-4 mb-2 text-gray-600 text-center">
                    ログインして通知を確認してください。
                </li>
            )}
        </ul>
    );
};

export default NotificationList;