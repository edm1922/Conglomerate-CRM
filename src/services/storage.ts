import { supabase } from "./supabase";

const BUCKET = "documents";

export async function uploadClientDocument(
  clientId: string,
  file: File
): Promise<{ filePath: string }>{
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const path = `${clientId}/${timestamp}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  return { filePath: path };
}

export async function listClientDocuments(clientId: string) {
  const { data, error } = await supabase.storage.from(BUCKET).list(clientId, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  return data;
}

export function getPublicUrl(filePath: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createSignedUrl(filePath: string, expiresInSeconds = 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}


