
import React from 'react';
import { WishList, Friend } from '../../types';
import { Language, translations } from '../../translations';
import { Share, Send, Eye } from 'lucide-react';

interface ShareModalProps {
  list: WishList;
  lang: Language;
  friends: Friend[];
  onClose: () => void;
  onTogglePublic: (isPublic: boolean) => void;
  onUpdateSharedWith: (friendIds: string[]) => void;
  onPreview: () => void;
  isReadOnly?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  list, 
  lang, 
  friends, 
  onClose, 
  onTogglePublic,
  onUpdateSharedWith,
  onPreview,
  isReadOnly
}) => {
  const shareLink = `https://wishmakers.app/l/${list.id}`;
  const t = translations[lang].share;
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name,
          text: `${t.shareText} ${list.name}`,
          url: shareLink,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(shareLink);
      alert(t.copied);
    }
  };

  const handleTelegramShare = () => {
      const text = encodeURIComponent(`${t.shareText} ${list.name}\n${shareLink}`);
      // Opens Telegram share picker
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/55" onClick={onClose}>
      <div
        className="w-full max-w-[640px] bg-[#101318] text-white rounded-t-[22px] p-[10px_16px_16px] shadow-2xl pb-8 border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-[44px] h-[4px] rounded-full bg-white/30 mx-auto mb-2.5" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-[18px] font-[600]">{t.title}</div>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
                <div 
                    onClick={onPreview} 
                    className="w-[36px] h-[36px] rounded-full bg-white/10 grid place-items-center cursor-pointer hover:bg-white/20 transition-colors"
                    title="Preview"
                >
                    <Eye size={18} />
                </div>
            )}
            <div 
                onClick={onClose} 
                className="w-[36px] h-[36px] rounded-full bg-white/10 grid place-items-center cursor-pointer hover:bg-white/20 transition-colors"
            >
                ✕
            </div>
          </div>
        </div>

        {/* Public/Private Toggle - Hidden for Friends (Read Only) */}
        {!isReadOnly && (
            <div className="bg-white/5 rounded-[16px] p-4 mb-4">
            <div className="flex items-center justify-between gap-2.5 mb-2">
                <div className="font-medium text-[15px]">{list.isPublic ? t.public : t.private}</div>
                <div
                className={`w-[52px] h-[30px] rounded-full relative cursor-pointer transition-colors border border-white/10 ${list.isPublic ? 'bg-[#22c55e]' : 'bg-white/10'}`}
                onClick={() => onTogglePublic(!list.isPublic)}
                >
                <div className={`absolute top-[2px] left-[2px] w-[24px] h-[24px] rounded-full bg-white transition-transform shadow-sm ${list.isPublic ? 'translate-x-[22px]' : ''}`} />
                </div>
            </div>
            
            <div className="text-[13px] text-white/60 mt-1 leading-relaxed">
                {list.isPublic ? t.hintPublic : t.privateHint}
            </div>
            </div>
        )}

        {/* --- PUBLIC MODE --- */}
        {list.isPublic && (
            <div className="animate-fade-in space-y-4">
                 <div className="flex items-center gap-2 bg-white/5 p-3 rounded-[14px] border border-white/10">
                    <div className="flex-1 text-[13px] text-white/60 truncate">{shareLink}</div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(shareLink);
                            alert(t.copied);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
                    >
                        {t.copy}
                    </button>
                </div>

                <button
                    onClick={handleNativeShare}
                    className="w-full h-[52px] bg-white text-black rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-[0.99]"
                >
                    <Share size={20} />
                    {t.send}
                </button>
            </div>
        )}

        {/* --- PRIVATE MODE --- */}
        {!list.isPublic && (
            <div className="animate-fade-in pt-2">
                <button
                    onClick={handleTelegramShare}
                    className="w-full h-[52px] bg-white text-black rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-[0.99]"
                >
                    <Send size={20} />
                    {t.selectFriend}
                </button>
                <div className="text-[13px] text-white/40 mt-3 text-center px-4">
                    {t.privateShareHint}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ShareModal;
