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

  let body: any = req.body;

  // fallback para req.body vazio
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw);
    } catch (err) {
      return res.status(400).json({ error: 'Body inválido' });
    }
  }

  const { name, email, password, role } = body;

  try {
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
