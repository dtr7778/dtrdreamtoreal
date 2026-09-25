"use client";

import { formatError } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";

import { testMail } from "./testMail";

export default function HomePage() {
  return (
    <div>
      <Button
        onClick={async () => {
          try {
            const result = await testMail();
            console.log("result:", result);
          } catch (err) {
            console.log(formatError(err));
          }
        }}
      >
        Send Mail
      </Button>
    </div>
  );
}
