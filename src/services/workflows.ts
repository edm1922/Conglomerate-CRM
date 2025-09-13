
import { supabase } from "./supabase";
import { createReminder } from "./reminders";
import { getLead } from "./leads";

// This is a simplified example. In a real-world scenario, 
// this would be a more robust system with configurable rules.
export async function runAutomatedFollowUp() {
  console.log("Running automated follow-up...");

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Get all leads that are still 'new' and were created more than 3 days ago
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, assigned_to")
    .eq("status", "new")
    .lt("created_at", threeDaysAgo);

  if (error) {
    console.error("Error fetching leads for follow-up:", error);
    return;
  }

  if (!leads || leads.length === 0) {
    console.log("No leads require automated follow-up.");
    return;
  }

  console.log(`Found ${leads.length} leads for follow-up.`);

  // For each lead, create a reminder for the assigned user
  for (const lead of leads) {
    if (lead.assigned_to) {
      try {
        await createReminder({
          lead_id: lead.id,
          user_id: lead.assigned_to,
          reminder_date: new Date().toISOString(),
          notes: `Automated follow-up reminder for new lead: ${lead.name}`,
        });
        console.log(`Created reminder for lead: ${lead.name}`);
      } catch (reminderError) {
        console.error(`Failed to create reminder for lead ${lead.id}:`, reminderError);
      }
    }
  }
}
