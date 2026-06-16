import { auth } from "@clerk/nextjs/server";
import RoomProvider from "@/components/RoomProvider";

export default async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  console.log("================================");
  console.log("DOC LAYOUT START");

  let id: string;

  try {
    const paramsResult = await params;
    id = paramsResult.id;
    console.log("Document ID:", id);

    console.log("Running auth.protect()...");
    await auth.protect();
    console.log("AUTH PASSED");
  } catch (error) {
    console.error("DOC LAYOUT ERROR:", error);

    return (
      <div className="p-10">
        <h1>Doc Layout Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  console.log("Rendering RoomProvider...");

  return (
    <RoomProvider roomId={id}>
      {children}
    </RoomProvider>
  );
}