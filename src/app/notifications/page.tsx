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
}

interface UserProfile {
  id: number;
  username: string;
  // その他のユーザー情報
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [senders, setSenders] = useState<{ [userId: number]: UserProfile }>({});
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
        // created_at で降順にソート
        const sortedNotifications = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotifications(sortedNotifications);

        // 各通知の送信者情報を取得
        sortedNotifications.forEach(async (notification) => {
          if (notification.sender_id && !senders[notification.sender_id]) {
            try {
              const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${notification.sender_id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (profileResponse.ok) {
                const profileData: UserProfile = await profileResponse.json();
                setSenders((prevSenders) => ({ ...prevSenders, [profileData.id]: profileData }));
              } else {
                console.error(`Failed to fetch profile for user ID: ${notification.sender_id}`);
              }
            } catch (err) {
              console.error(`Error fetching profile for user ID: ${notification.sender_id}`, err);
            }
          }
        });

        setLoading(false);
      } catch (err: any) {
        setError(`通知の取得中にエラーが発生しました: ${err.message}`);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div>通知と送信者の情報を読み込み中...</div>;
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
              {notification.sender_id && senders[notification.sender_id]?.username && (
                <div className="font-semibold">{senders[notification.sender_id].username}</div>
              )}
              {notification.sender_id && senders[notification.sender_id]?.username && <div>さんが</div>}
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