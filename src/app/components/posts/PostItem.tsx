// src/app/components/posts/PostItem.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/outline';
import LikeButton from './LikeButton'; // いいねボタンコンポーネント

interface Post {
  id: number;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    user_icon_url?: string;
  };
  likes_count?: number;
  is_liked_by_current_user?: boolean;
}

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <li key={post.id} className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition duration-300">
      <div className="flex items-start space-x-3">
        <div className="flex items-center flex-shrink-0">
          <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 mr-2" />
          <span className="text-sm font-semibold text-gray-800">
            {post.user?.username || '不明'}
          </span>
        </div>
        <br />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              <Link href={`/posts/${post.id}`} className="hover:text-blue-500 transition duration-200">
                {post.content?.substring(0, 70) + '...'}
              </Link>
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-700 text-sm mt-2">{post.content}</p>
          <div className="flex justify-between text-gray-500 text-sm mt-2">
            <button className="flex items-center space-x-1 hover:text-blue-500 focus:outline-none">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span className="text-gray-600 text-sm">{post.likes_count || 0}</span> {/* コメント数はAPIに存在しないためいいね数を仮表示 */}
            </button>
            <button className="flex items-center space-x-1 hover:text-green-500 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
              4 {/* シェア数はAPIに存在しないため仮表示 */}
            </button>
            <div className="flex items-center space-x-1">
              <LikeButton postId={post.id} isLiked={post.is_liked_by_current_user || false} />
              <span className="text-gray-600 text-sm">{post.likes_count || 0}</span>
            </div>
            <button className="hover:text-gray-700 focus:outline-none">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PostItem;