'use client'

import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  OrthographicCamera,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'

export type ViewMode2D = 'top' | 'side'

interface Sala2DProps {
  scenarioUrl: string
  viewMode?: ViewMode2D
  onBounds?: (box: THREE.Box3) => void
}

function ModeloSala({ scenarioUrl, onBounds }: Sala2DProps) {
  const { scene } = useGLTF(scenarioUrl)

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    onBounds?.(box)
  }, [scene, onBounds])

  return <primitive object={scene} />
}

function AjustarCamera({
  bounds,
  viewMode,
}: {
  bounds: THREE.Box3 | null
  viewMode: ViewMode2D
}) {
  const { camera, gl } = useThree()

  useEffect(() => {
    if (!bounds || !(camera instanceof THREE.OrthographicCamera)) return

    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())

    const width = Math.max(size.x, 0.01)
    const height = Math.max(size.y, 0.01)
    const depth = Math.max(size.z, 0.01)

    const canvasWidth = Math.max(gl.domElement.clientWidth, 1)
    const canvasHeight = Math.max(gl.domElement.clientHeight, 1)

    const aspect = canvasWidth / canvasHeight

    const margin = 1.12

    if (viewMode === 'top') {
      // ============================================================
      // VISÃO SUPERIOR
      // ============================================================
      const visibleHeight = Math.max(
        depth * margin,
        (width * margin) / aspect
      )

      camera.position.set(
        center.x,
        center.y + Math.max(height, 1) + 10,
        center.z
      )

      camera.up.set(0, 0, -1)

      camera.lookAt(
        center.x,
        center.y,
        center.z
      )

      camera.left = (-visibleHeight * aspect) / 2
      camera.right = (visibleHeight * aspect) / 2
      camera.top = visibleHeight / 2
      camera.bottom = -visibleHeight / 2
    } else {
      // ============================================================
      // VISÃO LATERAL
      // ============================================================
      const visibleHeight = Math.max(
        height * margin,
        (width * margin) / aspect
      )

      const cameraY = center.y - height * 0.50

      camera.position.set(
        center.x,
        cameraY,
        center.z + Math.max(depth, 1) + 10
      )

      camera.up.set(0, 1, 0)

      camera.lookAt(
        center.x,
        center.y,
        center.z
      )
      
      const widthFactor = 1

      camera.left = (-visibleHeight * aspect * widthFactor) / 2
      camera.right = (visibleHeight * aspect * widthFactor) / 2

      const heightFactor = 0.95

      camera.top = visibleHeight * 0.60 * heightFactor
      camera.bottom = -visibleHeight * 0.40 * heightFactor
    }

    camera.near = 0.04
    camera.far = Math.max(
      1000,
      width + height + depth + 100
    )

    camera.zoom = 1

    camera.updateProjectionMatrix()
  }, [bounds, viewMode, camera, gl])

  return null
}

export default function Sala2D({
  scenarioUrl,
  viewMode = 'top',
  onBounds,
}: Sala2DProps) {
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null)

  const handleBounds = (box: THREE.Box3) => {
    setBounds(box)
    onBounds?.(box)
  }

  return (
    <Canvas
      key={`${scenarioUrl}-${viewMode}`}
      frameloop="demand"
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
      }}
      dpr={[1, 2]}
    >
      <OrthographicCamera
        makeDefault
        position={[0, 20, 0]}
        left={-10}
        right={10}
        top={10}
        bottom={-10}
        near={0.01}
        far={2000}
        zoom={1}
      />

      <AjustarCamera
        bounds={bounds}
        viewMode={viewMode}
      />

      <ambientLight intensity={1.8} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2.2}
      />

      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.8}
      />

      <ModeloSala
        scenarioUrl={scenarioUrl}
        onBounds={handleBounds}
      />

      <OrbitControls
        enableRotate={false}
        enablePan
        enableZoom
        minZoom={0.25}
        maxZoom={6}
        screenSpacePanning
      />
    </Canvas>
  )
}