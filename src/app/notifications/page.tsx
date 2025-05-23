// pages/notifications.tsx
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
  const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null; // userId を取得

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
        // 自分の通知のみをフィルタリング
        const myNotifications = data.filter((notification) => notification.recipient_id === userId);
        const sortedNotifications = myNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

    if (userId !== null) { // userId が存在する場合のみ API を呼び出す
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [userId]); // userId が変更されたときも再実行

  if (loading) {
    return <div className="flex justify-center items-center h-screen">通知と送信者の情報を読み込み中...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">エラーが発生しました: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="flex justify-center items-center h-screen">まだ通知はありません。</div>;
  }

  return (
    <div className="bg-gray-100 py-6 sm:py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl text-center mb-6">
          通知
        </h1>
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
    </div>
  );
};

export default NotificationsPage;