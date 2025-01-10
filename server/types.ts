import type { User as DbUser } from "@db/schema";

declare global {
  namespace Express {
    // Extend the User interface with our database User type
    interface User extends DbUser {}
  }
}