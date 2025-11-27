import React, { useState, useRef, useEffect } from 'react';
import { WishList, DEFAULT_GRADIENT, GRADIENTS } from '../../types';
import { X, Check, Image as ImageIcon, Palette } from 'lucide-react';
import { Language, translations } from '../../translations';

interface ListEditorModalProps {
  list?: WishList;
  lang: Language;
  onSave: (listData: Partial<WishList>) => void;
  onClose: () => void;
}

const ListEditorModal: React.FC<ListEditorModalProps> = ({ list, lang, onSave, onClose }) => {
  const [name, setName] = useState(list?.name || '');
  const [gradient, setGradient] = useState(list?.gradient || DEFAULT_GRADIENT);
  const [bgImage, setBgImage] = useState<string | null>(list?.bgImage || null);
  
  // Custom Gradient State
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [color1, setColor1] = useState('#FF9A9E');
  const [color2, setColor2] = useState('#FECFEF');
  const [angle, setAngle] = useState(135);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].listEditor;

  useEffect(() => {
    if (showCustomPicker) {
        const newGradient = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
        setGradient(newGradient);
        setBgImage(null);
    }
  }, [color1, color2, angle, showCustomPicker]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBgImage(ev.target?.result as string);
        setShowCustomPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      gradient: bgImage ? undefined : gradient,
      bgImage,
      isPublic: list ? list.isPublic : true,
    });
  };

  const currentStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: gradient };

  return (
    <div 
      className="fixed inset-0 z-[5000] flex flex-col items-center justify-center transition-all duration-300"
      style={currentStyle}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center gap-6 p-6">
        
        {/* Controls Container */}
        <div className="w-full flex flex-col gap-4">
            
            {/* Row 1: Tools & Gradients */}
            <div className="flex items-center gap-3 overflow-x-auto max-w-full p-6 no-scrollbar">
                {/* Image Upload */}
                <div 
                        className="flex-none w-[36px] h-[36px] rounded-full bg-white text-black grid place-items-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon size={16} />
                    </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {/* Custom Gradient Toggle */}
                <div 
                    className={`flex-none w-[36px] h-[36px] rounded-full bg-white text-black grid place-items-center cursor-pointer shadow-lg hover:scale-105 transition-transform ${showCustomPicker ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => {
                        setShowCustomPicker(!showCustomPicker);
                        setBgImage(null);
                    }}
                >
                    <Palette size={16} />
                </div>

                {/* Gradient Presets */}
                {GRADIENTS.map((g, i) => (
                    <div
                        key={i}
                        className={`flex-none w-[36px] h-[36px] rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 border-2 ${
                            !bgImage && gradient === g && !showCustomPicker ? 'border-white scale-110' : 'border-transparent border-white/20'
                        }`}
                        style={{ background: g }}
                        onClick={() => {
                            setBgImage(null);
                            setGradient(g);
                            setShowCustomPicker(false);
                        }}
                    />
                ))}
            </div>

            {/* Custom Picker UI (Conditional) */}
            {showCustomPicker && (
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 mx-4 animate-fade-in border border-white/10">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-white text-sm">
                            <span>{t.colors}</span>
                            <div className="flex gap-3">
                                <input 
                                    type="color" 
                                    value={color1} 
                                    onChange={(e) => setColor1(e.target.value)} 
                                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                                />
                                <input 
                                    type="color" 
                                    value={color2} 
                                    onChange={(e) => setColor2(e.target.value)} 
                                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-white text-xs opacity-80">
                                <span>{t.angle}</span>
                                <span>{angle}°</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={angle} 
                                onChange={(e) => setAngle(Number(e.target.value))}
                                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Title Input */}
        <div className="w-full mt-2">
            <input
                className="w-full bg-transparent border-none text-center text-[32px] font-bold text-white placeholder-white/50 outline-none drop-shadow-md"
                placeholder={t.titlePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
            />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 mt-4">
            <button 
                onClick={onClose}
                className="w-[44px] h-[44px] rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-gray-100 transition-colors"
            >
                <X size={20} />
            </button>

            <button 
                onClick={handleSave}
                className="w-[44px] h-[44px] rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-gray-100 transition-colors"
            >
                <Check size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default ListEditorModal;