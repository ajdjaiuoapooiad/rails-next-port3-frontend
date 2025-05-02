// src/app/messages/page.tsx
import Link from 'next/link';

async function getConversations() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
      return [];
    }
    const res = await fetch(`${apiUrl}/conversations`, {
        cache: 'no-store', // キャッシュを無効にする
        method: 'GET',
        headers: {
            // 認証トークン（ローカルストレージに存在するか確認）
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
    });

    if (!res.ok) {
      console.error(`Failed to fetch conversations with status: ${res.status}`);
      // エラーレスポンスの内容を詳しくログに出力（デバッグ用）
      const errorData = await res.json();
      console.error("Error data:", errorData);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("An error occurred while fetching conversations:", error);
    return [];
  }
}

export default async function MessagesIndexPage() {
  const conversations = await getConversations();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">メッセージ</h1>
      {conversations && conversations.length > 0 ? (
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id} className="bg-white rounded-md shadow-sm p-4 mb-2">
              <Link href={`/messages/${conversation.id}`}>
                <p className="font-semibold">会話 ID: {conversation.id}</p>
                {/* 必要に応じて会話に関連する他の情報を表示 */}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">{conversations ? 'まだメッセージはありません。' : 'メッセージの読み込みに失敗しました。'}</p>
      )}
    </div>
  );
}