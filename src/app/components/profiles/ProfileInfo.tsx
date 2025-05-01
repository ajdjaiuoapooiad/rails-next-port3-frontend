import React from 'react';

interface Props {
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
}

const ProfileInfo: React.FC<Props> = ({ username, email, bio, location, website }) => {
  return (
    <div className="mt-6 ml-32 text-left">
      <h2 className="text-xl font-semibold text-gray-800">{username}</h2>
      <p className="text-gray-600 text-sm">{email}</p>
      {bio && <p className="text-gray-700 mt-2 text-sm">{bio}</p>}
      {location && <p className="text-gray-700 mt-1 text-sm">場所: {location}</p>}
      {website && (
        <p className="text-gray-700 mt-1 text-sm">
          ウェブサイト: <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{website}</a>
        </p>
      )}
    </div>
  );
};

export default ProfileInfo;