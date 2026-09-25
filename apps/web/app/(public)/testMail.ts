"use server";

import { bullmqMail } from "@/lib/mail/bullmq-mail";

export async function testMail() {
  return bullmqMail.send({
    template: "welcome",
    to: "user@mail.com",
    data: {
      dashboardUrl: "http://localhost:3000",
      userName: "Saiful Islam",
    },
  });
}
