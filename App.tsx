
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WishList, WishItem, DEFAULT_GRADIENT, GRADIENTS, ViewState } from './types';
import WishListCard from './components/WishListCard';
import ListView from './components/ListView';
import WishEditorModal from './components/modals/WishEditorModal';
import ListEditorModal from './components/modals/ListEditorModal';
import WishDetailModal from './components/modals/WishDetailModal';
import ShareModal from './components/modals/ShareModal';
import { ArrowLeft, Globe } from 'lucide-react';
import { translations, Language } from './translations';
import { useTelegram } from './useTelegram';
import { saveList, getList, deletePublicList } from './apiClient';
import TelegramLogin from './components/TelegramLogin';

// --- Empty initial state ---
const initialUser = {
    id: "",
    name: "",
    handle: "",
    photo: null as string | null
};

const initialLists: WishList[] = [];

const STORAGE_PREFIX = 'wishmakers:lists';
const getListsStorageKey = (userId?: string | null) => `${STORAGE_PREFIX}:${userId ?? 'guest'}`;

const App: React.FC = () => {
  const { webApp, isTelegram, mainButton, backButton, cloudStorage } = useTelegram();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
      if (!webApp) {
          // Not in Telegram Mini App - check if user is authenticated via Web Login
          const savedUser = localStorage.getItem('wishmakers:user');
          if (savedUser) {
              try {
                  const user = JSON.parse(savedUser);
                  setCurrentUser({
                      id: user.id,
                      name: user.name,
                      handle: user.handle || '',
                      photo: user.photo || null
                  });
                  setIsAuthenticated(true);
                  if (user.language_code === 'ru' || user.language_code === 'en') {
                      setLang(user.language_code as Language);
                  }
              } catch (error) {
                  console.error('Error parsing saved user:', error);
              }
          }
          return;
      }
      
      // In Telegram Mini App
      const tgUser = webApp.initDataUnsafe?.user;
          if (tgUser) {
              setCurrentUser({
                  id: tgUser.id.toString(),
                  name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
                  handle: tgUser.username || '',
                  photo: tgUser.photo_url || null
              });
          setIsAuthenticated(true);
              
              if (tgUser.language_code === 'ru' || tgUser.language_code === 'en') {
                  setLang(tgUser.language_code as Language);
              }
          }
  }, [webApp]);

  // State
  const [lang, setLang] = useState<Language>('ru');
  const [lists, setLists] = useState<WishList[]>(initialLists);
  
  const [view, setView] = useState<ViewState>('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoadingSharedList, setIsLoadingSharedList] = useState(false);
  const [loadingSharedListId, setLoadingSharedListId] = useState<string | null>(null);
  const [loadingSharedListAttempt, setLoadingSharedListAttempt] = useState(0);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  // Modals
  const [isListEditorOpen, setIsListEditorOpen] = useState(false);
  const [isWishEditorOpen, setIsWishEditorOpen] = useState(false);
  const [isWishDetailOpen, setIsWishDetailOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const t = translations[lang];
  const listsStorageKey = useMemo(() => getListsStorageKey(currentUser?.id), [currentUser?.id]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [storageSource, setStorageSource] = useState<'cloud' | 'local'>('local');

  const loadListsFromLocal = useCallback(() => {
      if (!listsStorageKey || typeof window === 'undefined') return;
      const saved = window.localStorage.getItem(listsStorageKey);
      if (saved) {
          try {
              const parsed = JSON.parse(saved) as WishList[];
              setLists(parsed);
          } catch (error) {
              console.warn('Failed to parse wish lists from storage', error);
              setLists(initialLists);
          }
      } else {
          setLists(initialLists);
      }
      setStorageSource('local');
      setLoadedKey(listsStorageKey);
  }, [listsStorageKey]);

  useEffect(() => {
      if (!listsStorageKey) return;
      let isCancelled = false;

      if (cloudStorage && isTelegram) {
          cloudStorage.getItem(listsStorageKey, (error, value) => {
              if (isCancelled) return;
              if (error) {
                  console.warn('Cloud storage read failed, falling back to local', error);
                  loadListsFromLocal();
                  return;
              }

              if (value) {
                  try {
                      const parsed = JSON.parse(value) as WishList[];
                      setLists(parsed);
                  } catch (parseError) {
                      console.warn('Failed to parse cloud-stored wish lists, using defaults', parseError);
                      setLists(initialLists);
                  }
              } else {
                  setLists(initialLists);
              }

              setStorageSource('cloud');
              setLoadedKey(listsStorageKey);
          });

          return () => {
              isCancelled = true;
          };
      }

      loadListsFromLocal();

      return () => {
          isCancelled = true;
      };
  }, [listsStorageKey, cloudStorage, isTelegram, loadListsFromLocal]);

  useEffect(() => {
      if (!listsStorageKey || loadedKey !== listsStorageKey) return;
      
      try {
          const payload = JSON.stringify(lists);
          const payloadSize = new Blob([payload]).size;
          
          // Check payload size (Telegram Cloud Storage limit is ~64KB, localStorage is ~5-10MB)
          const maxSize = storageSource === 'cloud' ? 60 * 1024 : 5 * 1024 * 1024; // 60KB for cloud, 5MB for local
          
          if (payloadSize > maxSize) {
              console.warn(`Payload size (${payloadSize} bytes) exceeds limit (${maxSize} bytes). Some data may not be saved.`);
              // Try to save anyway, but warn user
          }

          // Save to local/cloud storage
          if (storageSource === 'cloud' && cloudStorage) {
              cloudStorage.setItem(listsStorageKey, payload, (error) => {
                  if (error) {
                      console.warn('Failed to write wish lists to cloud storage', error);
                  }
              });
          } else if (typeof window !== 'undefined') {
              try {
                  window.localStorage.setItem(listsStorageKey, payload);
              } catch (storageError: any) {
                  if (storageError.name === 'QuotaExceededError') {
                      console.error('LocalStorage quota exceeded. Consider removing old data.');
                      alert('Недостаточно места для сохранения. Попробуйте удалить старые списки.');
                  } else {
                      console.error('Error saving to localStorage:', storageError);
                  }
              }
          }

          // Save all lists (public and private) to backend
          lists.forEach(list => {
              saveList(list).then(result => {
                  if (!result.success) {
                      console.warn('Failed to save list to backend:', list.id);
                  }
              }).catch(err => {
                  console.warn('Error saving list to backend:', err);
              });
          });
      } catch (error) {
          console.error('Error in save effect:', error);
      }
  }, [lists, listsStorageKey, loadedKey, storageSource, cloudStorage]);

  // Handle Telegram startapp parameter and URL hash routing for shared lists
  useEffect(() => {
      if (!loadedKey) return;
      
      // Track if we're currently loading a list to prevent duplicate calls
      let isLoadingList = false;
      
      const loadAndShowList = async (listId: string, retryCount = 0) => {
          // Prevent duplicate calls
          if (isLoadingList && retryCount === 0) {
              console.log('⚠️ Already loading a list, skipping duplicate call');
              return false;
          }
          
          if (retryCount === 0) {
              isLoadingList = true;
          }
          console.log('🔍 Loading list:', listId, retryCount > 0 ? `(retry ${retryCount})` : '');
          
          // CRITICAL: If list is already open, don't do anything (prevent duplicate loading and errors)
          if (selectedListId === listId && view === 'list-detail') {
              console.log('✅ List is already open, skipping load');
              setIsLoadingSharedList(false);
              setLoadingSharedListId(null);
              setLoadingSharedListAttempt(0);
              return true; // Already open, no error
          }
          
          // Also check if list exists locally before doing anything
          const preCheckLocal = lists.find(l => l.id === listId);
          if (preCheckLocal && selectedListId === listId) {
              console.log('✅ List exists locally and is selected, skipping load');
              setIsLoadingSharedList(false);
              setLoadingSharedListId(null);
              setLoadingSharedListAttempt(0);
              return true; // Already have it, no error
          }
          
          // Show loading indicator
          if (retryCount === 0) {
              setIsLoadingSharedList(true);
              setLoadingSharedListId(listId);
              setLoadingSharedListAttempt(1);
          } else {
              setLoadingSharedListAttempt(retryCount + 1);
          }
          
          let foundList: WishList | null = null;
          let backendError: string | null = null;
          
          // First check local lists (only if user might own it)
          const localList = lists.find(l => l.id === listId) || null;
          if (localList) {
              console.log('✅ List found locally:', localList.name);
              foundList = localList;
          }
          
          // Always try to fetch from backend (for shared lists from other users)
          console.log('🌐 Fetching from backend for listId:', listId);
          console.log('🌐 Request URL will be: /api/lists/' + listId);
          
          try {
              const backendList = await getList(listId);
              
              if (backendList && backendList.id) {
                  // List found - use it
                  foundList = backendList;
                  console.log('✅✅✅ List loaded from backend!', backendList.name);
                  console.log('✅ List ID matches:', backendList.id === listId);
                  // Mark as successfully loaded
                  (window as any)[`__listLoaded_${listId}`] = true;
              } else {
                  console.warn('⚠️ List not found in backend (getList returned null)');
                  console.warn('⚠️ This means the list was not found in Supabase');
                  backendError = 'Список не найден на сервере';
              }
          } catch (error: any) {
              console.error('❌ Error loading from backend:', error?.message);
              console.error('❌ Error type:', error?.constructor?.name);
              console.error('❌ Full error:', error);
              backendError = error?.message || 'Ошибка подключения к серверу';
          }
          
          // If list found (locally or from backend), open it immediately
          if (foundList) {
              // Hide loading indicator immediately
              setIsLoadingSharedList(false);
              setLoadingSharedListId(null);
              setLoadingSharedListAttempt(0);
              
              console.log('✅ Opening list:', foundList.name);
              // Ensure list is public (for MVP all lists are public)
              if (!foundList.isPublic) {
                  foundList = { ...foundList, isPublic: true };
              }
              
              // Add to local state if not already there (so it appears in user's lists)
              setLists(prev => {
                  const exists = prev.find(l => l.id === listId);
                  if (exists) return prev;
                  return [...prev, foundList];
              });
              
              // Always open the list if found
              setSelectedListId(listId);
              setIsPreviewMode(true);
              setView('list-detail');
              
              // CRITICAL: Mark that list was successfully loaded - this prevents error from showing
              // Store in a way that persists across setTimeout calls
              (window as any)[`__listLoaded_${listId}`] = true;
              
              // List opened successfully - no error message needed
              return true; // Success - list opened, no error message
          }
          
          // List not found on backend - check if it exists locally (user's own list)
          // If it exists locally, open it without error
          const existingLocalList = lists.find(l => l.id === listId);
          if (existingLocalList) {
              console.log('✅ List found locally (user\'s own list), opening without backend check');
              setIsLoadingSharedList(false);
              setLoadingSharedListId(null);
              setLoadingSharedListAttempt(0);
              
              setSelectedListId(listId);
              setIsPreviewMode(true);
              setView('list-detail');
              return true; // List found locally, no error
          }
          
          // List not found anywhere - retry once (only for shared lists from other users)
          if (retryCount < 1) {
              const delay = 2000; // 2 seconds
              console.log(`⏳ List not found, retrying in ${delay}ms... (attempt ${retryCount + 1}/1)`);
              setLoadingSharedListAttempt(retryCount + 2);
              setTimeout(() => {
                  loadAndShowList(listId, retryCount + 1);
              }, delay);
              return false;
          }
          
          // Hide loading indicator after all retries failed
          setIsLoadingSharedList(false);
          setLoadingSharedListId(null);
          setLoadingSharedListAttempt(0);
          
          // CRITICAL: Check if list was successfully loaded earlier (BEFORE any other checks)
          const wasLoaded = (window as any)[`__listLoaded_${listId}`];
          if (wasLoaded) {
              console.log('✅✅✅ List was successfully loaded earlier, NO ERROR');
              delete (window as any)[`__listLoaded_${listId}`]; // Clean up
              return true; // NO ERROR - list was loaded
          }
          
          // Check if list exists locally or is already open
          const finalLocalCheck = lists.find(l => l.id === listId);
          const finalIsOpen = selectedListId === listId && view === 'list-detail';
          
          if (finalLocalCheck || finalIsOpen) {
              console.log('✅ List found or open in final check, NO ERROR');
              if (finalLocalCheck && !finalIsOpen) {
                  setSelectedListId(listId);
                  setIsPreviewMode(true);
                  setView('list-detail');
              }
              return true; // NO ERROR
          }
          
          // Final check with delay - maybe state updated
          setTimeout(() => {
              // Check if list was successfully loaded
              const wasLoadedDelayed = (window as any)[`__listLoaded_${listId}`];
              if (wasLoadedDelayed) {
                  console.log('✅✅✅ List was successfully loaded in delayed check, NO ERROR');
                  delete (window as any)[`__listLoaded_${listId}`];
                  return; // NO ERROR
              }
              
              // Check if list exists or is open
              const check1 = lists.find(l => l.id === listId);
              const check2 = selectedListId === listId && view === 'list-detail';
              
              if (check1 || check2) {
                  console.log('✅ List found or open in delayed check, NO ERROR');
                  if (check1 && !check2) {
                      setSelectedListId(listId);
                      setIsPreviewMode(true);
                      setView('list-detail');
                  }
                  return; // NO ERROR
              }
              
              // Check one more time
              const check3 = lists.find(l => l.id === listId);
              const check4 = selectedListId === listId && view === 'list-detail';
              
              if (check3 || check4) {
                  console.log('✅ List found or open in second delayed check, NO ERROR');
                  return; // NO ERROR
              }
              
              // ONLY show error if list is DEFINITELY not found after ALL checks
              console.error('❌ List truly not found after all checks:', listId);
              console.error('❌ This means the list was not saved to Supabase or RLS is blocking access');
              alert('Список не найден.\n\nПопроси создателя списка нажать "Поделиться" ещё раз.');
          }, 2000);
          
          return false;
      };
      
      // Check for Telegram startapp parameter
      const startParam = webApp?.initDataUnsafe?.start_param;
      if (startParam && startParam.startsWith('share_')) {
          let listId = startParam.replace('share_', '');
          // Clean up listId - remove any extra characters
          listId = listId.trim();
          console.log('🔗 Telegram startParam detected:', startParam, '→ listId:', listId, '(length:', listId.length + ')');
          if (listId) {
              // Check if list is already open before loading
              if (selectedListId === listId && view === 'list-detail') {
                  console.log('✅ List already open from startParam, skipping');
              } else {
                  loadAndShowList(listId);
              }
          } else {
              console.error('❌ Empty listId from startParam!');
          }
          return;
      }
      
      // Check for URL hash
      const hash = window.location.hash;
      const match = hash.match(/^#\/l\/(.+)$/);
      if (match) {
          let listId = match[1];
          // Decode URL encoding if present
          try {
              listId = decodeURIComponent(listId);
          } catch (e) {
              console.warn('Failed to decode listId:', e);
          }
          listId = listId.trim();
          console.log('🔗 URL hash detected:', hash, '→ listId:', listId);
          
          if (listId) {
              // CRITICAL: Check if list exists locally OR is already open FIRST
              const localListCheck = lists.find(l => l.id === listId);
              const isAlreadyOpen = selectedListId === listId && view === 'list-detail';
              
              if (localListCheck || isAlreadyOpen) {
                  console.log('✅ List found locally or already open from URL, opening immediately');
                  if (!isAlreadyOpen && localListCheck) {
                      setSelectedListId(listId);
                      setIsPreviewMode(true);
                      setView('list-detail');
                  }
                  window.history.replaceState(null, '', window.location.pathname);
                  return; // Don't call loadAndShowList - NO ERROR EVER
              }
              
              // Only call loadAndShowList if list is truly not found locally
              loadAndShowList(listId).then(() => {
                  window.history.replaceState(null, '', window.location.pathname);
              });
          } else {
              console.error('❌ Empty listId from URL hash!');
          }
      }
  }, [loadedKey, lists, webApp, t, currentUser.id, selectedListId, view]);


  // Derived Data
  const currentList = selectedListId 
    ? lists.find(l => l.id === selectedListId)
    : null;

  const currentWish = selectedWishId && currentList
    ? currentList.items.find(i => i.id === selectedWishId)
    : null;

  // Determine owner profile
  const listOwner = { name: currentUser.name, handle: currentUser.handle, photo: currentUser.photo };

  // Determine booker profile if wish is booked
  const booker = undefined;
  
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

  const handleOpenList = (listId: string) => {
    setSelectedListId(listId);
    setView('list-detail');
  };

  const handleCreateList = async (data: Partial<WishList>) => {
    if (selectedListId) {
        // Edit existing
        const updatedList = { ...lists.find(l => l.id === selectedListId)!, ...data } as WishList;
        setLists(prev => prev.map(l => l.id === selectedListId ? updatedList : l));
        
        // Save to backend (in background, don't block)
        console.log('Saving updated list to backend:', updatedList.id, updatedList.name);
        saveList(updatedList).then(result => {
            if (!result.success) {
                console.error('Failed to save updated list to backend');
            } else {
                console.log('Updated list saved successfully');
            }
        }).catch(err => {
            console.error('Error saving list to backend:', err);
        });
    } else {
        // Create new
        const newList: WishList = {
            id: `l${Date.now()}`,
            name: data.name!,
            items: [],
            gradient: data.gradient,
            bgImage: data.bgImage,
            isPublic: true, // Все списки публичные
            sharedWith: [],
            ...data
        };
        setLists(prev => [newList, ...prev]);
        setSelectedListId(newList.id);
        setView('list-detail');
        
        // Save to backend in background (don't block UI)
        // User can start using the list immediately
        console.log('💾 Saving new list to backend (async):', newList.id, newList.name);
        saveList(newList).then(result => {
            if (result.success) {
                console.log('✅ New list saved successfully to backend');
            } else {
                console.warn('⚠️ Failed to save new list to backend (will retry on share)');
                if (result.isKvError) {
                    console.warn('⚠️ Supabase not configured - list will only work locally');
                }
            }
        }).catch(err => {
            console.error('Error saving list to backend:', err);
        });
    }
    setIsListEditorOpen(false);
  };

  const handleSaveWish = async (data: Partial<WishItem>) => {
      if (!selectedListId) return;
      
      try {
          console.log('handleSaveWish called with data:', data);
          console.log('Image value length:', data.image?.length || 0);
          
          let updatedList: WishList | null = null;
      setLists(prev => prev.map(list => {
          if (list.id !== selectedListId) return list;
          
          if (selectedWishId) {
              // Edit
                  const updatedItem = { ...list.items.find(i => i.id === selectedWishId)!, ...data } as WishItem;
                  console.log('Updated item:', updatedItem);
                  updatedList = {
                  ...list,
                      items: list.items.map(i => i.id === selectedWishId ? updatedItem : i)
              };
                  return updatedList;
          } else {
                  // Create - ensure image is preserved from data
              const newWish: WishItem = {
                  id: `w${Date.now()}`,
                  title: data.title!,
                  link: data.link || '',
                  desc: data.desc || '',
                  price: data.price || '',
                      image: data.image || '', // Set default first
                      ...data, // Then spread data to ensure image from data is used if present
              } as WishItem;
                  console.log('New wish created:', newWish);
                  updatedList = { ...list, items: [newWish, ...list.items] };
                  return updatedList;
          }
      }));
          
          // Save to backend if list was updated
          if (updatedList) {
              console.log('Saving list to backend...');
              try {
                  const result = await saveList(updatedList);
                  if (result.success) {
                      console.log('List saved successfully');
                  } else {
                      console.warn('Failed to save list to backend');
                  }
              } catch (backendError) {
                  console.error('Error saving to backend:', backendError);
                  // Don't block UI if backend save fails
              }
          }
          
      setIsWishEditorOpen(false);
      setSelectedWishId(null);
      } catch (error) {
          console.error('Error in handleSaveWish:', error);
          alert('Ошибка при сохранении желания. Попробуйте еще раз.');
      }
  };

  const handleDeleteWish = async () => {
      if (!selectedListId || !selectedWishId) return;
      if (confirm(t.wishEditor.deleteConfirm)) {
          let updatedList: WishList | null = null;
          setLists(prev => prev.map(list => {
              if (list.id !== selectedListId) return list;
              updatedList = {
                  ...list,
                  items: list.items.filter(i => i.id !== selectedWishId)
              };
              return updatedList;
          }));
          
          // Save to backend if list was updated
          if (updatedList) {
              saveList(updatedList).then(result => {
                  if (!result.success) {
                      console.warn('Failed to save list to backend after delete');
                  }
              }).catch(err => {
                  console.error('Error saving list to backend:', err);
              });
          }
          
          setIsWishDetailOpen(false);
          setIsWishEditorOpen(false); // Close editor if open
          setSelectedWishId(null);
      }
  };

  const handleDeleteList = async (listId: string) => {
      if (confirm(t.app.deleteListConfirm)) {
          const listToDelete = lists.find(l => l.id === listId);
          // Delete from backend (both public and private)
          if (listToDelete) {
              await deletePublicList(listId);
          }
          setLists(prev => prev.filter(l => l.id !== listId));
          if (selectedListId === listId) {
              setSelectedListId(null);
              setView('home');
          }
      }
  };
  

  // Mock booking functionality
  const handleBookWish = async (isAnonymous: boolean = false) => {
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

      let updatedList: WishList | null = null;

      // Update my list data
            setLists(prev => prev.map(l => {
                  if (l.id === currentList.id) {
              updatedList = {
                          ...l,
                          items: l.items.map(toggleBooking)
              };
              return updatedList;
                  }
                  return l;
      }));
      
      // Save to backend if list was updated
      if (updatedList) {
          saveList(updatedList).then(result => {
              if (!result.success) {
                  console.warn('Failed to save list to backend after booking');
              }
          }).catch(err => {
              console.error('Error saving list to backend:', err);
          });
      }
  };

  // Direct sharing for preview/read-only mode
  const handleQuickShare = () => {
      if (!currentList) return;
      const shareLink = `https://wishmakers.ru/#/l/${currentList.id}`;
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

  const openListEditor = useCallback(() => {
      setSelectedListId(null);
      setIsListEditorOpen(true);
  }, []);

  const openWishEditor = useCallback(() => {
      setSelectedWishId(null);
      setIsWishEditorOpen(true);
  }, []);

  const handleBackNavigation = useCallback(() => {
      if (isWishEditorOpen) {
          setIsWishEditorOpen(false);
          setSelectedWishId(null);
          return;
      }
      if (isWishDetailOpen) {
          setIsWishDetailOpen(false);
          setSelectedWishId(null);
          return;
      }
      if (isListEditorOpen) {
          setIsListEditorOpen(false);
          return;
      }
      if (isShareModalOpen) {
          setIsShareModalOpen(false);
          return;
      }
      if (view === 'list-detail') {
          if (isPreviewMode) {
              setIsPreviewMode(false);
          }
          setSelectedListId(null);
          setView('home');
          return;
      }
  }, [isWishEditorOpen, isWishDetailOpen, isListEditorOpen, isShareModalOpen, view, isPreviewMode]);

  useEffect(() => {
      if (!backButton) return;
      const shouldShow = view !== 'home' || isWishEditorOpen || isWishDetailOpen || isListEditorOpen || isShareModalOpen;
      if (!shouldShow) {
          backButton.hide();
          return;
      }
      backButton.show();
      backButton.offClick(handleBackNavigation);
      backButton.onClick(handleBackNavigation);
      return () => {
          backButton.offClick(handleBackNavigation);
      };
  }, [backButton, view, isWishEditorOpen, isWishDetailOpen, isListEditorOpen, isShareModalOpen, handleBackNavigation]);

  useEffect(() => {
      if (!mainButton) return;
      mainButton.hide();
      mainButton.offClick(openListEditor);
      mainButton.offClick(openWishEditor);
  }, [mainButton, openListEditor, openWishEditor]);

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
                <div className="text-[20px] font-bold text-white">{currentUser.name || t.app.loading}</div>
            </div>
        </div>

        {/* Add Button */}
        <button
          onClick={openListEditor}
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


  // Show login screen if not authenticated and not in Telegram
  if (!isAuthenticated && !isTelegram) {
    return (
          <TelegramLogin
              botName="Wishmakers_bot"
              lang={lang}
              onAuth={(user) => {
                  setCurrentUser({
                      id: user.id,
                      name: `${user.first_name} ${user.last_name || ''}`.trim(),
                      handle: user.username || '',
                      photo: user.photo_url || null
                  });
                  setIsAuthenticated(true);
                  
                  // Save user to localStorage
                  localStorage.setItem('wishmakers:user', JSON.stringify({
                      id: user.id,
                      name: `${user.first_name} ${user.last_name || ''}`.trim(),
                      handle: user.username || '',
                      photo: user.photo_url || null,
                      language_code: user.language_code
                  }));
                  
                  if (user.language_code === 'ru' || user.language_code === 'en') {
                      setLang(user.language_code as Language);
                  }
              }}
          />
      );
  }

  return (
    <div className="text-white font-sans">
      
      {/* Loading indicator for shared lists */}
      {isLoadingSharedList && (
          <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              gap: '20px',
              padding: '20px',
              textAlign: 'center'
          }}>
              <div style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid rgba(135, 116, 225, 0.3)',
                  borderTop: '4px solid #8774e1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                  Сохранение списка...
              </div>
              {loadingSharedListAttempt > 1 && (
                  <div style={{ fontSize: '14px', color: '#aaaaaa' }}>
                      Попытка {loadingSharedListAttempt} из 3
                  </div>
              )}
          </div>
      )}
      
      {view === 'home' && renderHome()}
      
      {view === 'list-detail' && currentList && (
        <ListView
          list={currentList}
          listOwner={listOwner}
          lang={lang}
          isReadOnly={isPreviewMode}
          onClose={() => {
              if (isPreviewMode) {
                  // In preview mode (friend viewing shared list), close the app
                  if (window.Telegram?.WebApp?.close) {
                      window.Telegram.WebApp.close();
                  } else {
                      // Fallback: go to home
                  setIsPreviewMode(false);
                      setView('home');
                      setSelectedListId(null);
              }
              } else {
                  // In normal mode (own list), go to home
                  setView('home');
              setSelectedListId(null);
              }
          }}
          onEditList={() => setIsListEditorOpen(true)}
          onShareList={() => {
              if (isPreviewMode) {
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
          list={selectedListId ? currentList! : undefined}
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
          isReadOnly={isPreviewMode}
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
            friends={[]}
            onClose={() => setIsShareModalOpen(false)}
            onTogglePublic={async (val) => {
                // MVP: All lists are public, ignore this
            }}
            onUpdateSharedWith={async (ids) => {
                // MVP: All lists are public, ignore this
            }}
            onPreview={() => {
                setIsShareModalOpen(false);
                setIsPreviewMode(true);
                setView('list-detail');
            }}
            isReadOnly={isPreviewMode}
            onSaveBeforeShare={async () => {
                // Save list to backend before sharing (CRITICAL - must succeed for sharing to work)
                console.log('💾 Saving list before share:', currentList.id, currentList.name);
                
                // Show loading state
                setIsLoadingSharedList(true);
                setLoadingSharedListId(currentList.id);
                setLoadingSharedListAttempt(1);
                
                try {
                    // Try saving with retries
                    let result = await saveList(currentList);
                    let attempts = 1;
                    const maxAttempts = 3;
                    
                    while (!result.success && attempts < maxAttempts) {
                        console.warn(`⚠️ Save attempt ${attempts} failed, retrying...`);
                        setLoadingSharedListAttempt(attempts + 1);
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                        result = await saveList(currentList);
                        attempts++;
                    }
                    
                    // Supabase has strong consistency - list is immediately available after save
                    if (result.success) {
                        console.log('✅✅✅ List saved to Supabase - ready to share immediately!');
                        // Small delay to ensure database write is complete
                        await new Promise(resolve => setTimeout(resolve, 800));
                        
                        // CRITICAL: Verify that list is readable (friend needs to be able to read it)
                        let verified = false;
                        let verificationAttempts = 0;
                        const maxVerificationAttempts = 3;
                        
                        while (!verified && verificationAttempts < maxVerificationAttempts) {
                            try {
                                const verifyList = await getList(currentList.id);
                                if (verifyList && verifyList.id === currentList.id) {
                                    console.log(`✅✅✅ Verification attempt ${verificationAttempts + 1}: List is readable on server!`);
                                    verified = true;
                                } else {
                                    console.warn(`⚠️ Verification attempt ${verificationAttempts + 1}: List saved but not readable`);
                                    verificationAttempts++;
                                    if (verificationAttempts < maxVerificationAttempts) {
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }
                            } catch (verifyError) {
                                console.warn(`⚠️ Verification attempt ${verificationAttempts + 1} failed:`, verifyError);
                                verificationAttempts++;
                                if (verificationAttempts < maxVerificationAttempts) {
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                }
                            }
                        }
                        
                        if (!verified) {
                            console.error('❌ CRITICAL: List saved but NOT readable after verification attempts!');
                            console.error('❌ Friend will NOT be able to open the list!');
                            console.error('❌ Check RLS policies in Supabase!');
                        }
                    }
                    
                    // Hide loading state ALWAYS (even if save failed)
                    setIsLoadingSharedList(false);
                    setLoadingSharedListId(null);
                    setLoadingSharedListAttempt(0);
                    
                    if (!result.success) {
                        console.error('❌ Failed to save list after', maxAttempts, 'attempts');
                        if (result.isKvError) {
                            alert('⚠️ Supabase не настроен!\n\nСписок не будет доступен другим пользователям.\n\nДля настройки:\n1. Vercel Dashboard → Storage → Supabase\n2. Создай таблицу (см. SUPABASE_SETUP.md)\n3. Перезапусти деплой');
                        } else {
                            alert('⚠️ Не удалось сохранить список на сервер.\n\nПроверь подключение к интернету и попробуй снова.');
                        }
                        // Still allow sharing, but warn user
                        return true;
                    }
                    
                    console.log('✅ List saved successfully before share');
                    return true;
                } catch (error) {
                    console.error('❌ Error saving before share:', error);
                    setIsLoadingSharedList(false);
                    setLoadingSharedListId(null);
                    setLoadingSharedListAttempt(0);
                    alert('Ошибка при сохранении списка. Попробуй снова.');
                    return false; // Block sharing if save completely fails
                }
            }}
          />
      )}
    </div>
  );
};

export default App;
