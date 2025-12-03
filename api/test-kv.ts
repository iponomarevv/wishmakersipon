import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Check environment variables
    const envCheck = {
      KV_REST_API_URL: process.env.KV_REST_API_URL ? 'SET' : 'NOT SET',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET',
      REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
      KV_URL: process.env.KV_URL ? 'SET' : 'NOT SET',
    };

    // Try to write a test value
    const testKey = 'test:connection';
    const testValue = { test: true, timestamp: Date.now() };
    
    let writeSuccess = false;
    let readSuccess = false;
    let readValue = null;
    let errorMessage = null;

    try {
      await kv.set(testKey, testValue, { ex: 60 });
      writeSuccess = true;
      
      // Try to read it back
      readValue = await kv.get(testKey);
      readSuccess = readValue !== null;
    } catch (kvError: any) {
      errorMessage = kvError.message || String(kvError);
      console.error('KV test error:', kvError);
    }

    return res.status(200).json({
      success: writeSuccess && readSuccess,
      environment: envCheck,
      write: writeSuccess,
      read: readSuccess,
      readValue,
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




