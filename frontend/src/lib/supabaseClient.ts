import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
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
// This combines the upload logic we discussed with the database update
export async function uploadUserAvatar(userId: string, file: File) {
  // 1. Upload to Storage (The code we discussed previously)
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
      cacheControl: '3600'
    });

  if (uploadError) throw uploadError;

  // 2. Get the Public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName, {
      transform: {
        width: 150,
        height: 150,
        quality: 60,
        resize: 'cover',
      }
    });

  const publicUrl = urlData.publicUrl;

  // 3. Save the URL to the 'profiles' table
  const { error: dbError } = await supabase
    .from('profiles')
    .update({
      profile_picture: publicUrl,
      updated_at: new Date() // Good practice if you have this column
    })
    .eq('id', userId);

  if (dbError) throw dbError;

  // Return the URL with a timestamp to force the browser to refresh the image
  return `${publicUrl}?t=${Date.now()}`;
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
