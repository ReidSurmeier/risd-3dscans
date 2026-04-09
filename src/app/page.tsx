import { getAllObjects } from '@/lib/data'
import NavBar from '@/components/NavBar'
import HeroText from '@/components/HeroText'
import ObjectGrid from '@/components/ObjectGrid'

export default function HomePage() {
  const objects = getAllObjects()

  return (
    <div className="min-h-screen bg-museum-black">
      <NavBar />
      <HeroText />
      <ObjectGrid objects={objects} />
    </div>
  )
}
