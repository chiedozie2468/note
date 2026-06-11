import { auth } from "@clerk/nextjs/server";
import RoomProvider from "@/components/RoomProvider";

export default async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  console.log("========== DOC LAYOUT ==========");

  const { id } = await params;

  console.log("Layout ID:", id);

  try {
    await auth.protect();
    console.log("Auth Protect: SUCCESS");
  } catch (error) {
    console.error("Auth Protect: FAILED", error);
    throw error;
  }

  console.log("Rendering RoomProvider");

  return (
    <RoomProvider roomId={id}>
      {children}
    </RoomProvider>
  );
}