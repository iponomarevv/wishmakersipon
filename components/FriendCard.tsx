import React from 'react';
import { Friend, WishList } from '../types';

interface FriendCardProps {
  friend: Friend;
  lists: WishList[];
  onSelect: (friendId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, lists, onSelect }) => {
  const listCount = lists.length;
  const wishCount = lists.reduce((acc, list) => acc + list.items.length, 0);
  
  const decl = (n: number, forms: string[]) => {
    const m = Math.abs(n) % 100;
    const n1 = m % 10;
    if (m > 10 && m < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  const initials = friend.name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="relative rounded-[22px] p-[14px] mb-[12px] max-w-[620px] mx-auto flex gap-[14px] overflow-hidden bg-friend-card cursor-pointer"
      onClick={() => onSelect(friend.id)}
    >
       {/* Vertical Gradient Stripe */}
       <div className="w-[4px] rounded-full bg-stripe-gradient self-stretch relative z-[2]" />

      <div className="flex-1 relative z-[3]">
        <div className="flex justify-between items-center gap-2.5">
            <div className="flex items-center gap-2.5">
                <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-black/5 grid place-items-center font-bold text-white">
                    {friend.photo ? <img src={friend.photo} alt={friend.name} className="w-full h-full object-cover" /> : initials}
                </div>
                <div>
                    <div className="text-[16px] font-[650] text-white">{friend.name}</div>
                    <div className="text-[12px] text-muted mt-0.5">@{friend.tg || "username"}</div>
                </div>
            </div>
            <div className="opacity-35 text-white text-lg">›</div>
        </div>
        
        <div className="text-[12px] text-muted mt-1.5">
             {listCount} {decl(listCount, ['список', 'списка', 'списков'])}, {wishCount} {decl(wishCount, ['желание', 'желания', 'желаний'])}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
