import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, password, role } = req.body;

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

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
