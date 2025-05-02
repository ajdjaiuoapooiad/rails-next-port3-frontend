// pages/index.tsx (または app/page.tsx)
'use client';

// src/app/messages/page.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 会話の型定義
interface Conversation {
  id: number;
  participants: { id: number; username: string }[];
  last_message: string | null;
  last_message_at: string | null;
}

export default function MessagesIndexPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
          setError("API URL が設定されていません。");
          setLoading(false);
          return;
        }
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setError("認証されていません。");
          setLoading(false);
          return;
        }

        const res = await fetch(`${apiUrl}/conversations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          console.error(`Failed to fetch conversations with status: ${res.status}`);
          const errorData = await res.json();
          console.error("Error data:", errorData);
          setError(`メッセージの読み込みに失敗しました (${res.status})。`);
          setLoading(false);
          return;
        }

        const data: Conversation[] = await res.json();
        setConversations(data);
        setLoading(false);
      } catch (e: any) {
        console.error("An error occurred while fetching conversations:", e);
        setError("メッセージの読み込み中にエラーが発生しました。");
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  if (loading) {
    return <p className="p-4 text-gray-600">メッセージを読み込み中...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">メッセージ</h1>
      {conversations && conversations.length > 0 ? (
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id} className="bg-white rounded-md shadow-sm p-4 mb-2">
              <Link href={`/messages/${conversation.id}`}>
                <div className="flex items-center space-x-2">
                  <div className="font-semibold">
                    {conversation.participants
                      .filter((participant) => participant.id !== ( localStorage.getItem('userId') || 0))
                      .map((participant) => participant.username)
                      .join(', ')}
                  </div>
                  {conversation.last_message && (
                    <p className="text-gray-600 text-sm truncate">
                      {conversation.last_message} ({conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleDateString() : '---'})
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">まだメッセージはありません。</p>
      )}
    </div>
  );
}