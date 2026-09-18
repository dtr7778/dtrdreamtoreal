import { CronJobClass } from "@workspace/lib/server";

@CronJobClass({ scope: "Singleton" })
export class UserCronService {
  constructor() {}
}
