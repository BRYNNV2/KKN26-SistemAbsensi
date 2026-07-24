import { createClient } from '@supabase/supabase-js';

// Read env variables if available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for login attempt
export async function authenticateUser({ identifier, password, role }) {
  // If real Supabase keys are configured, use real auth
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.includes('@') ? identifier : `${identifier}@univ-kkn.ac.id`,
        password: password
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Gagal masuk. Periksa kembali kredensial Anda.' };
    }
  }

  // Demo Fallback Simulation Mode
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!identifier || !password) {
    return { success: false, error: 'Mohon isi semua kolom yang diperlukan.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Kata sandi minimal 6 karakter.' };
  }

  // Pre-configured mock user for demo presentation
  const mockUser = {
    id: role === 'mahasiswa' ? 'mhs-101' : 'dsn-202',
    name: role === 'mahasiswa' ? 'Budi Pratama' : 'Dr. Ir. Hendra Wijaya, M.T.',
    role: role,
    identifier: identifier,
    email: identifier.includes('@') ? identifier : `${identifier}@univ-kkn.ac.id`,
    kelompok: role === 'mahasiswa' ? 'KKN Desa Sukamaju (Kelompok 14)' : 'DPL Wilayah Kecamatan Sukaraja'
  };

  return { success: true, user: mockUser, isDemo: true };
}

// Helper function for registration attempt
export async function registerUser(formData) {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nama,
            role: formData.role,
            identifier: formData.identifier,
            kelompok: formData.kelompok
          }
        }
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Demo Fallback Simulation Mode
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { 
    success: true, 
    user: {
      id: 'new-user-' + Date.now(),
      name: formData.nama,
      role: formData.role,
      email: formData.email
    },
    isDemo: true 
  };
}

// Helper function for password reset request
export async function requestPasswordReset(email) {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Demo mode
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, isDemo: true };
}
