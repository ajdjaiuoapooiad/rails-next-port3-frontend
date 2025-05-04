export interface User {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
    user_icon_url?: string | null;
    email: string; // 追加
}