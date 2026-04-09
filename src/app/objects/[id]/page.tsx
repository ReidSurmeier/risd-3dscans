// Object detail page — stub. frontend-developer specialist will implement.
export default function ObjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-museum-black text-museum-white">
      <div className="flex items-center justify-center h-screen">
        <p className="font-mono text-museum-gray text-sm tracking-widest uppercase">
          Object {params.id} — Building
        </p>
      </div>
    </main>
  )
}
