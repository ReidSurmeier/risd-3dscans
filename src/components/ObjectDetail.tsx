import Image from 'next/image'
import type { MuseumObject, MetObject } from '@/types'
import RelatedObjects from './RelatedObjects'
import ModelViewer from './ModelViewer'

interface ObjectDetailProps {
  object: MuseumObject
  relatedMet: MetObject[]
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-museum-muted/40">
      <span className="meta-label block mb-1">{label}</span>
      <span className="font-sans text-museum-cream text-sm">{value || 'Not available'}</span>
    </div>
  )
}

export default function ObjectDetail({ object, relatedMet }: ObjectDetailProps) {
  return (
    <main className="min-h-screen bg-museum-black text-museum-white pt-20">
      {/* Two-column layout */}
      <div className="px-6 md:px-12 py-12 md:grid md:grid-cols-2 md:gap-16">
        {/* Left: image (sticky) */}
        <div className="md:sticky md:top-24 mb-12 md:mb-0 self-start">
          <div className="relative w-full bg-museum-muted/10" style={{ aspectRatio: '4/3' }}>
            <Image
              src={object.imageUrl}
              alt={object.title}
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <p className="font-mono text-museum-gray text-xs mt-3 tracking-wide">
            {object.accessionNumber}
          </p>
        </div>

        {/* Right: metadata */}
        <div>
          <h1 className="font-serif text-4xl text-museum-white mb-8 leading-tight">
            {object.title}
          </h1>
          <div className="space-y-0">
            <MetaRow label="Artist" value={object.artist} />
            <MetaRow label="Date" value={object.date} />
            <MetaRow label="Medium" value={object.medium} />
            <MetaRow label="Dimensions" value={object.dimensions} />
            <MetaRow label="On View" value={object.onViewLocation} />
            {object.culture && <MetaRow label="Culture" value={object.culture} />}
          </div>
          <div className="mt-6">
            <a
              href={object.risdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-widest uppercase text-museum-accent hover:text-museum-white transition-colors"
            >
              View on RISD Museum &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Below fold: full-width editorial sections */}
      <div className="px-6 md:px-12 pb-24 max-w-4xl">
        {object.description && (
          <section className="mb-12">
            <hr className="section-divider" />
            <h2 className="meta-label mb-4">Description</h2>
            <p className="font-sans text-museum-cream text-base leading-relaxed">
              {object.description}
            </p>
          </section>
        )}

        {object.provenance && (
          <section className="mb-12">
            <hr className="section-divider" />
            <h2 className="meta-label mb-4">Provenance</h2>
            <p className="font-sans text-museum-cream text-base leading-relaxed">
              {object.provenance}
            </p>
          </section>
        )}

        {object.exhibitionHistory && object.exhibitionHistory.length > 0 && (
          <section className="mb-12">
            <hr className="section-divider" />
            <h2 className="meta-label mb-4">Exhibition History</h2>
            <ul className="space-y-2">
              {object.exhibitionHistory.map((entry, i) => (
                <li key={i} className="font-sans text-museum-cream text-sm leading-relaxed">
                  {entry}
                </li>
              ))}
            </ul>
          </section>
        )}

        {object.bibliography && object.bibliography.length > 0 && (
          <section className="mb-12">
            <hr className="section-divider" />
            <h2 className="meta-label mb-4">Bibliography</h2>
            <ul className="space-y-2">
              {object.bibliography.map((entry, i) => (
                <li key={i} className="font-sans text-museum-cream text-sm leading-relaxed">
                  {entry}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Related objects from Met */}
      <div className="px-6 md:px-12 pb-16">
        <RelatedObjects objects={relatedMet} sourceMuseum="met" />
      </div>

      {/* 3D model stub */}
      <div className="px-6 md:px-12 pb-24">
        <hr className="section-divider" />
        <h2 className="meta-label mb-6">3D Model</h2>
        <ModelViewer modelPath={object.modelPath} objectTitle={object.title} />
      </div>
    </main>
  )
}
