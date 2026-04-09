import { notFound } from 'next/navigation'
import { getObjectById, getAllObjects } from '@/lib/data'
import { searchMetByArtist, searchMetByQuery } from '@/lib/met-api'
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

  const isUnknownArtist = object.artist.toLowerCase().includes('unknown')
  const relatedMet = isUnknownArtist
    ? await searchMetByQuery(object.medium || object.tags?.[0] || '', 6)
    : await searchMetByArtist(object.artist, 6)

  return (
    <>
      <NavBar />
      <ObjectDetail object={object} relatedMet={relatedMet} />
    </>
  )
}

export function generateStaticParams() {
  return getAllObjects().map((obj) => ({ id: obj.id }))
}
