export interface User {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
    user_icon_url?: string | null;
    email: string; // 追加
}

export interface Notification {
    id: number;
    recipient_id: number;
    sender_id: number | null;
    notifiable_type: string;
    notifiable_id: number;
    notification_type: string;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    location?: string;
    website?: string;
    user_icon_url?: string;
    bg_image_url?: string;
    is_following?: boolean;
}
export interface Post {
    id: number;
    user_id: number; // 追加
    content: string;
    created_at: string;
    updated_at?: string;
    user?: {
      id: number;
      username?: string;
      user_icon_url?: string;
    };
    likes_count?: number;
    is_liked_by_current_user?: boolean;
    image_url?: string | null;
    video_url?: string | null;
  }