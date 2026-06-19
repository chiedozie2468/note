import { NextRequest, NextResponse } from "next/server";
import {
  createRoomTask,
  deleteRoomTask,
  getRoomTasks,
  updateRoomTaskCompletion,
} from "@/actions/actions";

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  if (!roomId) {
    return new NextResponse("Missing roomId", { status: 400 });
  }

  const result = await getRoomTasks(roomId);
  return NextResponse.json(result, { status: result.success ? 200 : 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { roomId, title, dueAt, assigneeEmail, description } = body;
  if (!roomId || !title) {
    return new NextResponse("Missing required task fields", { status: 400 });
  }

  const result = await createRoomTask(
    roomId,
    title,
    dueAt ?? null,
    assigneeEmail,
    description ?? null,
  );
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { roomId, taskId, completed } = body;
  if (!roomId || !taskId || typeof completed !== "boolean") {
    return new NextResponse("Missing required update fields", { status: 400 });
  }

  const result = await updateRoomTaskCompletion(roomId, taskId, completed);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { roomId, taskId } = body;
  if (!roomId || !taskId) {
    return new NextResponse("Missing required delete fields", { status: 400 });
  }

  const result = await deleteRoomTask(roomId, taskId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
