
import React from 'react';
import { WishList } from '../types';
import { Gift, Share2, MoveLeft, Star } from 'lucide-react';
import { Language, translations } from '../translations';
import { DefaultGiftIcon } from './DefaultGiftIcon';

interface ListOwnerProfile {
  name: string;
  handle?: string;
  photo?: string | null;
}

interface ListViewProps {
  list: WishList;
  listOwner?: ListOwnerProfile;
  lang: Language;
  onClose: () => void;
  onEditList?: () => void;
  onShareList?: () => void;
  onAddWish?: () => void;
  onSelectWish: (wishId: string) => void;
  onEditWish: (wishId: string) => void;
  onBookWish?: (wishId: string) => void;
  onShareWish?: (wishId: string) => void;
  isReadOnly?: boolean;
  friends?: any[]; // Using any[] to avoid circular dependency if types aren't perfect, or import Friend
}

const ListView: React.FC<ListViewProps> = ({
  list,
  listOwner,
  lang,
  onClose,
  onShareList,
  onAddWish,
  onSelectWish,
  onEditWish,
  onBookWish,
  onShareWish,
  isReadOnly = false,
  friends = [],
}) => {
  const t = translations[lang].listView;
  const bgStyle = list.bgImage
    ? { backgroundImage: `url(${list.bgImage})` }
    : { background: list.gradient || '#101318' };

  // Helper to find booker info
  const getBookerInfo = (userId: string) => {
      // For demo purposes, checking against friends list passed in props
      // In a real app, this would be a user lookup
      const friend = friends.find(f => f.id === userId);
      return friend || { name: 'Unknown', photo: null };
  };

  const initials = listOwner?.name
    ? listOwner.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div
      className="fixed inset-0 z-50 bg-cover bg-center p-[14px] flex flex-col"
      style={bgStyle}
    >
      {/* Header Navigation */}
      <div className="relative z-10 flex justify-between items-center shrink-0 mb-2">
        <button
            onClick={onClose}
            className="w-[40px] h-[40px] rounded-full bg-black/50 border-none grid place-items-center text-white cursor-pointer backdrop-blur-md transition-opacity hover:bg-black/60"
        >
            <MoveLeft size={24} />
        </button>
        
        <button
            onClick={onShareList}
            className="w-[40px] h-[40px] rounded-full bg-black/50 border-none grid place-items-center text-white cursor-pointer backdrop-blur-md transition-opacity hover:bg-black/60"
        >
            <Share2 size={20} />
        </button>
      </div>

      {/* Owner Profile (Visible only in ReadOnly/Preview mode) */}
      {isReadOnly && listOwner && (
        <div className="flex flex-col items-center gap-2 mb-4 animate-fade-in">
            <div className="w-[60px] h-[60px] rounded-full bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden grid place-items-center shadow-lg">
                {listOwner.photo ? (
                    <img src={listOwner.photo} alt={listOwner.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xl font-bold text-white">{initials}</span>
                )}
            </div>
            <div className="flex flex-col items-center">
                <div className="text-[18px] font-bold text-white leading-tight text-shadow-sm">{listOwner.name}</div>
                {listOwner.handle && (
                    <div className="text-[13px] text-white/70 font-medium">@{listOwner.handle}</div>
                )}
            </div>
        </div>
      )}
      
      {/* List Title */}
      <div className={`text-center text-[26px] font-bold text-white drop-shadow-sm shrink-0 mb-6 px-2 truncate ${isReadOnly ? 'mt-2' : 'mt-2.5'}`}>
          {list.name}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-1">
        {list.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center -mt-10">
                <div className="w-[88px] h-[88px] rounded-full bg-white/10 flex items-center justify-center mb-4 text-white backdrop-blur-md">
                    <Gift size={40} strokeWidth={1.5} />
                </div>
                <div className="text-[20px] font-semibold mb-2 text-white">{t.addWishes}</div>
                <div className="text-[15px] text-white/60 text-center max-w-[260px] leading-snug">
                    {t.pressPlus}
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3 px-1">
                {list.items.map((wish) => {
                    const booker = wish.bookedBy ? getBookerInfo(wish.bookedBy) : null;
                    
                    return (
                        <div
                            key={wish.id}
                            className="flex flex-col gap-2 cursor-pointer active:scale-[0.98] transition-transform relative"
                            onClick={() => onSelectWish(wish.id)}
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-square rounded-[24px] overflow-hidden bg-white/5 shadow-md group">
                                {wish.image ? (
                                    <img src={wish.image} alt={wish.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-transparent p-8">
                                        <DefaultGiftIcon className="w-full h-full" />
                                    </div>
                                )}
                                
                                {/* Booked Indicator (Owner Only) - Simple Star at Top Right */}
                                {!isReadOnly && wish.bookedBy && booker && (
                                    <div 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            alert(`${translations[lang].wishDetail.booked}: ${booker.name}`);
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center text-[#facc15] hover:bg-black/60 transition-colors z-10"
                                    >
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                )}

                                {/* Read Only Actions Overlay */}
                                {isReadOnly && (
                                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                                        {/* Book Button */}
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); onBookWish?.(wish.id); }}
                                            className={`w-8 h-8 rounded-full backdrop-blur-sm grid place-items-center transition-colors ${
                                                wish.bookedBy 
                                                ? 'bg-[#4ade80] text-black' 
                                                : 'bg-black/40 text-white hover:bg-black/60'
                                            }`}
                                        >
                                            <Star size={14} fill={wish.bookedBy ? "currentColor" : "none"} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col px-1">
                                <div className="text-[14px] font-semibold text-white leading-tight line-clamp-2">
                                    {wish.title || t.noName}
                                </div>
                                
                                {wish.price ? (
                                    <div className="text-[13px] font-bold text-[#4ade80] mt-0.5">
                                        {wish.price}
                                    </div>
                                ) : (
                                    <div className="mt-0.5 h-[19px]"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Bottom Actions */}
      {!isReadOnly && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[24px] z-20">
          <button
            onClick={onAddWish}
            className="w-[64px] h-[64px] rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-[32px] font-light leading-none mb-1">+</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ListView;
