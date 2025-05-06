import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, XCircle, AlertTriangle, Mail, MessageSquare, Heart, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
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

const NotificationItem: React.FC<{ notification: Notification; markAsRead: (id: number) => void }> = ({ notification, markAsRead }) => {
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

const NotificationList: React.FC<{}> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;
  const [unreadCount, setUnreadCount] = useState(0);


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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`通知の取得に失敗しました: ${errorData.message || response.statusText}`);
        setLoading(false);
        return;
      }

      const data: { notifications: Notification[], unread_count: number } = await response.json();
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

  useEffect(() => {
    if (userId !== null) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = (notificationId: number) => {
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

  if (notifications.length === 0 && userId !== null) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 text-center">
        <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
        <p className="text-gray-600">まだ通知はありません。</p>
      </div>
    );
  }

  if (userId === null) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 text-center flex flex-col items-center justify-center">
        <XCircle className="w-8 h-8 mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">ログインして通知を確認してください。</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
        通知 ({unreadCount} 件の未読)
      </h1>
      <ul className="space-y-4">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markAsRead}
            />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
};

export default NotificationList;

