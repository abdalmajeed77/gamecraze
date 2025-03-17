import { serve } from "inngest/next";
import { inngest } from "config/inngest";
import { syncUserCreation, syncUserDeletion, syncUserUpdate } from "config/inngest";

console.log("Inngest API route initialized"); // Log when the API route is initialized
// Create an API that serves user management functions

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdate
  ],
});
