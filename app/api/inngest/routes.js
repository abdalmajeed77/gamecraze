import { serve } from "inngest/next";
import { inngest } from "@/config/inngest/";
import { syncUserCreation, syncUserDeletion, syncUserUpdate } from "@/config/inngest";


// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdate
  ],
});
export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
      await step.sleep("wait-a-moment", "1s");
      return { message: `Hello ${event.data.email}!` };
    },
  );