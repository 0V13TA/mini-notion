import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function uploadUserAvatar(userId: string, file: File) {
  // Use a timestamp to avoid browser caching issues on update
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

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.VITE_HOST_URL}/auth/username`
    }
  });

  if (error) throw error;
}

export async function signUpLocal(email: string, password: string, username: string, file: File) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { data: null, error };

  // CRITICAL CHECK: If email confirmation is ON, data.session will be null.
  // We cannot proceed with profile creation until they log in.
  if (!data.session) {
    return {
      data: null,
      error: { message: "Please check your email to confirm your account before logging in." }
    };
  }

  try {
    // Pass the session token directly to ensure we are authenticated
    const avatarUrl = await uploadUserAvatar(data.user!.id, file);
    const profileData = await initProfile("local", username, avatarUrl, data.session.access_token);

    return { data: profileData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Added optional accessToken parameter to avoid refetching session
export async function initProfile(
  type: "local" | "oauth",
  username: string,
  image?: string,
  accessToken?: string
) {
  let token = accessToken;
  let avatarUrl = image;

  // Only fetch the session if we don't have a token (e.g., OAuth flow)
  if (!token) {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) throw new Error("No active session");

    token = session.access_token;

    // For OAuth, try to grab the avatar from metadata if not provided explicitly
    if (type === "oauth" && !avatarUrl) {
      avatarUrl = session.user?.user_metadata?.avatar_url || null;
    }
  }

  const response = await fetch("/api/init-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      username: username,
      avatar: avatarUrl || null,
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to initialize profile");
  }

  return await response.json();
}
