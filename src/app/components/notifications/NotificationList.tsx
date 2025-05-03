// components/NotificationList.tsx
import React from 'react';

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
  };
  senderUsername?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, senderUsername }) => (
  <li key={notification.id} className="bg-white shadow rounded-md p-4 mb-2">
    <div className="flex items-center space-x-2">
      {notification.sender_id && senderUsername && (
        <div className="font-semibold">{senderUsername}</div>
      )}
      {notification.sender_id && senderUsername && <div>さんが</div>}
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
  }[];
  senders: { [userId: number]: { id: number; username: string } };
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, senders }) => {
  const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;

  // userId が存在する場合のみフィルタリング
  const myNotifications = userId ? notifications.filter(
    (notification) => notification.recipient_id === userId
  ) : [];

  return (
    <ul>
      {myNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          senderUsername={notification.sender_id ? senders[notification.sender_id]?.username : undefined}
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