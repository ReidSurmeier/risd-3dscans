export default function HeroText() {
  const words = ['RISD', 'Museum', '3D', 'Scans', 'Collection']

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="mb-8">
        {words.map((word) => (
          <span
            key={word}
            className="hero-word text-7xl md:text-8xl lg:text-9xl"
          >
            {word}
          </span>
        ))}
      </div>
      <hr className="section-divider" />
      <p className="font-mono text-sm text-museum-gray tracking-wide mt-6">
        Providence, Rhode Island — RISD Museum
      </p>
    </div>
  )
}
