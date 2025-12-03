import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Use SERVICE_ROLE_KEY for writes (bypasses RLS) and ANON_KEY for reads
const getSupabaseClient = (forWrite = false) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  
  // For writes, prefer SERVICE_ROLE_KEY (bypasses RLS)
  // For reads, use ANON_KEY (respects RLS)
  const supabaseKey = forWrite 
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    : (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (req.method === 'POST') {
      console.log('[POST /api/lists] Saving list...');
      // Create/update list (MVP: all lists are public)
      const listData = req.body;

      if (!listData || !listData.id) {
        console.log('[POST /api/lists] ❌ Invalid list data - missing ID');
        return res.status(400).json({ error: 'List data with ID is required' });
      }

      console.log(`[POST /api/lists] Saving list ID: ${listData.id}, name: ${listData.name || 'unnamed'}`);
      console.log(`[POST /api/lists] Full list data:`, JSON.stringify({
        id: listData.id,
        name: listData.name,
        itemsCount: listData.items?.length || 0,
        isPublic: listData.isPublic
      }));

      // MVP: All lists are public - always save as public
      const publicListData = { ...listData, isPublic: true };
      
      try {
        // Use SERVICE_ROLE_KEY for writes (bypasses RLS)
        const supabase = getSupabaseClient(true);
        
        console.log('[POST /api/lists] Using Supabase client for write operation');
        
        // Upsert (insert or update) the list
        const { data, error } = await supabase
          .from('public_lists')
          .upsert({
            id: publicListData.id,
            data: publicListData,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error('[POST /api/lists] Supabase error:', error);
          console.error('[POST /api/lists] Error code:', error.code);
          console.error('[POST /api/lists] Error message:', error.message);
          console.error('[POST /api/lists] Error details:', error.details);
          console.error('[POST /api/lists] Error hint:', error.hint);
          
          // Check for RLS/permission errors
          if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) {
            return res.status(503).json({ 
              error: 'Permission denied',
              message: 'Row Level Security (RLS) is blocking access. Please configure RLS policies in Supabase.',
              details: 'Run the SQL from SUPABASE_SETUP.md to allow public access'
            });
          }
          
          throw error;
        }

        console.log(`[POST /api/lists] ✅ List saved successfully to Supabase: ${listData.id}`);
        
        // Verify it was saved - try both keys to check RLS
        console.log('[POST /api/lists] Verifying list is readable...');
        
        // First try with SERVICE_ROLE_KEY (should always work)
        const verifyClient = getSupabaseClient(true);
        const { data: verifyData, error: verifyError } = await verifyClient
          .from('public_lists')
          .select('id, data')
          .eq('id', publicListData.id)
          .single();

        if (verifyError) {
          console.error('[POST /api/lists] ❌ CRITICAL: List saved but NOT readable even with SERVICE_ROLE_KEY!');
          console.error('[POST /api/lists] Verify error:', verifyError);
        } else if (verifyData) {
          console.log('[POST /api/lists] ✅ Verified with SERVICE_ROLE_KEY: list exists');
          
          // Now test with ANON_KEY (to check RLS)
          const readClient = getSupabaseClient(false);
          const { data: anonData, error: anonError } = await readClient
            .from('public_lists')
            .select('id, data')
            .eq('id', publicListData.id)
            .single();
          
          if (anonError) {
            console.warn('[POST /api/lists] ⚠️ WARNING: List NOT readable with ANON_KEY!');
            console.warn('[POST /api/lists] This means RLS policies are blocking access');
            console.warn('[POST /api/lists] Error:', anonError.message);
            console.warn('[POST /api/lists] Friend will NOT be able to open the list!');
            console.warn('[POST /api/lists] Solution: Run RLS policies SQL from SUPABASE_SETUP.md');
          } else if (anonData) {
            console.log('[POST /api/lists] ✅✅✅ Perfect: List is readable with ANON_KEY - friend can open it!');
          }
        }
      } catch (dbError: any) {
        console.error('[POST /api/lists] Database error:', dbError);
        console.error('[POST /api/lists] Error type:', dbError.constructor?.name);
        console.error('[POST /api/lists] Full error:', JSON.stringify(dbError, null, 2));
        
        if (dbError.message?.includes('Supabase not configured')) {
          return res.status(503).json({ 
            error: 'Storage not configured',
            message: 'Supabase is not configured. Please set up Supabase in project settings.',
            details: 'Go to Vercel Dashboard → Your Project → Storage → Add Supabase integration'
          });
        }
        
        // Return error details for debugging
        return res.status(500).json({ 
          error: 'Database error',
          message: dbError.message || 'Unknown error',
          code: dbError.code
        });
      }

      return res.status(200).json({ success: true, id: listData.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

