import Document from "@/components/Document";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full min-h-screen flex ">
      <Document id={id} />
    </div>
  );
}
