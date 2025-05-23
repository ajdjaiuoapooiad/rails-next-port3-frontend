'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    username: string;
    user_icon_url?: string;
    // 他のプロフィール情報 (必要に応じて追加)
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const isAuthenticated = localStorage.getItem('authToken');
    const current_userId = localStorage.getItem('userId');
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const fetchCurrentUserProfile = async () => {
            if (isAuthenticated && current_userId) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                    const res = await fetch(`${apiUrl}/profiles/${current_userId}`, {
                        headers: {
                            'Authorization': `Bearer ${isAuthenticated}`,
                        },
                    });
                    if (res.ok) {
                        const userProfileData: UserProfile = await res.json();
                        setCurrentUserProfile(userProfileData);
                    } else {
                        console.error('Failed to fetch current user profile in Sidebar');
                        setCurrentUserProfile(null);
                    }
                } catch (error) {
                    console.error('Error fetching current user profile in Sidebar:', error);
                    setCurrentUserProfile(null);
                }
            } else {
                setCurrentUserProfile(null);
            }
        };

        fetchCurrentUserProfile();
    }, [isAuthenticated, current_userId]);

    const handleLogout = () => {
        Swal.fire({
            title: 'ログアウトしますか？',
            text: 'ログアウトすると、再度ログインが必要になります。',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ログアウト',
            cancelButtonText: 'キャンセル',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // クライアントサイドの認証情報を削除
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    setCurrentUserProfile(null); // プロフィール情報をクリア

                    Swal.fire({
                        icon: 'success',
                        title: 'ログアウト成功',
                        showConfirmButton: false,
                        timer: 1500,
                    });

                    router.push('/auth/login');
                    onClose();
                } catch (error: any) {
                    Swal.fire({
                        icon: 'error',
                        title: 'ログアウト中にエラーが発生しました',
                        text: error.message || 'ログアウト処理中に予期せぬエラーが発生しました。',
                    });
                }
            }
        });
    };

    return (
        <div
            ref={sidebarRef}
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-md transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="p-4 flex justify-end">
                <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none" aria-label="メニューを閉じる">
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                        <path
                            fillRule="evenodd"
                            d="M18.27 16.27a1 1 0 01-1.414 1.414L12 13.414l-4.853 4.272a1 1 0 01-1.414-1.414L10.586 12 6.314 7.728a1 1 0 011.414-1.414L12 10.586l4.272-4.853a1 1 0 011.414 1.414L13.414 12l4.853 4.272z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
            <nav className="p-4">
                {isAuthenticated ? (
                    <>
                        {/* ログインしている場合 */}
                        <div onClick={() => { onClose(); router.push(`/users/${current_userId}/profile`); }} className="flex items-center mb-4 cursor-pointer">
                            <div className="h-8 w-8 rounded-full bg-gray-400 mr-2 flex items-center justify-center overflow-hidden">
                                {currentUserProfile?.user_icon_url ? (
                                    <img
                                        src={currentUserProfile.user_icon_url}
                                        alt={`${currentUserProfile?.username}のアイコン`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load user icon in Sidebar:', currentUserProfile.user_icon_url);
                                            (e.target as HTMLImageElement).onerror = null;
                                            (e.target as HTMLImageElement).src = '';
                                        }}
                                    />
                                ) : (
                                    <UserCircleIcon className="h-8 w-8 text-gray-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{currentUserProfile?.username || 'ゲスト'}</p>
                                <p className="text-xs text-gray-400">@{currentUserProfile?.username || 'guest'}</p>
                            </div>
                        </div>

                        {/* 主要なナビゲーションリンク */}
                        <Link href="/posts" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            ホーム
                        </Link>
                        <Link href="/notifications" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            通知
                        </Link>
                        <Link href="/messages" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            メッセージ
                        </Link>
                        <Link href="/bookmarks" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            ブックマーク
                        </Link>
                        <Link href="/users" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            リスト
                        </Link>
                        <Link href="/communities" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            コミュニティ
                        </Link>
                        <Link href="/explore" onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            探索
                        </Link>

                        <hr className="border-t border-gray-700 my-4" /> {/* 区切り線 */}

                        {/* 設定・アカウント */}
                        <Link href={`/users/${current_userId}/profile`} onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            プロフィール
                        </Link>
                        <Link href={`/users/${current_userId}`} onClick={onClose} className="block py-2 text-gray-300 hover:text-white">
                            設定とプライバシー
                        </Link>
                        {/* ログアウトボタン */}
                        <button onClick={handleLogout} className="block py-2 text-red-500 hover:text-red-700 w-full text-left">
                            ログアウト
                        </button>
                    </>
                ) : (
                    <>
                        {/* ログインしていない場合 */}
                        <div className="p-4">
                            <Link href="/auth/login" onClick={onClose} className="block py-2 text-center text-blue-500 hover:text-blue-700 font-semibold">
                                ログイン
                            </Link>
                            <Link href="/auth/register" onClick={onClose} className="block py-2 text-center text-green-500 hover:text-green-700 font-semibold">
                                新規登録
                            </Link>
                        </div>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;