
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
  onSaveBeforeShare?: () => Promise<boolean>;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  list, 
  lang, 
  friends, 
  onClose, 
  onTogglePublic,
  onUpdateSharedWith,
  onPreview,
  isReadOnly,
  onSaveBeforeShare
}) => {
  const isTelegram = Boolean(window.Telegram?.WebApp);
  // Telegram deep link to open in mini app
  const telegramAppLink = `https://t.me/Wishmakers_bot?startapp=share_${list.id}`;
  // Fallback web link (for non-Telegram browsers)
  const webLink = `https://wishmakers.ru/#/l/${list.id}`;
  // Use Telegram link if in Telegram, otherwise web link
  const shareLink = isTelegram ? telegramAppLink : webLink;
  const t = translations[lang].share;
  
  const handleNativeShare = async () => {
    try {
      // Try to save list to backend before sharing (but don't block if it fails)
      if (onSaveBeforeShare) {
        try {
          const saved = await onSaveBeforeShare();
          // Even if save failed, allow sharing to proceed
          if (!saved) {
            console.warn('Save failed, but allowing share to proceed');
          }
        } catch (saveError) {
          console.error('Error saving before share:', saveError);
          // Continue with sharing anyway
        }
      }
      
      // If in Telegram, use Telegram sharing
      if (isTelegram && window.Telegram?.WebApp?.openTelegramLink) {
        const text = encodeURIComponent(`${t.shareText} ${list.name}`);
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(telegramAppLink)}&text=${text}`;
        try {
          window.Telegram.WebApp.openTelegramLink(shareUrl);
        } catch (telegramError) {
          console.error('Error opening Telegram share:', telegramError);
          // Fallback to clipboard
          navigator.clipboard.writeText(shareLink);
          alert(t.copied);
        }
        return;
      }
      
      // Otherwise use native share or clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title: list.name,
            text: `${t.shareText} ${list.name}`,
            url: shareLink, // Will use telegramAppLink if in Telegram
          });
        } catch (err: any) {
          // User cancelled or error - fallback to clipboard
          if (err.name !== 'AbortError') {
            console.error("Error sharing", err);
          }
          navigator.clipboard.writeText(shareLink);
          alert(t.copied);
        }
      } else {
        navigator.clipboard.writeText(shareLink);
        alert(t.copied);
      }
    } catch (error) {
      console.error('Unexpected error in handleNativeShare:', error);
      // Last resort - just copy to clipboard
      try {
        navigator.clipboard.writeText(shareLink);
        alert(t.copied);
      } catch (clipboardError) {
        alert('Ошибка при шаринге. Попробуй скопировать ссылку вручную.');
      }
    }
  };

  const handleTelegramShare = async () => {
      // Ensure list is saved to backend before sharing
      // This will be handled by parent component's onUpdateSharedWith
      
      // Use Telegram app link to open in mini app
      const text = encodeURIComponent(`${t.shareText} ${list.name}`);
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(telegramAppLink)}&text=${text}`;
      if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
          window.open(shareUrl, '_blank');
      }
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

        {/* Simplified: All lists are public - just share link */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-[14px] border border-white/10">
                <div className="flex-1 text-[13px] text-white/60 truncate" title={shareLink}>
                    {isTelegram ? telegramAppLink : webLink}
                </div>
                <button 
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                            // Try to save list to backend before copying (but allow even if fails)
                            if (onSaveBeforeShare) {
                                try {
                                    await onSaveBeforeShare(); // Don't block if fails
                                } catch (saveError) {
                                    console.warn('Save failed, but continuing with copy:', saveError);
                                }
                            }
                            
                            // Simple and reliable method: use input field
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = shareLink;
                            input.readOnly = true;
                            input.style.position = 'fixed';
                            input.style.left = '-9999px';
                            input.style.top = '0';
                            input.style.opacity = '0';
                            input.style.pointerEvents = 'none';
                            
                            document.body.appendChild(input);
                            
                            try {
                                // Focus, select and copy
                                input.focus();
                                input.select();
                                input.setSelectionRange(0, shareLink.length);
                                
                                // Try execCommand (works in most browsers including Telegram)
                                const success = document.execCommand('copy');
                                
                                if (success) {
                                    alert(t.copied);
                                } else {
                                    // If execCommand failed, try clipboard API
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                        try {
                                            await navigator.clipboard.writeText(shareLink);
                                            alert(t.copied);
                                        } catch (clipError) {
                                            // Both methods failed - show link for manual copy
                                            alert('Скопируй ссылку:\n\n' + shareLink);
                                        }
                                    } else {
                                        // No clipboard API - show link
                                        alert('Скопируй ссылку:\n\n' + shareLink);
                                    }
                                }
                            } catch (err) {
                                console.error('Copy failed:', err);
                                // Show link for manual copy
                                alert('Скопируй ссылку:\n\n' + shareLink);
                            } finally {
                                if (document.body.contains(input)) {
                                    document.body.removeChild(input);
                                }
                            }
                        } catch (error) {
                            console.error('Unexpected error:', error);
                            alert('Скопируй ссылку:\n\n' + shareLink);
                        }
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

      </div>
    </div>
  );
};

export default ShareModal;
