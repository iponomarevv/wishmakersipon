
import React, { useState, useRef, useEffect } from 'react';
import { WishList } from '../types';
import { Share2, Pen, Trash2, MoreHorizontal, Plus, EyeOff } from 'lucide-react';
import { Language, translations, pluralizeWishes } from '../translations';
import { DefaultGiftIcon } from './DefaultGiftIcon';

interface WishListCardProps {
  list: WishList;
  lang: Language;
  onOpen: (listId: string) => void;
  onAddQuick: (listId: string) => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onHide?: () => void;
  readOnly?: boolean;
  compact?: boolean;
}

const WishListCard: React.FC<WishListCardProps> = ({ 
    list, 
    lang,
    onOpen, 
    onAddQuick, 
    onShare, 
    onEdit, 
    onDelete, 
    onHide,
    readOnly,
    compact = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].card;

  const count = list.items.length;
  
  // Get first 3 items for preview
  // If item has no image, use placeholder logic
  const previewItems = list.items.slice(0, 3);
  
  const countText = count 
    ? `${count} ${pluralizeWishes(count, lang)}`
    : t.empty;

  const bgStyle = list.bgImage
    ? { backgroundImage: `url(${list.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: list.gradient || '#222' };

  // Close menu on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setMenuOpen(false);
          }
      };
      if (menuOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [menuOpen]);

  const showMenuButton = !readOnly || !!onHide;

  return (
    <div
      className={`relative rounded-[24px] cursor-pointer transition-transform active:scale-[0.98] ${menuOpen ? 'z-20' : ''} ${compact ? 'px-5 py-4 mb-2' : 'p-5 mb-3 flex flex-col gap-4'}`}
      style={bgStyle}
      onClick={() => onOpen(list.id)}
    >
        {/* Header - Z-index 10 to be above bottom content */}
        <div className={`flex justify-between relative z-[10] ${compact ? 'items-center' : 'items-start'}`}>
            <div className="flex flex-col gap-1">
                <div className={`${compact ? 'text-[18px]' : 'text-[22px]'} font-bold text-white leading-tight`}>{list.name}</div>
                <div className={`${compact ? 'text-[13px]' : 'text-[14px]'} text-white/80 font-medium`}>{countText}</div>
            </div>
            
            {showMenuButton && (
                <div className="relative" ref={menuRef}>
                    <div
                        className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm grid place-items-center text-white cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                    >
                        <MoreHorizontal size={20} />
                    </div>
                    
                    {menuOpen && (
                        <div className="absolute right-0 top-11 bg-[#1A1D21] border border-white/10 rounded-xl shadow-xl w-[220px] z-[50] overflow-hidden py-1">
                            {!readOnly && (
                                <>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onShare?.(); }}
                                        className="px-4 py-3 text-[14px] text-white flex items-center gap-3 hover:bg-white/5 transition-colors"
                                    >
                                        <Share2 size={16} />
                                        <span>{t.share}</span>
                                    </div>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(); }}
                                        className="px-4 py-3 text-[14px] text-white flex items-center gap-3 hover:bg-white/5 transition-colors"
                                    >
                                        <Pen size={16} />
                                        <span>{t.edit}</span>
                                    </div>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(); }}
                                        className="px-4 py-3 text-[14px] text-[#ef4444] flex items-center gap-3 hover:bg-white/5 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span>{t.delete}</span>
                                    </div>
                                </>
                            )}
                            
                            {/* Option for shared lists */}
                            {onHide && (
                                <div 
                                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onHide(); }}
                                    className="px-4 py-3 text-[14px] text-white flex items-center gap-3 hover:bg-white/5 transition-colors"
                                >
                                    <EyeOff size={16} />
                                    <span>{t.hide}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Bottom Content - Hidden in compact mode */}
        {!compact && (
            <div className="flex items-center mt-2 relative z-[1]">
            {!readOnly && (
                <div
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white hover:bg-white/30 transition-colors shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddQuick(list.id);
                    }}
                >
                    <Plus size={24} />
                </div>
            )}

            {/* Previews */}
            <div className={`flex items-center gap-2 ${!readOnly ? 'ml-3' : ''}`}>
                {previewItems.map((item) => (
                    <div 
                            key={item.id} 
                            className="w-10 h-10 rounded-full bg-black/20 overflow-hidden border border-white/10 shadow-sm shrink-0 grid place-items-center"
                    >
                        {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-transparent p-2 flex items-center justify-center">
                                <DefaultGiftIcon className="w-full h-full" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            </div>
        )}
    </div>
  );
};

export default WishListCard;
