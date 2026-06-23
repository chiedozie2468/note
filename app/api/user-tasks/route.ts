import { NextResponse } from "next/server";
import { getUserTasks } from "@/actions/actions";

export async function GET() {
  const result = await getUserTasks();
  return NextResponse.json(result);
}
