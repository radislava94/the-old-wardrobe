import { config } from "dotenv";

// Next.js loads these on its own. Scripts (migrate, seed) do not.
config({ path: ".env" });
config({ path: ".env.local", override: true });
