import app from "./app.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./services/auth.js";

async function bootstrap() {
  await ensureAdminUser();

  app.listen(env.port, () => {
    console.log(`API server running at http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
