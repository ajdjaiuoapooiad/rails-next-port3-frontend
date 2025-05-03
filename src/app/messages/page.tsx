// src/app/messages/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Conversation {
  id: number;
  participants: { id: number; username: string; profile?: { user_icon_url?: string } }[];
  last_message: string | null;
  last_message_at: string | null;
}

const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : 0;
  const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
  const participantNames = otherParticipants.map(p => p.username).join(', ');
  const participantIcons = otherParticipants.slice(0, 2).map(p => (
    <div
      key={p.id}
      className="w-8 h-8 rounded-full overflow-hidden relative"
    >
      {p.profile?.user_icon_url ? (
        <img src={p.profile.user_icon_url} alt={p.username} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          {p.username.charAt(0).toUpperCase()}
        </div>
      )}
      {otherParticipants.length > 2 && otherParticipants.indexOf(p) === 1 && (
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 flex items-center justify-center text-white text-xs rounded-full">
          +{otherParticipants.length - 2}
        </div>
      )}
    </div>
  ));

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="bg-white rounded-md shadow-sm p-4 mb-2 block hover:bg-gray-100 transition-colors duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="flex -space-x-2">{participantIcons}</div>
        <div className="flex-grow">
          <p className="font-semibold">{participantNames || '不明なユーザー'}</p>
          {conversation.last_message && (
            <p className="text-gray-600 text-sm truncate">
              {conversation.last_message} ({conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleDateString() : '---'})
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function MessagesIndexPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL が設定されていません。");
        const authToken = localStorage.getItem('authToken');
        if (!authToken) throw new Error("認証されていません。");

        const res = await fetch(`${apiUrl}/conversations`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error fetching conversations:", errorData);
          throw new Error(`メッセージの読み込みに失敗しました (${res.status}: ${errorData?.message || res.statusText})`);
        }

        const data: Conversation[] = await res.json();
        setConversations(data);
      } catch (e: any) {
        console.error("An error occurred while fetching conversations:", e);
        setError(`メッセージの読み込み中にエラーが発生しました: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 text-center">メッセージ</h1>
        {loading ? (
          <div className="p-4 text-gray-600 text-center">メッセージを読み込み中...</div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : conversations && conversations.length > 0 ? (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem conversation={conversation} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">まだメッセージはありません。</p>
        )}
      </div>
    </div>
  );
}