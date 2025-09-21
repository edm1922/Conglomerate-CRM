import { supabase } from "./supabase";

export async function sendSms(to: string, body: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-sms", {
    body: { to, body },
  });

  if (error) {
    throw new Error(`Error sending SMS: ${error.message}`);
  }
}
