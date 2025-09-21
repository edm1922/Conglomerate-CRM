import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { to, body } = await req.json();

  // In a real application, you would use an SMS sending service like Twilio.
  // For this example, we'll just log the SMS to the console.
  console.log(`Sending SMS to: ${to}`);
  console.log(`Body: ${body}`);

  // Replace this with your actual SMS sending logic
  const smsProviderUrl = "https://api.smsprovider.com/v1/send";
  const apiKey = Deno.env.get("SMS_PROVIDER_API_KEY");

  try {
    // const response = await fetch(smsProviderUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({ to, body }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Failed to send SMS: ${response.statusText}`);
    // }

    return new Response(JSON.stringify({ message: "SMS sent successfully" }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
