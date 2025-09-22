import { supabase } from "./supabase";
import type { Profile } from "@/types/entities";

export function onAuthStateChange(callback: (session: any) => void) {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return listener.subscription;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
  
  return data as Profile;
}

// Debug function to test RLS policies
export async function debugProfileAccess(): Promise<void> {
  try {
    console.log('=== DEBUG: Profile Access Test ===');
    
    // Test 1: Get current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.email);
    
    // Test 2: Try to get own profile
    if (user) {
      const { data: ownProfile, error: ownError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Own profile query:', { data: ownProfile, error: ownError });
    }
    
    // Test 3: Try to get all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('All profiles query:', { count: allProfiles?.length || 0, error: allError });
    
    // Test 4: Raw SQL query (if allowed)
    const { data: rawQuery, error: rawError } = await supabase
      .rpc('get_all_profiles_debug');
    
    console.log('Raw query result:', { data: rawQuery, error: rawError });
    
  } catch (error) {
    console.error('Debug test failed:', error);
  }
}

export async function listProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    
    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
    
    return data as Profile[];
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    throw error;
  }
}
