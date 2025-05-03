'use client';

import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: string;
  sender: {
    id: number;
    username: string;
    // 他のユーザー情報
  };
  notifiable: {
    id: number;
    // 関連するエンティティの情報 (投稿のタイトル、コメントの内容など)
    content?: string;
    title?: string;
  };
  created_at: string;
  read_at: string | null;
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { // バックエンドの通知 API エンドポイント
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
              {notification.sender && (
                <div className="font-semibold">{notification.sender.username}</div>
              )}
              <div>さんが</div>
              <div className="font-semibold">
                {notification.type === 'like' && 'いいね！しました'}
                {notification.type === 'comment' && 'コメントしました'}
                {notification.type === 'follow' && 'あなたをフォローしました'}
                {notification.type === 'message' && '新しいメッセージを送信しました'}
              </div>
              {notification.notifiable && (
                <div className="text-gray-500">
                  {notification.type === 'comment' && `「${notification.notifiable.content?.substring(0, 20)}...」`}
                  {notification.type === 'like' && (notification.notifiable.title ? `あなたの投稿「${notification.notifiable.title?.substring(0, 20)}...」に` : 'あなたの投稿に')}
                  {notification.type === 'message' && `「${notification.notifiable.content?.substring(0, 20)}...」`}
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