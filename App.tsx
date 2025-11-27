
import React, { useState, useEffect } from 'react';
import { WishList, Friend, WishItem, DEFAULT_GRADIENT, GRADIENTS, ViewState, TabState } from './types';
import WishListCard from './components/WishListCard';
import FriendCard from './components/FriendCard';
import ListView from './components/ListView';
import WishEditorModal from './components/modals/WishEditorModal';
import ListEditorModal from './components/modals/ListEditorModal';
import WishDetailModal from './components/modals/WishDetailModal';
import ShareModal from './components/modals/ShareModal';
import { Users, ArrowLeft, UserPlus, Globe } from 'lucide-react';
import { translations, Language } from './translations';

// --- Mock Data Setup (Fallback if not in Telegram) ---
const mockUser = {
    id: "f1",
    name: "Alex Rivera",
    handle: "alexr",
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60" 
};

const initialLists: WishList[] = [
  {
    id: "l1",
    name: "Мои желания",
    items: [
      {
        id: "w1",
        title: "Wireless Headphones",
        link: "https://example.com/vr",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        price: "$299.99",
        desc: "Noise cancelling",
      },
      {
        id: "w2",
        title: "Smart Watch",
        link: "",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        price: "$399.00",
        desc: "Series 9",
        bookedBy: "f2" // Mock booking by Sarah
      },
      {
          id: "w3",
          title: "Kindle E-Reader",
          link: "",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
          price: "$139.99",
          desc: "Latest gen"
      }
    ],
    gradient: GRADIENTS[0],
    isPublic: true,
    sharedWith: []
  }
];

