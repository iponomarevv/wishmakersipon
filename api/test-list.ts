import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { listId } = req.query;

  if (!listId || typeof listId !== 'string') {
    return res.status(400).json({ error: 'List ID is required' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return res.status(500).json({ error: 'SUPABASE_URL not set' });
    }

    const results: any = {
      listId,
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
      serviceKey: serviceKey ? 'SET' : 'NOT SET',
      anonKey: anonKey ? 'SET' : 'NOT SET',
      tests: {},
    };

    // Test 1: Read with SERVICE_ROLE_KEY
    if (serviceKey) {
      try {
        const serviceClient = createClient(supabaseUrl, serviceKey);
        const { data, error } = await serviceClient
          .from('public_lists')
          .select('id, data')
          .eq('id', listId)
          .single();

        results.tests.serviceRoleKey = {
          success: !error && !!data,
          error: error ? error.message : null,
          found: !!data,
          listName: data?.data?.name || null,
        };
      } catch (e: any) {
        results.tests.serviceRoleKey = {
          success: false,
          error: e.message,
        };
      }
    } else {
      results.tests.serviceRoleKey = {
        success: false,
        error: 'SERVICE_ROLE_KEY not set',
      };
    }

    // Test 2: Read with ANON_KEY
    if (anonKey) {
      try {
        const anonClient = createClient(supabaseUrl, anonKey);
        const { data, error } = await anonClient
          .from('public_lists')
          .select('id, data')
          .eq('id', listId)
          .single();

        results.tests.anonKey = {
          success: !error && !!data,
          error: error ? error.message : null,
          found: !!data,
          listName: data?.data?.name || null,
        };
      } catch (e: any) {
        results.tests.anonKey = {
          success: false,
          error: e.message,
        };
      }
    } else {
      results.tests.anonKey = {
        success: false,
        error: 'ANON_KEY not set',
      };
    }

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
