import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: ["/api/auth/register", "/login"], // Add other public routes if needed

});
