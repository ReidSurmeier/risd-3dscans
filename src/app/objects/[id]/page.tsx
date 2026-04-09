import { notFound } from 'next/navigation'
import { getObjectById, getAllObjects } from '@/lib/data'
import { findRelatedObjects } from '@/lib/cross-reference'
import NavBar from '@/components/NavBar'
import ObjectDetail from '@/components/ObjectDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ObjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const object = getObjectById(id)

  if (!object) {
    notFound()
  }

  // Cross-reference across all connected museums
  const relatedObjects = await findRelatedObjects(object, { limit: 6 })

  return (
    <>
      <NavBar />
      <ObjectDetail object={object} relatedObjects={relatedObjects} />
    </>
  )
}

export function generateStaticParams() {
  return getAllObjects().map((obj) => ({ id: obj.id }))
}
