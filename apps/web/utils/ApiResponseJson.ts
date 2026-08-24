import { NextResponse } from "next/server";

export function ApiResponseJson<T>(
  success: boolean = true,
  message: string,
  data: T | undefined = undefined,
  status: number = 200
) {
  return NextResponse.json({ success, message, data }, { status });
}
