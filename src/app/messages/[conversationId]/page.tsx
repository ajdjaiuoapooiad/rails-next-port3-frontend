// src/app/messages/[conversationId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Message {
  id: number;
  content: string;
  user: { id: number; username: string; profile?: { user_icon_url?: string } };
  created_at: string;
}

export default function MessageDetailPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!conversationId) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const authToken = localStorage.getItem('authToken');

        if (!apiUrl) throw new Error("API URL が設定されていません。");
        if (!authToken) throw new Error("認証されていません。");

        const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error fetching messages:", errorData);
          throw new Error(`メッセージの読み込みに失敗しました (${res.status})`);
        }

        const data: Message[] = await res.json();
        setMessages(data);
        setLoading(false);
        scrollToBottom();
      } catch (e: any) {
        console.error("Error:", e);
        setError(e.message);
        setLoading(false);
      }
    }

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const authToken = localStorage.getItem('authToken');

      if (!apiUrl) throw new Error("API URL が設定されていません。");
      if (!authToken) throw new Error("認証されていません。");

      const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error sending message:", errorData);
        throw new Error(`メッセージの送信に失敗しました (${res.status})`);
      }

      const sentMessage: Message = await res.json();
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (e: any) {
      console.error("Error sending message:", e);
      setError("メッセージの送信に失敗しました。");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">メッセージを読み込み中...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b p-4">
        <h2 className="text-xl font-bold">会話 ID: {conversationId}</h2>
        {/* 必要に応じて参加者情報などを表示 */}
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-md shadow-sm p-3 w-fit max-w-[80%] ${
              msg.user.id === (localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : 0)
                ? 'bg-blue-100 text-blue-800 ml-auto'
                : 'bg-gray-300 text-gray-800 mr-auto'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full overflow-hidden relative">
                {msg.user.profile?.user_icon_url ? (
                  <img src={msg.user.profile.user_icon_url} alt={msg.user.username} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xs">
                    {msg.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{msg.user.username}</div>
                <p className="text-gray-700 break-words">{msg.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNowStrict(new Date(msg.created_at), { locale: ja, addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-grow border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={handleSendMessage}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}