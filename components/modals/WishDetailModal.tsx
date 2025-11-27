
import React, { useState } from 'react';
import { WishItem } from '../../types';
import { Share2, Pen, MoreHorizontal, Trash2, EyeOff, Star, MoveLeft } from 'lucide-react';
import { Language, translations } from '../../translations';
import { DefaultGiftIcon } from '../DefaultGiftIcon';

interface WishDetailModalProps {
  wish: WishItem;
  lang: Language;
  onClose: () => void;
  onEdit: () => void;
  onShare: () => void;
  onBook?: (isAnonymous: boolean) => void;
  onDelete?: () => void;
  isReadOnly?: boolean;
  booker?: { name: string; photo?: string | null };
  isOwnerBooking?: boolean;
}

const WishDetailModal: React.FC<WishDetailModalProps> = ({ 
    wish, 
    lang, 
    onClose, 
    onEdit, 
    onShare, 
    onBook, 
    onDelete, 
    isReadOnly,
    booker,
    isOwnerBooking
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isBookingConfirmOpen, setIsBookingConfirmOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const t = translations[lang].wishDetail;

  const handleBookClick = () => {
      // If booked by someone else, do nothing (button should be disabled visually)
      if (wish.bookedBy && !isOwnerBooking) return;

      if (wish.bookedBy) {
          // Unbook (only if booked by me)
          onBook?.(false);
      } else {
          // Open confirmation for new booking
          setIsBookingConfirmOpen(true);
      }
  };

  const handleOwnerBookToggle = () => {
      onBook?.(false); // Owner booking doesn't need anonymous flag
      setShowMenu(false);
  };

  const confirmBooking = () => {
      onBook?.(isAnonymous);
      setIsBookingConfirmOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[500px] bg-[#101318] rounded-t-[24px] sm:rounded-[24px] p-5 shadow-2xl flex flex-col text-white border border-white/10 relative"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {/* Booking Confirmation Overlay */}
        {isBookingConfirmOpen && (
            <div className="absolute inset-0 z-50 bg-[#101318] rounded-[24px] flex flex-col items-center justify-center p-6 animate-in fade-in">
                <div className="text-[18px] font-bold mb-6 text-center">{t.confirmBookingTitle}</div>
                
                <label className="flex items-center gap-3 mb-8 cursor-pointer bg-white/5 p-4 rounded-xl w-full">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isAnonymous ? 'border-[#4ade80] bg-[#4ade80]' : 'border-white/30'}`}>
                        {isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <span className="text-[15px]">{t.anonymousLabel}</span>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isAnonymous} 
                        onChange={() => setIsAnonymous(!isAnonymous)} 
                    />
                </label>

                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setIsBookingConfirmOpen(false)}
                        className="flex-1 h-[48px] rounded-full bg-white/10 font-medium hover:bg-white/20 transition-colors"
                    >
                        {t.cancelButton}
                    </button>
                    <button 
                        onClick={confirmBooking}
                        className="flex-1 h-[48px] rounded-full bg-[#4ade80] text-black font-bold hover:bg-[#3bcf70] transition-colors"
                    >
                        {t.confirmButton}
                    </button>
                </div>
            </div>
        )}

        {/* Mobile Handle */}
        <div className="w-[40px] h-[4px] rounded-full bg-white/20 mx-auto mb-4 sm:hidden" />
        
        {/* Image */}
        <div className={`w-full rounded-[20px] overflow-hidden mb-4 flex items-center justify-center min-h-[250px] relative shadow-lg ${wish.image ? 'bg-[#20232b]' : 'bg-white/5'}`}>
          {wish.image ? (
            <img src={wish.image} alt={wish.title} className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <div className="w-[120px] h-[120px]">
                <DefaultGiftIcon className="w-full h-full" />
            </div>
          )}

          {/* Booker Info Overlay */}
          {wish.bookedBy && (
            <div className="absolute bottom-3 left-3 right-3 bg-[#1F2125]/95 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/10 shadow-lg z-20">
                
                {isOwnerBooking ? (
                    // Marked by Owner
                    <div className="w-full flex flex-col justify-center pl-1">
                        <div className="text-[15px] text-white font-semibold">{t.markedByOwner}</div>
                    </div>
                ) : wish.isAnonymous ? (
                    // Anonymous
                    <div className="w-full flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <EyeOff size={20} className="text-white/50" />
                        </div>
                        <div className="text-[15px] text-white font-semibold">{t.anonymous}</div>
                    </div>
                ) : booker && (
                    // Public Booker
                    <>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                            {booker.photo ? (
                                <img src={booker.photo} alt={booker.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white/50">?</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[12px] text-white/50 uppercase tracking-wide font-bold">{t.bookedBy}</div>
                            <div className="text-[15px] text-white font-semibold">{booker.name}</div>
                        </div>
                    </>
                )}
            </div>
          )}
        </div>

        {/* Title & Link */}
        <div className="flex items-start justify-between gap-3 mb-1">
             <a href={wish.link || '#'} target="_blank" rel="noreferrer" className="text-[22px] font-bold leading-tight text-white no-underline hover:underline line-clamp-2">
                 {wish.title || translations[lang].listView.noName}
             </a>
             {wish.link && <span className="text-[14px] opacity-50 rotate-[-45deg]">➜</span>}
        </div>

        {/* Price */}
        {wish.price && <div className="text-[18px] font-bold text-[#4ade80] mb-3">{wish.price}</div>}

        {/* Description */}
        {wish.desc && (
            <div className="text-[15px] text-white/70 mb-6 whitespace-pre-wrap leading-relaxed">
                {wish.desc}
            </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-auto">
             
             {/* Back Button (Left) */}
             <button 
                onClick={onClose} 
                className="w-[44px] h-[44px] rounded-full bg-[#1F2125] border border-white/10 grid place-items-center cursor-pointer transition-transform active:scale-95 hover:bg-white/5"
            >
                <MoveLeft size={20} />
            </button>

             <div className="flex items-center gap-3">
                 
                 {/* Read Only Actions: Share & Book directly */}
                 {isReadOnly ? (
                     <>
                        <button 
                            onClick={onShare}
                            className="w-[44px] h-[44px] rounded-full bg-[#1F2125] border border-white/10 grid place-items-center cursor-pointer transition-transform active:scale-95 hover:bg-white/5"
                        >
                            <Share2 size={18} />
                        </button>
                        {onBook && (
                            <button 
                                onClick={handleBookClick}
                                disabled={!!wish.bookedBy && !isOwnerBooking}
                                className={`h-[44px] px-5 rounded-full border border-white/10 flex items-center gap-2 transition-transform active:scale-95 ${
                                    wish.bookedBy 
                                        ? (isOwnerBooking 
                                            ? 'bg-[#4ade80] text-black hover:bg-[#3bcf70] cursor-pointer' // Booked by me -> Green/Unbook
                                            : 'bg-[#2A2D32] text-white/50 cursor-not-allowed') // Booked by other -> Disabled
                                        : 'bg-[#1F2125] hover:bg-white/5 cursor-pointer' // Not booked -> Dark/Book
                                }`}
                            >
                                <Star size={18} fill={wish.bookedBy ? "currentColor" : "none"} />
                                <span className="font-medium text-[14px]">
                                    {wish.bookedBy 
                                        ? (isOwnerBooking ? t.unbook : t.bookedAlert) 
                                        : t.booked
                                    }
                                </span>
                            </button>
                        )}
                     </>
                 ) : (
                     /* Owner Actions: Edit & Menu */
                     <>
                        <button 
                            onClick={onEdit} 
                            className="w-[44px] h-[44px] rounded-full bg-[#1F2125] border border-white/10 grid place-items-center cursor-pointer transition-transform active:scale-95 hover:bg-white/5"
                        >
                            <Pen size={18} />
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)} 
                                className={`w-[44px] h-[44px] rounded-full bg-[#1F2125] border border-white/10 grid place-items-center cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${showMenu ? 'bg-white/10' : ''}`}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute bottom-14 right-0 bg-[#1A1D21] border border-white/10 rounded-[16px] w-[220px] z-50 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                        
                                        {/* Share */}
                                        <div 
                                            onClick={() => { onShare(); setShowMenu(false); }}
                                            className="px-4 py-3.5 text-[14px] text-white border-b border-white/5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <Share2 size={16} />
                                            <span>{t.share}</span>
                                        </div>

                                        {/* Owner Manual Booking */}
                                        {onBook && (
                                            <div 
                                                onClick={handleOwnerBookToggle}
                                                className="px-4 py-3.5 text-[14px] text-white border-b border-white/5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <Star size={16} />
                                                <span>{wish.bookedBy ? t.unbook : t.markAsBooked}</span>
                                            </div>
                                        )}

                                        {/* Hide */}
                                        <div 
                                            onClick={() => { alert(t.hideAlert); setShowMenu(false); }}
                                            className="px-4 py-3.5 text-[14px] text-white border-b border-white/5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <EyeOff size={16} />
                                            <span>{t.hide}</span>
                                        </div>

                                        {/* Delete */}
                                        {onDelete && (
                                            <div 
                                                onClick={() => { onDelete(); setShowMenu(false); }}
                                                className="px-4 py-3.5 text-[14px] text-[#ff6b6b] flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                <span>{t.delete}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                     </>
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default WishDetailModal;
