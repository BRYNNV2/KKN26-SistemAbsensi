import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jchxqbjjysjppcmycrjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_utuuP2yV8dWGtuwlGMc3Cw_e9mX8tmO';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminAccount() {
  const adminEmail = 'admin.kkn62@gmail.com';
  const adminPassword = 'Admin#KKN622026';

  console.log(`Membuat akun admin di Supabase (${adminEmail})...`);

  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        full_name: 'Administrator Utama KKN62',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('⚠️ Gagal membuat akun admin:', error.message);
  } else {
    console.log('✅ Akun Admin Berhasil Dibuat!');
    console.log('--------------------------------------------------');
    console.log(`Email    : ${adminEmail}`);
    console.log(`Password : ${adminPassword}`);
    console.log('--------------------------------------------------');
  }
}

createAdminAccount();
