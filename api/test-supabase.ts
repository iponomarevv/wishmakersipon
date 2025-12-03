import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Check environment variables
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    };

    let connectionSuccess = false;
    let tableExists = false;
    let writeSuccess = false;
    let readSuccess = false;
    let errorMessage = null;

    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase not configured');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      connectionSuccess = true;

      // Try to read from table (check if it exists)
      const { data: testData, error: testError } = await supabase
        .from('public_lists')
        .select('id')
        .limit(1);

      if (testError) {
        if (testError.code === '42P01') {
          errorMessage = 'Table "public_lists" does not exist. Please create it using the SQL from SUPABASE_SETUP.md';
        } else {
          errorMessage = testError.message;
        }
      } else {
        tableExists = true;
      }

      // Try to write a test value
      if (tableExists) {
        const testId = `test_${Date.now()}`;
        const testList = { id: testId, name: 'Test List', items: [], isPublic: true };
        
        const { error: writeError } = await supabase
          .from('public_lists')
          .upsert({
            id: testId,
            data: testList,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (writeError) {
          errorMessage = `Write error: ${writeError.message}`;
        } else {
          writeSuccess = true;

          // Try to read it back
          const { data: readData, error: readError } = await supabase
            .from('public_lists')
            .select('data')
            .eq('id', testId)
            .single();

          if (readError) {
            errorMessage = `Read error: ${readError.message}`;
          } else if (readData) {
            readSuccess = true;
            
            // Clean up test data
            await supabase.from('public_lists').delete().eq('id', testId);
          }
        }
      }
    } catch (error: any) {
      errorMessage = error.message || String(error);
    }

    return res.status(200).json({
      success: connectionSuccess && tableExists && writeSuccess && readSuccess,
      environment: envCheck,
      connection: connectionSuccess,
      tableExists,
      write: writeSuccess,
      read: readSuccess,
      error: errorMessage,
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || String(error),
    });
  }
}




