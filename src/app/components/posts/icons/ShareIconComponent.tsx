// src/app/components/icons/ShareIconComponent.tsx
import React from 'react';

interface ShareIconProps extends React.SVGProps<SVGSVGElement> {}

const ShareIconComponent: React.FC<ShareIconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`size-6 ${props.className || ''}`} // className を props から受け取れるように
      style={props.style} // style prop も受け取れるように
      onClick={props.onClick} // onClick イベントも受け取れるように
      // 他の SVGProps も必要に応じて展開できます
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046-.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
      />
    </svg>
  );
};

export default ShareIconComponent;