import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, XCircle, AlertTriangle, Mail, MessageSquare, Heart, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion';

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

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'like':
            return <Heart className="w-5 h-5 text-red-500" />;
        case 'comment':
            return <MessageSquare className="w-5 h-5 text-blue-500" />;
        case 'follow':
            return <UserPlus className="w-5 h-5 text-green-500" />;
        case 'message':
            return <Mail className="w-5 h-5 text-purple-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, markAsRead }) => {
    const isRead = !!notification.read_at;
    const notificationIcon = getNotificationIcon(notification.notification_type);

    return (
        <motion.li
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "bg-white shadow-md rounded-lg p-4 flex items-start gap-4 transition-all duration-300",
                isRead
                    ? "opacity-50 hover:bg-gray-50"
                    : "border-l-4 border-blue-500 hover:bg-blue-50/50"
            )}
        >
            <div className="flex-shrink-0">
                {notification.sender_user_icon_url ? (
                    <img
                        src={notification.sender_user_icon_url}
                        alt={`${notification.sender_display_name || '不明'}のアイコン`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                        }}
                    />
                ) : (
                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                    {notificationIcon}
                    <span className="text-sm font-medium text-gray-900">
                        {notification.sender_display_name || '不明なユーザー'}
                    </span>
                    <span className="text-sm text-gray-500">さんが</span>
                    <span className="text-sm font-medium text-gray-900">
                        {notification.notification_type === 'like' && 'いいね！しました'}
                        {notification.notification_type === 'comment' && 'コメントしました'}
                        {notification.notification_type === 'follow' && 'あなたをフォローしました'}
                        {notification.notification_type === 'message' && 'メッセージを送信しました'}
                    </span>
                </div>
                {notification.notifiable_id && (
                    <p className="text-sm text-gray-500 truncate mb-1.5">
                        {notification.notification_type === 'comment' && `コメントID: ${notification.notifiable_id}`}
                        {notification.notification_type === 'like' && `投稿ID: ${notification.notifiable_id}`}
                        {notification.notification_type === 'message' && `メッセージID: ${notification.notifiable_id}`}
                    </p>
                )}
                <p className="text-xs text-gray-600">
                    {new Date(notification.created_at).toLocaleString()}
                </p>
            </div>
            {!isRead && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAsRead(notification.id)}
                    className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-md hover:bg-blue-600 transition-colors"
                >
                    既読にする
                </motion.button>
            )}
        </motion.li>
    );
};

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
    const myNotifications = userId ? notifications.filter(notification => notification.recipient_id === userId) : [];

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-8 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                <h1 className="text-xl font-bold text-red-500 mb-2">エラー</h1>
                <p className="text-gray-700">{error}</p>
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            <AnimatePresence>
                {myNotifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        markAsRead={markAsRead}
                    />
                ))}
            </AnimatePresence>
            {myNotifications.length === 0 && userId !== null && (
                <li className="bg-white shadow-md rounded-lg p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-gray-600">まだ通知はありません。</p>
                </li>
            )}
            {userId === null && (
                <li className="bg-white shadow-md rounded-lg p-4 text-center flex flex-col items-center justify-center">
                    <XCircle className="w-8 h-8 mx-auto text-red-500 mb-4" />
                    <p className="text-gray-600">ログインして通知を確認してください。</p>
                </li>
            )}
        </ul>
    );
};

export default NotificationList;
