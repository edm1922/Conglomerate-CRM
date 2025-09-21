import { supabase } from "./supabase";

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, body },
  });

  if (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
}
