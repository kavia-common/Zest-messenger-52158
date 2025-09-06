
import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', online = false }) => {
  return (
    <div className={`relative flex-shrink-0 ${SIZES[size]}`}>
      <img
        className="w-full h-full rounded-full object-cover"
        src={src}
        alt={alt}
      />
      {online && (
        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-white" />
      )}
    </div>
  );
};

export default Avatar;
