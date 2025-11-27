import React from 'react';

interface ListActionsModalProps {
  onClose: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ListActionsModal: React.FC<ListActionsModalProps> = ({ onClose, onShare, onEdit, onDelete }) => {
  return (
    <div className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/55" onClick={onClose}>
      <div 
        className="w-full max-w-[640px] bg-[#101318] rounded-t-[22px] p-[10px_16px_24px] shadow-2xl text-white flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-[44px] h-[4px] rounded-full bg-white/30 mx-auto mb-4" />
        
        <div className="text-[16px] font-[600] mb-4 text-center">Действия со списком</div>

        <div className="flex flex-col gap-2">
            <button 
                onClick={onShare}
                className="w-full p-4 bg-white/5 rounded-[14px] flex justify-between items-center cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all border-none text-white"
            >
                <span className="text-[15px]">Поделиться</span>
                <span className="text-[18px]">⤴︎</span>
            </button>

            <button 
                onClick={onEdit}
                className="w-full p-4 bg-white/5 rounded-[14px] flex justify-between items-center cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all border-none text-white"
            >
                <span className="text-[15px]">Редактировать</span>
                <span className="text-[18px]">✎</span>
            </button>

            <button 
                onClick={onDelete}
                className="w-full p-4 bg-white/5 rounded-[14px] flex justify-between items-center cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all border-none text-[#ff6b6b]"
            >
                <span className="text-[15px]">Удалить</span>
                <span className="text-[18px]">🗑</span>
            </button>
        </div>
        
        <button 
            onClick={onClose}
            className="w-full mt-4 p-3 text-center text-white/50 text-[14px] cursor-pointer border-none bg-transparent hover:text-white transition-colors"
        >
            Отмена
        </button>
      </div>
    </div>
  );
};

export default ListActionsModal;
