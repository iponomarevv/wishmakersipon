import React, { useState, useRef } from 'react';
import { WishItem } from '../../types';
import { X, Plus, Clipboard, Trash2 } from 'lucide-react';
import { Language, translations } from '../../translations';

interface WishEditorModalProps {
  wish?: WishItem;
  lang: Language;
  onSave: (wishData: Partial<WishItem>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const WishEditorModal: React.FC<WishEditorModalProps> = ({ wish, lang, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(wish?.title || '');
  const [link, setLink] = useState(wish?.link || '');
  const [desc, setDesc] = useState(wish?.desc || '');
  const [price, setPrice] = useState(wish?.price || '');
  const [image, setImage] = useState(wish?.image || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].wishEditor;

  const autoFillFromLink = (urlStr: string) => {
    if (!urlStr.trim()) return;
    let cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    try {
      const url = new URL(cleanUrl);
      
      // 1. Generate Image Seed based on domain/path
      const seed = url.hostname + url.pathname;
      // Only set image if user hasn't uploaded one manually
      if (!image) {
          setImage(`https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`);
      }

      // 2. Extract Title from path
      if (!title) {
        // Get the last segment of the path
        let potentialTitle = url.pathname.split('/').filter(Boolean).pop() || url.hostname;
        // Remove file extensions
        potentialTitle = potentialTitle.replace(/\.[^/.]+$/, "");
        // Replace separators with spaces
        potentialTitle = potentialTitle.replace(/[-_]/g, ' ');
        // Capitalize first letter
        potentialTitle = potentialTitle.charAt(0).toUpperCase() + potentialTitle.slice(1);
        
        setTitle(potentialTitle.substring(0, 40));
      }

      // 3. Mock Price Extraction
      if (!price) {
         let hash = 0;
         for (let i = 0; i < cleanUrl.length; i++) {
            hash = cleanUrl.charCodeAt(i) + ((hash << 5) - hash);
         }
         const mockPrice = (Math.abs(hash) % 8000) + 1000; 
         setPrice(mockPrice.toString());
      }

    } catch (e) { 
        console.error("Error parsing URL", e);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLink(text);
        autoFillFromLink(text);
      }
    } catch (err) {
      alert(t.alertPasteFail);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title && !link) {
      alert(t.alertNoTitle);
      return;
    }
    onSave({
      title: title || translations[lang].listView.noName,
      link,
      desc,
      price: price ? (price.includes('₽') ? price : `${price} ₽`) : '',
      image
    });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[500px] bg-[#151517] rounded-t-[24px] sm:rounded-[24px] border border-white/10 text-white flex flex-col max-h-[95vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Indicator for mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
             <div className="text-[18px] font-bold text-white">
                {wish ? t.editWish : t.newWish}
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 grid place-items-center text-white/60 hover:bg-white/10 transition-colors">
                 <X size={18} />
             </button>
        </div>
        
        <div className="overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">

          {/* 1. Link */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-semibold text-white/40 tracking-wider">{t.link}</label>
            <div className="flex gap-2">
                <input
                    className="flex-1 bg-[#1F2125] rounded-[12px] border border-white/5 px-4 py-3.5 text-[15px] text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                    placeholder={t.linkPlaceholder}
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    onBlur={() => link && autoFillFromLink(link)}
                />
                <button 
                    onClick={handlePaste}
                    className="w-[52px] bg-[#1F2125] rounded-[12px] border border-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                    <Clipboard size={20} />
                </button>
            </div>
          </div>
          
          {/* 2. Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-semibold text-white/40 tracking-wider">{t.title}</label>
            <input
              className="bg-[#1F2125] rounded-[12px] border border-white/5 px-4 py-3.5 text-[15px] text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              placeholder={t.titlePlaceholder}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* 3. Description (Single Line) */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-semibold text-white/40 tracking-wider">{t.desc}</label>
            <input
              className="bg-[#1F2125] rounded-[12px] border border-white/5 px-4 py-3.5 text-[15px] text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              placeholder={t.descPlaceholder}
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

           {/* 4. Price */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-semibold text-white/40 tracking-wider">{t.price}</label>
            <div className="relative">
                <input
                    className="w-full bg-[#1F2125] rounded-[12px] border border-white/5 px-4 py-3.5 text-[15px] text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                    placeholder="99.99"
                    value={price.replace(' ₽', '')}
                    onChange={e => setPrice(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ade80] font-bold text-lg pointer-events-none">
                    ₽
                </div>
            </div>
          </div>

           {/* 5. Image URL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-semibold text-white/40 tracking-wider">{t.image}</label>
            <div className="flex gap-2">
                <input
                    className="flex-1 bg-[#1F2125] rounded-[12px] border border-white/5 px-4 py-3.5 text-[15px] text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                    placeholder={t.imagePlaceholder}
                    value={image}
                    onChange={e => setImage(e.target.value)}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[52px] bg-[#1F2125] rounded-[12px] border border-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                    title={t.image}
                >
                    <Plus size={24} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-5 pt-2 border-t border-white/5 bg-[#151517] flex flex-col gap-3">
            <button 
                onClick={handleSave}
                className="w-full h-[52px] bg-[#FF9F68] hover:bg-[#FF8F50] text-black font-semibold text-[16px] rounded-full shadow-lg transition-colors active:scale-[0.99]"
            >
                {wish ? t.saveEdit : t.saveAdd}
            </button>
            
            {wish && onDelete && (
                <button 
                    onClick={onDelete}
                    className="w-full h-[52px] bg-[#1F2125] border border-white/10 hover:bg-white/5 text-[#ff6b6b] font-semibold text-[16px] rounded-full transition-colors active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    {t.delete}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default WishEditorModal;
