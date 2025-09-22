import { supabase } from "./supabase";
import type { Profile } from "@/types/entities";

// Environment configuration
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "edronmaguale635@gmail.com";

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

export function isAdminUser(email: string): boolean {
  return email === ADMIN_EMAIL;
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? isAdminUser(user.email || "") : false;
  } catch {
    return false;
  }
}

export async function listProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    
    if (error) {
      throw error;
    }
    
    return data as Profile[];
  } catch (error) {
    throw error;
  }
}
