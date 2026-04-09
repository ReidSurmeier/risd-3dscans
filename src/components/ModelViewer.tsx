'use client'

// TODO: Replace this stub with a Three.js scene when models are available.
// TODO: Use next/dynamic to load Three.js (ssr: false) to avoid SSR issues.
// TODO: Set up OrbitControls, GLTFLoader, and load modelPath as a .glb scene.

interface ModelViewerProps {
  modelPath?: string
  objectTitle: string
}

export default function ModelViewer({ objectTitle }: ModelViewerProps) {
  return (
    <div className="w-full h-64 border border-museum-muted flex items-center justify-center bg-museum-black/50">
      <div className="text-center">
        <p className="font-mono text-museum-gray text-xs tracking-widest uppercase">
          3D Model Coming Soon
        </p>
        <p className="font-mono text-museum-muted text-xs mt-2 opacity-50">
          {objectTitle}
        </p>
      </div>
    </div>
  )
}
