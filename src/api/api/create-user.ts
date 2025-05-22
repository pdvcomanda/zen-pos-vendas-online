import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body || (await new Promise((resolve) => {
      let raw = '';
      req.on('data', chunk => raw += chunk);
      req.on('end', () => resolve(JSON.parse(raw)));
    }));

    const { name, email, password, role } = body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role }
    });

    if (error) throw error;

    await supabase.from('employees').insert([
      {
        id: data.user.id,
        name,
        email,
        role
      }
    ]);

    return res.status(200).json({ success: true, user: data.user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
