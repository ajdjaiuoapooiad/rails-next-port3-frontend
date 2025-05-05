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
    display_name?: string | null; // 表示名を追加 (null許容)
}
export interface Post {
    id: number;
    user_id: number;
    content: string;
    post_type: string | null;
    media_url: string | null;
    created_at: string;
    updated_at: string;
    user?: {
      id: number;
      email: string;
      password_digest: string;
      username: string;
      display_name: string | null;
      avatar: string | null;
      created_at: string;
      updated_at: string;
      profile?: {
        id: number;
        user_id: number;
        bio: string | null;
        location: string | null;
        website: string | null;
        display_name: string | null;
        created_at: string;
        updated_at: string;
      };
    };
    likes_count?: number;
    is_liked_by_current_user?: boolean;
    user_icon_url?: string;
  }
  