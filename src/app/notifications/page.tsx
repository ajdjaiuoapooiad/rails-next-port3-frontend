'use client';

import React, { useState, useEffect } from 'react';

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
  sender?: {
    id: number;
    username: string;
    // 他のユーザー情報
  };
  notifiable?: {
    id: number;
    content?: string;
    title?: string;
    // 他の関連エンティティの情報
  };
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const data: Notification[] = await response.json();
        setNotifications(data);
        setLoading(false);
      } catch (err: any) {
        setError(`通知の取得中にエラーが発生しました: ${err.message}`);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div>通知を読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div>まだ通知はありません。</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">通知</h1>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} className="bg-white shadow rounded-md p-4 mb-2">
            <div className="flex items-center space-x-2">
              {notification.sender_id && (
                <div className="font-semibold">ユーザー ID: {notification.sender_id}</div>
              )}
              {notification.sender_id && <div>さんが</div>}
              <div className="font-semibold">
                {notification.notification_type === 'like' && 'いいね！しました'}
                {notification.notification_type === 'comment' && 'コメントしました'}
                {notification.notification_type === 'follow' && 'あなたをフォローしました'}
                {notification.notification_type === 'message' && '新しいメッセージを送信しました'}
              </div>
              {notification.notifiable_id && (
                <div className="text-gray-500">
                  {notification.notification_type === 'comment' && `(コメント ID: ${notification.notifiable_id})`}
                  {notification.notification_type === 'like' && `(投稿 ID: ${notification.notifiable_id})`}
                  {notification.notification_type === 'follow' && ''}
                  {notification.notification_type === 'message' && `(メッセージ ID: ${notification.notifiable_id})`}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {new Date(notification.created_at).toLocaleString()}
            </div>
            {!notification.read_at && (
              <div className="text-xs text-blue-500 mt-1">未読</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;