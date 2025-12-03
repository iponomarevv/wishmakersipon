import { WishList } from './types';

const API_BASE = '/api/lists';

export const saveList = async (list: WishList): Promise<{ success: boolean; isKvError?: boolean }> => {
  try {
    console.log(`[apiClient] 💾 Saving list to backend: ID=${list.id}, name=${list.name}, isPublic=${list.isPublic}`);
    
    // Validate list structure before saving
    if (!list.id) {
      console.error('[apiClient] ❌ Cannot save list: missing ID');
      return { success: false };
    }
    
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list),
    });

    console.log(`[apiClient] 📡 Save response status: ${response.status} for list ${list.id}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[apiClient] ❌ Failed to save list ${list.id}:`, response.status, errorText);
      
      // Check if it's a KV configuration error
      let isKvError = false;
      if (response.status === 503) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.includes('Vercel KV') || errorData.error === 'Storage not configured') {
            isKvError = true;
          }
        } catch (e) {
          // Not JSON, but 503 usually means KV not configured
          if (errorText.includes('KV') || errorText.includes('Storage')) {
            isKvError = true;
          }
        }
      }
      
      return { success: false, isKvError };
    }

    const result = await response.json();
    console.log(`[apiClient] ✅ List ${list.id} saved successfully:`, result);
    return { success: true };
  } catch (error: any) {
    console.error(`[apiClient] ❌ Network error saving list ${list.id}:`, error);
    console.error('Error details:', error?.message, error?.stack);
    return { success: false };
  }
};

export const savePublicList = async (list: WishList): Promise<boolean> => {
  if (!list.isPublic) return false;
  return saveList(list);
};

export const getList = async (listId: string, userId?: string): Promise<WishList | null> => {
  try {
    // MVP: All lists are public - try without userId first
    const url = `${API_BASE}/${listId}`;
    console.log(`[apiClient] 🌐 Fetching list ${listId} from:`, url);
    console.log(`[apiClient] 📋 Requested listId: "${listId}" (length: ${listId.length})`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[apiClient] 📡 Response status: ${response.status} for list ${listId}`);
    console.log(`[apiClient] 📡 Response URL: ${response.url}`);

    if (!response.ok) {
      if (response.status === 404) {
        const errorText = await response.text().catch(() => '');
        console.log(`[apiClient] ❌ List ${listId} not found (404)`, errorText);
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.includes('Storage not configured') || errorData.message?.includes('Vercel KV')) {
            console.warn(`[apiClient] ⚠️ Vercel KV not configured for list ${listId}`);
            // Return special marker to indicate KV issue
            return null; // Will be handled by error message
          }
        } catch (e) {
          // Not JSON, just 404
        }
        return null;
      }
      if (response.status === 503) {
        const errorData = await response.json().catch(() => ({ error: 'Storage not configured' }));
        console.warn(`[apiClient] ⚠️ Backend storage not configured (503) for list ${listId}:`, errorData);
        return null;
      }
      // Try to get error message
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[apiClient] ❌ Error response ${response.status} for list ${listId}:`, errorText);
      return null;
    }

    const list = await response.json();
    console.log(`[apiClient] ✅ List loaded: ${list.name || 'unnamed'} (ID: ${list.id}, isPublic: ${list.isPublic})`);
    
    // Validate list structure
    if (!list.id || !list.name) {
      console.error(`[apiClient] ❌ Invalid list structure:`, list);
      return null;
    }
    
    return list as WishList;
  } catch (error: any) {
    console.error(`[apiClient] ❌ Network error getting list ${listId}:`, error);
    console.error('Error details:', error?.message, error?.stack);
    return null;
  }
};

export const getPublicList = async (listId: string): Promise<WishList | null> => {
  return getList(listId);
};

export const getUserSharedLists = async (userId: string): Promise<WishList[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/lists`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Failed to get user shared lists:', await response.text());
      return [];
    }

    const lists = await response.json();
    return lists as WishList[];
  } catch (error) {
    console.error('Error getting user shared lists:', error);
    return [];
  }
};

export const updatePublicList = async (list: WishList): Promise<boolean> => {
  if (!list.isPublic) return false;

  try {
    const response = await fetch(`${API_BASE}/${list.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list),
    });

    if (!response.ok) {
      console.error('Failed to update public list:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating public list:', error);
    return false;
  }
};

export const deletePublicList = async (listId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${listId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to delete public list:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting public list:', error);
    return false;
  }
};

