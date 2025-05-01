import React from 'react';
import Link from 'next/link';

interface Props {
  isOwnProfile: boolean;
  isFollowing: boolean;
  userId: number | undefined;
  onFollow: () => void;
  onUnfollow: () => void;
}

const ProfileActions: React.FC<Props> = ({ isOwnProfile, isFollowing, userId, onFollow, onUnfollow }) => {
  return (
    <div className="mt-4 flex justify-around space-x-2">
      {!isOwnProfile && (
        <>
          <button
            onClick={isFollowing ? onUnfollow : onFollow}
            className={`flex-1 font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm ${
              isFollowing ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            {isFollowing ? 'フォロー解除' : 'フォロー'}
          </button>
          <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
            メッセージ
          </button>
        </>
      )}
      {isOwnProfile && userId !== undefined && (
        <button className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline text-sm">
          <Link href={`/users/${userId}/profile/edit`}>編集</Link>
        </button>
      )}
    </div>
  );
};

export default ProfileActions;