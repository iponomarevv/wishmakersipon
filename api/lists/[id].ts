import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// ALWAYS use SERVICE_ROLE_KEY for reads to bypass RLS (simpler and more reliable)
const getSupabaseClient = (forceServiceRole = false) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  
  // For GET requests, ALWAYS prefer SERVICE_ROLE_KEY to bypass RLS
  // This ensures friends can read lists even if RLS policies are not configured
  const supabaseKey = forceServiceRole 
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    : (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'List ID is required' });
  }

  try {
    if (req.method === 'GET') {
      console.log(`[GET /api/lists/${id}] Fetching list...`);
      
      // MVP: All lists are public - simplified logic
      let list;
      
      try {
        // CRITICAL: ALWAYS use SERVICE_ROLE_KEY for reads to bypass RLS
        // This ensures friends can read lists even if RLS policies are not configured
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || (!serviceKey && !anonKey)) {
          throw new Error('Supabase not configured');
        }
        
        // Prefer SERVICE_ROLE_KEY, fallback to ANON_KEY
        const readKey = serviceKey || anonKey!;
        const supabase = createClient(supabaseUrl, readKey);
        
        console.log(`[GET /api/lists/${id}] Querying Supabase for list ID: "${id}"`);
        console.log(`[GET /api/lists/${id}] Using key: ${serviceKey ? 'SERVICE_ROLE_KEY (bypasses RLS)' : 'ANON_KEY (may be blocked by RLS)'}`);
        
        const { data, error } = await supabase
          .from('public_lists')
          .select('data')
          .eq('id', id)
          .single();

        if (error) {
          console.error(`[GET /api/lists/${id}] Supabase error:`, error);
          console.error(`[GET /api/lists/${id}] Error code:`, error.code);
          console.error(`[GET /api/lists/${id}] Error message:`, error.message);
          
          if (error.code === 'PGRST116') {
            // Not found
            console.log(`[GET /api/lists/${id}] ❌ List not found in Supabase (PGRST116)`);
          } else if ((error.code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) && !serviceKey) {
            // Permission denied with ANON_KEY - try with SERVICE_ROLE_KEY if available
            if (serviceKey) {
              console.warn(`[GET /api/lists/${id}] ⚠️ ANON_KEY blocked by RLS, trying with SERVICE_ROLE_KEY...`);
              const serviceClient = createClient(supabaseUrl, serviceKey);
              const { data: serviceData, error: serviceError } = await serviceClient
                .from('public_lists')
                .select('data')
                .eq('id', id)
                .single();
              
              if (serviceError) {
                if (serviceError.code === 'PGRST116') {
                  console.log(`[GET /api/lists/${id}] ❌ List not found even with SERVICE_ROLE_KEY`);
                } else {
                  throw serviceError;
                }
              } else if (serviceData && serviceData.data) {
                list = serviceData.data;
                const listData = list as any;
                console.log(`[GET /api/lists/${id}] ✅ List found with SERVICE_ROLE_KEY:`, listData.name || 'unnamed');
              }
            } else {
              console.error(`[GET /api/lists/${id}] ❌ CRITICAL: RLS blocking access and no SERVICE_ROLE_KEY available!`);
              throw error;
            }
          } else {
            throw error;
          }
        } else if (data && data.data) {
          list = data.data;
          const listData = list as any;
          console.log(`[GET /api/lists/${id}] ✅ List found in Supabase:`, listData.name || 'unnamed');
        }
        
        // If list found, return it
        if (list) {
          const listData = list as any;
          console.log(`[GET /api/lists/${id}] ✅ List found:`, {
            id: listData.id,
            name: listData.name || 'unnamed',
            itemsCount: listData.items?.length || 0,
            isPublic: listData.isPublic
          });
          // Ensure it's marked as public for MVP
          const publicList = { ...listData, isPublic: true };
          return res.status(200).json(publicList);
        }
        
        console.log(`[GET /api/lists/${id}] ❌ List not found in Supabase`);
      } catch (dbError: any) {
        console.error(`[GET /api/lists/${id}] Database error:`, dbError);
        
        if (dbError.message?.includes('Supabase not configured')) {
          return res.status(404).json({ 
            error: 'List not found',
            message: 'Storage not configured. Please set up Supabase in project settings.'
          });
        }
        throw dbError;
      }
      
      // List not found
      console.log(`[GET /api/lists/${id}] ❌ Returning 404 - list not found`);
      return res.status(404).json({ error: 'List not found' });
    }

    if (req.method === 'PUT') {
      console.log(`[PUT /api/lists/${id}] Updating list...`);
      // Update list (MVP: all lists are public)
      const listData = req.body;

      if (!listData || !listData.id) {
        console.log(`[PUT /api/lists/${id}] ❌ Invalid list data`);
        return res.status(400).json({ error: 'List data with ID is required' });
      }

      const publicListData = { ...listData, isPublic: true };
      
      try {
        const supabase = getSupabaseClient();
        
        const { error } = await supabase
          .from('public_lists')
          .upsert({
            id: publicListData.id,
            data: publicListData,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error(`[PUT /api/lists/${id}] Supabase error:`, error);
          throw error;
        }

        console.log(`[PUT /api/lists/${id}] ✅ List updated successfully`);
        return res.status(200).json({ success: true });
      } catch (dbError: any) {
        console.error(`[PUT /api/lists/${id}] Database error:`, dbError);
        if (dbError.message?.includes('Supabase not configured')) {
          return res.status(503).json({ 
            error: 'Storage not configured',
            message: 'Supabase is not configured. Please set up Supabase in project settings.'
          });
        }
        throw dbError;
      }
    }

    if (req.method === 'DELETE') {
      try {
        const supabase = getSupabaseClient();
        
        const { error } = await supabase
          .from('public_lists')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`[DELETE /api/lists/${id}] Supabase error:`, error);
          throw error;
        }

        return res.status(200).json({ success: true });
      } catch (dbError: any) {
        console.error(`[DELETE /api/lists/${id}] Database error:`, dbError);
        throw dbError;
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

