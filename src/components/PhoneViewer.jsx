'use client'

import { useRef, useCallback, useImperativeHandle, forwardRef, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center as DreiCenter } from '@react-three/drei'
import * as THREE from 'three'

function Model() {
  const { scene } = useGLTF('/models/iphone_17_pro_max.glb')

  const cloned = useRef()
  if (!cloned.current) {
    cloned.current = scene.clone()
  }

  return (
    <primitive object={cloned.current} />
  )
}

function CameraController({ cameraRef }) {
  const { camera } = useThree()

  useImperativeHandle(cameraRef, () => ({
    resetView() {
      camera.position.set(0, 0, 3.5)
      camera.lookAt(0, 0, 0)
    },
    setFront() {
      camera.position.set(0, 0, 3.5)
      camera.lookAt(0, 0, 0)
    },
    setBack() {
      camera.position.set(0, 0, -3.5)
      camera.lookAt(0, 0, 0)
    },
    setLeft() {
      camera.position.set(-3.5, 0, 0)
      camera.lookAt(0, 0, 0)
    },
    setRight() {
      camera.position.set(3.5, 0, 0)
      camera.lookAt(0, 0, 0)
    },
    setTop() {
      camera.position.set(0, 3.5, 0)
      camera.lookAt(0, 0, 0)
    },
    setBottom() {
      camera.position.set(0, -3.5, 0)
      camera.lookAt(0, 0, 0)
    },
  }))

  return null
}

const PhoneViewer = forwardRef(function PhoneViewer({ onCaptureReady }, ref) {
  const cameraRef = useRef()
  const glRef = useRef()

  useImperativeHandle(ref, () => ({
    resetView: () => cameraRef.current?.resetView(),
    setFront: () => cameraRef.current?.setFront(),
    setBack: () => cameraRef.current?.setBack(),
    setLeft: () => cameraRef.current?.setLeft(),
    setRight: () => cameraRef.current?.setRight(),
    setTop: () => cameraRef.current?.setTop(),
    setBottom: () => cameraRef.current?.setBottom(),
    capture() {
      const canvas = glRef.current
      if (!canvas) return null
      return canvas.toDataURL('image/png')
    },
  }))

  const handleCreated = useCallback(({ gl }) => {
    glRef.current = gl.domElement
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.2
  }, [])

  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [0, 0, 3.5], fov: 35 }}
      gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      onCreated={handleCreated}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} />
        <DreiCenter>
          <Model />
        </DreiCenter>
        <CameraController cameraRef={cameraRef} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={1.5}
          maxDistance={8}
          enablePan={false}
        />
      </Suspense>
    </Canvas>
  )
})

export default PhoneViewer
