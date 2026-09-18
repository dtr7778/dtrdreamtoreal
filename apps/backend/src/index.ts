import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import { config } from "dotenv";

import { container } from "./container/di-container";
import { env } from "./env";
import { UserController } from "./modules/user/User.controller";
import { UserCronService } from "./modules/user/UserCron.service";
import { Server } from "./server";

config({
  path: [join(process.cwd(), ".env")],
});

async function main() {
  try {
    console.clear();
    console.log("Server is starting....");

    new Server(container, [UserController], [UserCronService]).listen(
      env.BACKEND_PORT
    );
  } catch (err) {
    console.error("Server is crashed:", err);
  }
}

main().catch(() => {
  process.exit(1);
});
