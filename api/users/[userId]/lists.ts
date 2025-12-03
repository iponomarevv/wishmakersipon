import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get all lists shared with this user
      const userListsKey = `user_lists:${userId}`;
      const listIds = await kv.get<string[]>(userListsKey) || [];
      
      // Fetch all lists
      const lists = [];
      for (const listId of listIds) {
        const list = await kv.get(`private_list:${listId}`);
        if (list) {
          lists.push(list);
        }
      }

      return res.status(200).json(lists);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}





