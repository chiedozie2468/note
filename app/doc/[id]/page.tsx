import Document from "@/components/Document";
import RoomProvider from "@/components/RoomProvider";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

console.log("DOCUMENT ID:", id);

  return (
    <RoomProvider roomId={id}>
      <div className="w-full min-h-screen p-6">
        <Document id={id} />
      </div>
    </RoomProvider>
  );
}
