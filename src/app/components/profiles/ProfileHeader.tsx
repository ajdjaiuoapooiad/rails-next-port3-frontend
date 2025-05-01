import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  userIconUrl?: string;
  bgImageUrl?: string;
}

const ProfileHeader: React.FC<Props> = ({ userIconUrl, bgImageUrl }) => {
  return (
    <div className="relative h-48 overflow-hidden">
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          alt="プロフィール背景"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="-mt-16 absolute left-4">
        {userIconUrl ? (
          <img
            src={userIconUrl}
            alt="プロフィールアイコン"
            className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 shadow-md object-cover"
          />
        ) : (
          <UserCircleIcon className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 text-gray-500 shadow-md" />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;