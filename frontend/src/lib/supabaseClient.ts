import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function signInLocal(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// 1. Simplified Signup (Step 1)
export async function signUpLocal(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Redirect to the setup page after they click the email link
      emailRedirectTo: `${import.meta.env.VITE_HOST_URL}/setup`
    }
  });
  console.log(error);
  return { data, error };
}

// 2. Avatar Upload (Step 2)
export async function uploadUserAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const url = supabase.storage.from('avatars').getPublicUrl(data.path);
  return url.data.publicUrl;
}

// 3. Profile Initialization (Step 2)
export async function initProfile(
  username: string,
  image?: string,
  accessToken?: string
) {
  let token = accessToken;

  if (!token) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error("No active session");
    token = session.access_token;
  }

  const response = await fetch("/api/init-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      username: username,
      avatar: image || null,
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to initialize profile");
  }

  return await response.json();
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.VITE_HOST_URL}/setup` // Redirect to setup after Google login too
    }
  });

  if (error) throw error;
}