const initialFriends: Friend[] = [
  { id: "f1", name: "Alex Rivera", tg: "alexr", photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60" },
  { id: "f2", name: "Sarah Chen", tg: "sarah", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60" },
];

const initialFriendLists: Record<string, WishList[]> = {
  f1: [
    {
      id: "f1l1",
      name: "Alex's B-day",
      items: [
        { id: "fw1", title: "Coffee Maker", link:"", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60", price: "$129.99", desc: "" }
      ],
      gradient: GRADIENTS[0],
      isPublic: true
    }
  ],
  f2: [
    {
      id: "f2l1",
      name: "Sarah's Setup",
      items: [
        { id: "f2w1", title: "Monitor Stand", link:"", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=60", price: "$45.00", desc: "" }
      ],
      gradient: GRADIENTS[2],
      isPublic: true
    }
  ]
};

const App: React.FC = () => {
  // Telegram Initialization
  const [isTelegram, setIsTelegram] = useState(false);
  const [currentUser, setCurrentUser] = useState(mockUser);

  useEffect(() => {
      if (window.Telegram?.WebApp) {
          setIsTelegram(true);
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();

          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
              setCurrentUser({
                  id: tgUser.id.toString(),
                  name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
                  handle: tgUser.username || '',
                  photo: tgUser.photo_url || null
              });
              
              // Auto-detect language
              if (tgUser.language_code === 'ru' || tgUser.language_code === 'en') {
                  setLang(tgUser.language_code as Language);
              }
          }
      }
  }, []);

  // State
  const [lang, setLang] = useState<Language>('ru');
  const [lists, setLists] = useState<WishList[]>(initialLists);
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [friendListsData, setFriendListsData] = useState(initialFriendLists);
  
  const [view, setView] = useState<ViewState>('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  // Modals
  const [isListEditorOpen, setIsListEditorOpen] = useState(false);
  const [isWishEditorOpen, setIsWishEditorOpen] = useState(false);
  const [isWishDetailOpen, setIsWishDetailOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const t = translations[lang];

  // Derived Data
  const currentList = selectedListId 
    ? (selectedFriendId ? friendListsData[selectedFriendId]?.find(l => l.id === selectedListId) : lists.find(l => l.id === selectedListId))
    : null;

  const currentWish = selectedWishId && currentList
    ? currentList.items.find(i => i.id === selectedWishId)
    : null;

  // Determine owner profile
  const listOwner = isPreviewMode 
      ? { name: currentUser.name, handle: currentUser.handle, photo: currentUser.photo }
      : (selectedFriendId 
          ? { 
              name: friends.find(f => f.id === selectedFriendId)?.name || 'Unknown',
              handle: friends.find(f => f.id === selectedFriendId)?.tg,
              photo: friends.find(f => f.id === selectedFriendId)?.photo
            } 
          : undefined);

  // Determine booker profile if wish is booked
  const booker = currentWish?.bookedBy
      ? friends.find(f => f.id === currentWish.bookedBy)
      : undefined;
  
  const isOwnerBooking = currentWish?.bookedBy === currentUser.id;

  // --- Handlers ---

  const toggleLang = () => {
      setLang(prev => {
          const newLang = prev === 'ru' ? 'en' : 'ru';
          // Auto-translate default list name if it hasn't been changed
          setLists(currentLists => currentLists.map(list => {
              if (list.name === translations[prev].app.defaultListName) {
                  return { ...list, name: translations[newLang].app.defaultListName };
              }
              return list;
          }));
          return newLang;
      });
  };

  const handleOpenList = (listId: string, friendId?: string) => {
    setSelectedListId(listId);
    if (friendId) setSelectedFriendId(friendId);
    setView('list-detail');
  };

  const handleCreateList = (data: Partial<WishList>) => {
    if (selectedListId && !selectedFriendId) {
        // Edit existing
        setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, ...data } as WishList : l));
    } else {
        // Create new
        const newList: WishList = {
            id: `l${Date.now()}`,
            name: data.name!,
            items: [],
            gradient: data.gradient,
            bgImage: data.bgImage,
            isPublic: true,
            ...data
        };
        setLists(prev => [newList, ...prev]);
        setSelectedListId(newList.id);
        setView('list-detail');
    }
    setIsListEditorOpen(false);
  };

  const handleSaveWish = (data: Partial<WishItem>) => {
      if (!selectedListId) return;
      
      setLists(prev => prev.map(list => {
          if (list.id !== selectedListId) return list;
          
          if (selectedWishId) {
              // Edit
              return {
                  ...list,
                  items: list.items.map(i => i.id === selectedWishId ? { ...i, ...data } as WishItem : i)
              };
          } else {
              // Create
              const newWish: WishItem = {
                  id: `w${Date.now()}`,
                  title: data.title!,
                  link: data.link || '',
                  desc: data.desc || '',
                  price: data.price || '',
                  image: data.image || '',
                  ...data
              } as WishItem;
              return { ...list, items: [newWish, ...list.items] };
          }
      }));
      setIsWishEditorOpen(false);
      setSelectedWishId(null);
  };

  const handleDeleteWish = () => {
      if (!selectedListId || !selectedWishId) return;
      if (confirm(t.wishEditor.deleteConfirm)) {
          setLists(prev => prev.map(list => {
              if (list.id !== selectedListId) return list;
              return {
                  ...list,
                  items: list.items.filter(i => i.id !== selectedWishId)
              };
          }));
          setIsWishDetailOpen(false);
          setIsWishEditorOpen(false); // Close editor if open
          setSelectedWishId(null);
      }
  };

  const handleDeleteList = (listId: string) => {
      if (confirm(t.app.deleteListConfirm)) {
          setLists(prev => prev.filter(l => l.id !== listId));
          if (selectedListId === listId) {
              setSelectedListId(null);
              setView('home');
          }
      }
  };
  
  const handleHideFriendList = (friendId: string, listId: string) => {
      if (confirm(t.app.hideListConfirm)) {
          setFriendListsData(prev => ({
              ...prev,
              [friendId]: prev[friendId]?.filter(l => l.id !== listId) || []
          }));
      }
  };

  // Mock booking functionality
  const handleBookWish = (isAnonymous: boolean = false) => {
      if (!currentList || !selectedWishId) return;
      
      // Determine who is booking
      const bookerId = currentUser.id;

      const toggleBooking = (item: WishItem) => {
          if (item.id !== selectedWishId) return item;
          
          const newBookerId = item.bookedBy === bookerId ? undefined : bookerId;
          return { 
              ...item, 
              bookedBy: newBookerId,
              isAnonymous: newBookerId ? isAnonymous : undefined 
          };
      };

      if (selectedFriendId) {
          // Update friend's list data locally
          setFriendListsData(prev => ({
              ...prev,
              [selectedFriendId]: prev[selectedFriendId].map(l => {
                  if (l.id === currentList.id) {
                      return {
                          ...l,
                          items: l.items.map(toggleBooking)
                      }
                  }
                  return l;
              })
          }));
      } else {
           // Update my list data (simulation for preview or owner marking)
            setLists(prev => prev.map(l => {
                  if (l.id === currentList.id) {
                      return {
                          ...l,
                          items: l.items.map(toggleBooking)
                      }
                  }
                  return l;
              })
          );
      }
  };

  // Direct sharing for preview/read-only mode
  const handleQuickShare = () => {
      if (!currentList) return;
      const shareLink = `https://wishmakers.app/l/${currentList.id}`;
      const shareText = t.share.shareText;

      if (!currentList.isPublic) {
           // Private: Trigger Telegram share like in ShareModal
           const text = encodeURIComponent(`${shareText} ${currentList.name}\n${shareLink}`);
           window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`, '_blank');
           return;
      }

      // Public
      if (navigator.share) {
          navigator.share({
              title: currentList.name,
              text: `${shareText} ${currentList.name}`,
              url: shareLink
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(shareLink);
          alert(t.share.copied);
      }
  };

  const renderHome = () => {
    return (
      <div className="min-h-screen bg-[#101318] pb-24 px-4 pt-4">
        <div className="flex justify-between items-center mb-2 px-2">
            {/* Lang Switcher */}
            <button 
                onClick={toggleLang}
                className="w-8 h-8 rounded-full bg-white/5 grid place-items-center text-white/60 hover:bg-white/10 transition-colors"
                title="Switch Language"
            >
              <div className="text-[10px] font-bold uppercase">{lang === 'ru' ? 'EN' : 'RU'}</div>
            </button>

            {/* Friends Icon to switch to Friends View */}
            <button 
                onClick={() => setView('friends')}
                className="w-8 h-8 rounded-full bg-white/5 grid place-items-center text-white/60 hover:bg-white/10 transition-colors"
            >
               <Users size={18} />
            </button>
        </div>
        
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3 mb-6 mt-2">
            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#FF9F68] to-[#FF5F6D] grid place-items-center text-white text-2xl font-semibold overflow-hidden shadow-lg mb-1">
                {currentUser.photo ? (
                    <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                )}
            </div>
            <div className="flex flex-col items-center">
                <div className="text-[20px] font-bold text-white">{currentUser.name}</div>
            </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
             setSelectedListId(null);
             setIsListEditorOpen(true);
          }}
          className="w-full max-w-[320px] mx-auto h-[48px] bg-[#0A0A0A] border border-white/10 text-white rounded-[20px] flex items-center justify-center gap-2 font-medium text-[15px] mb-8 hover:bg-white/5 transition-colors shadow-sm"
        >
          <span className="text-lg font-light">+</span> {t.app.createList}
        </button>

        {/* Content */}
        <div className="max-w-[620px] mx-auto pb-20">
            {/* My Lists Section */}
            <div className="mb-8">
                <div className="space-y-3">
                    {lists.map(list => (
                        <WishListCard
                        key={list.id}
                        list={list}
                        lang={lang}
                        onOpen={handleOpenList}
                        onAddQuick={(id) => {
                            setSelectedListId(id);
                            setSelectedWishId(null);
                            setIsWishEditorOpen(true);
                        }}
                        onShare={() => {
                            setSelectedListId(list.id);
                            setIsShareModalOpen(true);
                        }}
                        onEdit={() => {
                            setSelectedListId(list.id);
                            setIsListEditorOpen(true);
                        }}
                        onDelete={() => handleDeleteList(list.id)}
                        />
                    ))}
                    {lists.length === 0 && (
                        <div className="text-white/40 text-center py-4">{t.app.noLists}</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderFriends = () => {
    // Flatten friend lists for display
    const sharedLists = friends.flatMap(friend => {
        const friendLists = friendListsData[friend.id] || [];
        return friendLists.map(list => ({ ...list, friendId: friend.id, friendName: friend.name }));
    });

    return (
        <div className="min-h-screen bg-[#101318] pb-24 px-4 pt-4">
             {/* Header */}
            <div className="flex items-center gap-4 mb-6 px-2">
                <button 
                    onClick={() => setView('home')}
                    className="w-10 h-10 rounded-full bg-white/5 grid place-items-center text-white/60 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-[20px] font-bold text-white">{t.app.friends}</div>
            </div>

            <div className="max-w-[620px] mx-auto">
                 {/* Invite Button */}
                 <button
                    onClick={() => {
                        const inviteText = t.app.inviteText;
                        // Use Telegram WebApp openTelegramLink if available
                        if (window.Telegram?.WebApp && window.Telegram.WebApp.initData) {
                             try {
                                 window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://wishmakers.app')}&text=${encodeURIComponent(inviteText)}`);
                             } catch (e) {
                                 window.open(`https://t.me/share/url?url=${encodeURIComponent('https://wishmakers.app')}&text=${encodeURIComponent(inviteText)}`, '_blank');
                             }
                        } else if (navigator.share) {
                            navigator.share({
                                title: 'Wishmakers',
                                text: inviteText,
                                url: 'https://wishmakers.app'
                            }).catch(() => {});
                        } else {
                            navigator.clipboard.writeText(inviteText);
                            alert(t.app.inviteCopied);
                        }
                    }}
                    className="w-full max-w-[320px] mx-auto h-[48px] bg-[#0A0A0A] border border-white/10 text-white rounded-[20px] flex items-center justify-center gap-2 font-medium text-[15px] mb-6 hover:bg-white/5 transition-colors shadow-sm"
                 >
                    <UserPlus size={18} />
                    <span>{t.app.inviteFriend}</span>
                 </button>

                 {sharedLists.length > 0 ? (
                    <div className="space-y-3">
                        {sharedLists.map(list => (
                            <WishListCard
                                key={list.id}
                                list={list}
                                lang={lang}
                                onOpen={(id) => handleOpenList(id, list.friendId)}
                                onAddQuick={() => {}}
                                readOnly={true}
                                compact={true}
                                onHide={() => handleHideFriendList(list.friendId, list.id)}
                            />
                        ))}
                    </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center pt-10 text-white/40">
                         <div className="mb-4 text-center">{t.app.noFriendLists}</div>
                     </div>
                 )}
            </div>
        </div>
    )
  }

  return (
    <div className="text-white font-sans">
      
      {view === 'home' && renderHome()}
      
      {view === 'friends' && renderFriends()}
      
      {view === 'list-detail' && currentList && (
        <ListView
          list={currentList}
          listOwner={listOwner}
          lang={lang}
          isReadOnly={!!selectedFriendId || isPreviewMode}
          friends={friends}
          onClose={() => {
              if (isPreviewMode) {
                  setIsPreviewMode(false);
              }
              if (selectedFriendId) {
                  setView('friends');
              } else {
                  setView('home');
              }
              setSelectedListId(null);
              setSelectedFriendId(null);
          }}
          onEditList={() => setIsListEditorOpen(true)}
          onShareList={() => {
              if (isPreviewMode || selectedFriendId) {
                  handleQuickShare();
              } else {
                  setIsShareModalOpen(true);
              }
          }}
          onAddWish={() => {
              setSelectedWishId(null);
              setIsWishEditorOpen(true);
          }}
          onSelectWish={(wishId) => {
              setSelectedWishId(wishId);
              setIsWishDetailOpen(true);
          }}
          onEditWish={(wishId) => {
              setSelectedWishId(wishId);
              setIsWishEditorOpen(true);
          }}
          onBookWish={(wishId) => {
              setSelectedWishId(wishId);
              setIsWishDetailOpen(true);
          }}
          onShareWish={(wishId) => {
             // If direct sharing of wish needed, implement similar to handleQuickShare but for wish URL
             // For now alert or no-op if disabled
          }}
        />
      )}

      {/* MODALS */}
      
      {isListEditorOpen && (
        <ListEditorModal 
          list={selectedListId && !selectedFriendId ? currentList! : undefined}
          lang={lang}
          onClose={() => setIsListEditorOpen(false)}
          onSave={handleCreateList}
        />
      )}

      {isWishEditorOpen && (
        <WishEditorModal
          wish={currentWish || undefined}
          lang={lang}
          onClose={() => setIsWishEditorOpen(false)}
          onSave={handleSaveWish}
          onDelete={currentWish ? handleDeleteWish : undefined}
        />
      )}

      {isWishDetailOpen && currentWish && (
        <WishDetailModal
          wish={currentWish}
          lang={lang}
          isReadOnly={!!selectedFriendId || isPreviewMode}
          booker={booker}
          isOwnerBooking={isOwnerBooking}
          onClose={() => {
              setIsWishDetailOpen(false);
              setSelectedWishId(null);
          }}
          onEdit={() => {
              setIsWishDetailOpen(false); // Close detail
              setIsWishEditorOpen(true); // Open editor
          }}
          onShare={() => { /* Todo */ }}
          onBook={(isAnonymous) => handleBookWish(isAnonymous)}
          onDelete={handleDeleteWish}
        />
      )}

      {isShareModalOpen && currentList && (
          <ShareModal
            list={currentList}
            lang={lang}
            friends={friends}
            onClose={() => setIsShareModalOpen(false)}
            onTogglePublic={(val) => {
                setLists(prev => prev.map(l => l.id === currentList.id ? { ...l, isPublic: val } : l));
            }}
            onUpdateSharedWith={(ids) => {
                setLists(prev => prev.map(l => l.id === currentList.id ? { ...l, sharedWith: ids } : l));
            }}
            onPreview={() => {
                setIsShareModalOpen(false);
                setIsPreviewMode(true);
                setView('list-detail');
            }}
            isReadOnly={!!selectedFriendId || isPreviewMode}
          />
      )}
    </div>
  );
};

export default App;
