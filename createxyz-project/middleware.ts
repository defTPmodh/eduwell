import { withAuth } from "next-auth/middleware";

// Protect all routes except auth routes
export default withAuth({
  pages: {
    signIn: "/auth/signin",
  }
});

export const config = {
  matcher: ["/wellness-tools/:path*"]
}; 