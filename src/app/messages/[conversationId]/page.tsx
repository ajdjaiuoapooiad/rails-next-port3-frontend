'use client';

import React, { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Send, Loader2, AlertTriangle, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


interface User {
    id: number;
    username: string;
    display_name: string | null;
    user_icon_url: string | null;
}

interface Message {
    id: number;
    content: string;
    user: User; // ユーザー情報を User 型で持つように変更
    created_at: string;
}

interface ConversationResponse {
    messages: Message[];
    participants: User[]; // participants を User[] 型で定義
}

const MessageDetailPage = () => {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [participants, setParticipants] = useState<User[]>([]); // 参加者情報を state に追加

    const fetchMessages = useCallback(async () => {
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

            const data: ConversationResponse = await res.json(); // レスポンスの型を ConversationResponse に指定
            setMessages(data.messages);
            setParticipants(data.participants); // 参加者情報を設定
            setLoading(false);
            scrollToBottom();
        } catch (e: any) {
            console.error("Error:", e);
            setError(e.message);
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'; // Reset textarea height
            }
        } catch (e: any) {
            console.error("Error sending message:", e);
            setError("メッセージの送信に失敗しました。");
        }
    };

    // テキストエリアのサイズを自動調整する関数
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setNewMessage(textarea.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ユーザー情報を取得する関数
    const getUserInfo = (userId: number) => {
        const user = participants.find(p => p.id === userId);
        return user || {
            id: userId,
            username: '不明',
            display_name: null,
            user_icon_url: null
        };
    };

    if (loading) {
        return (
            <div className="p-6 text-gray-600 text-center flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-6 w-6 mr-2 text-gray-500" />
                メッセージを読み込み中...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500 text-center flex items-center justify-center h-screen">
                <AlertTriangle className="h-6 w-6 mr-2" />
                エラー: {error}
            </div>
        );
    }

    return (
        <div className="flex justify-center bg-gray-100 min-h-screen">
            <div className="max-w-2xl w-full flex flex-col h-screen">
                <div className="bg-white border-b p-4 flex items-center gap-4">
                    <h2 className="text-xl font-bold text-center flex-1">会話</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                        const sender = getUserInfo(msg.user.id); // メッセージ送信者の情報を取得
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "rounded-lg shadow-md p-3 w-fit max-w-[80%]",
                                    msg.user.id === (localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : 0)
                                        ? 'bg-blue-100 text-blue-800 ml-auto self-end'
                                        : 'bg-gray-200 text-gray-800 mr-auto self-start'
                                )}
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0">
                                        {sender.user_icon_url ? (
                                            <img
                                                src={sender.user_icon_url}
                                                alt={sender.username}
                                                width={36}
                                                height={36}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <UserCircle className="h-9 w-9 rounded-full text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold text-sm">{sender.display_name || sender.username}</span>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap break-words">{msg.content}</p>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNowStrict(new Date(msg.created_at), {
                                                locale: ja,
                                                addSuffix: true,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="bg-white border-t p-4">
                    <div className="flex space-x-2">
                        <textarea
                            ref={textareaRef}
                            className="flex-grow border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none resize-none"
                            placeholder="メッセージを入力..."
                            value={newMessage}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 flex items-center"
                            onClick={handleSendMessage}
                        >
                            <Send className="h-5 w-5" />
                            <span className="sr-only">送信</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetailPage;

