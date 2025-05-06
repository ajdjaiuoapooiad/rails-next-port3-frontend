'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from 'next/link';
import { Conversation } from '../utils/types';


const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
  const currentUserId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : 0;
  const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
  const participantNames = otherParticipants.map(p => p.username).join(', ');

  // アバターの表示を調整
  const participantAvatars = otherParticipants.slice(0, 2).map((p) => {
    return (
      <div key={p.id} className="w-9 h-9 rounded-full overflow-hidden relative">
        {p.user_icon_url ? (
          <Avatar>
            <AvatarImage src={p.user_icon_url} alt={p.username} className="object-cover w-full h-full" />
            <AvatarFallback>{p.display_name?.charAt(0) || p.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>{p.display_name?.charAt(0) || p.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        {otherParticipants.length > 2 && otherParticipants.indexOf(p) === 1 && (
          <Badge
            variant="secondary"
            className="absolute -bottom-0.5 -right-0.5 text-xs"
          >
            +{otherParticipants.length - 2}
          </Badge>
        )}
      </div>
    );
  });

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="bg-white rounded-lg shadow-md p-4 mb-3 block hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
    >
      <div className="flex items-center space-x-4">
        <div className="flex -space-x-3">{participantAvatars}</div>
        <div className="flex-grow">
          <p className="font-semibold text-gray-900">
            {otherParticipants.length > 0
              ? otherParticipants.map(p => p.display_name || p.username).join(', ')
              : '不明なユーザー'}
          </p>
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
        // 最終メッセージの日時で降順にソート
        const sortedData = data.sort((a, b) => {
          if (a.last_message_at && b.last_message_at) {
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
          } else if (a.last_message_at) {
            return -1; // aが新しい
          } else if (b.last_message_at) {
            return 1; // bが新しい
          }
          return 0;
        });
        setConversations(sortedData);
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
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">メッセージ</h1>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center bg-red-100 border border-red-400 rounded-md">
            {error}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <ul className="space-y-4">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem conversation={conversation} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-gray-600 text-center bg-white rounded-md shadow-sm border border-gray-200">
            まだメッセージはありません。
          </div>
        )}
      </div>
    </div>
  );
}
