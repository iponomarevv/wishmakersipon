
export interface WishItem {
  id: string;
  title: string;
  link: string;
  image: string;
  price: string;
  desc: string;
  bookedBy?: string;
  isAnonymous?: boolean;
}

export interface WishList {
  id: string;
  name: string;
  items: WishItem[];
  gradient?: string;
  bgImage?: string | null;
  isPublic: boolean;
  sharedWith?: string[];
}

export interface Friend {
  id: string;
  name: string;
  tg: string;
  photo: string | null;
}

export interface FriendData {
  friend: Friend;
  lists: WishList[];
}

export type ViewState = 'home' | 'list-detail' | 'friend-detail' | 'friend-list-detail' | 'friends';
export type TabState = 'lists' | 'friends';

export const GRADIENTS = [
  "linear-gradient(135deg, #FA742B 0%, #FFE985 100%)", // Orange -> Light Yellow
  "linear-gradient(135deg, #1E2AD2 0%, #FFA6B7 100%)", // Deep Blue -> Pinkish
  "linear-gradient(135deg, #B3315F 0%, #FFAA85 100%)", // Red/Pink -> Peach
  "linear-gradient(135deg, #5151E5 0%, #72EDF2 100%)", // Blue -> Cyan
  "linear-gradient(135deg, #F5576C 0%, #F093FB 100%)", // Red -> Pink
  "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)", // Green -> Turquoise
  "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)", // Indigo -> Purple
  "linear-gradient(135deg, #42E695 0%, #3BB2B8 100%)", // Green -> Teal
];

export const DEFAULT_GRADIENT = GRADIENTS[0];

// Telegram Web App Types
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
}

export interface WebAppInitData {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: any;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    ready: () => void;
    expand: () => void;
    close: () => void;
    openTelegramLink: (url: string) => void;
    openLink: (url: string) => void;
}

declare global {
    interface Window {
        Telegram: {
            WebApp: TelegramWebApp;
        };
    }
}
