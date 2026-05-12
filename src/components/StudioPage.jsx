'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ControlsPanel from '@/components/ControlsPanel'
import { CORNER_RADIUS, STUDIO_POSES, drawRoundedRect } from '@/lib/phone'

export default function StudioPage() {
  const mountRef = useRef(null)
  const screenRef = useRef(null)
  const modelGroupRef = useRef(null)
  const controlsRef = useRef(null)
  const cameraRef = useRef(null)

  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fileName, setFileName] = useState("")
  const [currentPoseName, setCurrentPoseName] = useState("Default Front")

  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const [rotZ, setRotZ] = useState(0)
  const [zoom, setZoom] = useState(6.5)

  const rotRefs = useRef({ x: 0, y: 0, z: 0 })

  const updateRotation = useCallback((axis, value) => {
    rotRefs.current[axis] = (value * Math.PI) / 180
    if (axis === 'x') setRotX(value)
    if (axis === 'y') setRotY(value)
    if (axis === 'z') setRotZ(value)
  }, [])

  const applyPoseAngles = useCallback((rotArray, poseLabel = "Custom") => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    updateRotation('x', rotArray[0])
    updateRotation('y', rotArray[1])
    updateRotation('z', rotArray[2])
    setCurrentPoseName(poseLabel)
  }, [updateRotation])

  const handleRandomPose = useCallback(() => {
    const availablePoses = STUDIO_POSES.filter(p => p.name !== currentPoseName)
    const randomIndex = Math.floor(Math.random() * availablePoses.length)
    const selected = availablePoses[randomIndex]
    applyPoseAngles(selected.rot, selected.name)
  }, [currentPoseName, applyPoseAngles])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6.5)
    cameraRef.current = camera

    scene.add(new THREE.AmbientLight(0xffffff, 1.8))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5)
    keyLight.position.set(5, 5, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x90b0ff, 1.5)
    fillLight.position.set(-5, -2, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 2)
    rimLight.position.set(0, 4, -4)
    scene.add(rimLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 3.5
    controls.maxDistance = 9
    controls.target.set(0, 0, 0)
    controlsRef.current = controls

    const pivotGroup = new THREE.Group()
    scene.add(pivotGroup)
    modelGroupRef.current = pivotGroup

    const loader = new GLTFLoader()
    loader.load('/models/iphone_14_pro.glb', (gltf) => {
      const model = gltf.scene

      const initialBBox = new THREE.Box3().setFromObject(model)
      const initialSize = new THREE.Vector3()
      initialBBox.getSize(initialSize)
      model.scale.setScalar(3 / initialSize.y)
      model.updateMatrixWorld(true)

      const scaledBBox = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      scaledBBox.getCenter(center)
      model.position.sub(center)
      model.updateMatrixWorld(true)

      pivotGroup.add(model)

      let screenMesh = null
      model.traverse((node) => {
        if (node.isMesh && node.material?.name === 'Screen') screenMesh = node
      })

      if (screenMesh) {
        screenMesh.geometry = screenMesh.geometry.clone()
        const sbox = new THREE.Box3().setFromObject(screenMesh)
        const ssize = new THREE.Vector3()
        sbox.getSize(ssize)

        const posAttr = screenMesh.geometry.attributes.position
        const uvArray = new Float32Array(posAttr.count * 2)
        const v = new THREE.Vector3()

        for (let i = 0; i < posAttr.count; i++) {
          v.fromBufferAttribute(posAttr, i)
          screenMesh.localToWorld(v)
          const uCoord = (v.x - sbox.min.x) / ssize.x
          const vCoord = (v.y - sbox.min.y) / ssize.y
          uvArray[i * 2] = Math.max(0, Math.min(1, uCoord))
          uvArray[i * 2 + 1] = Math.max(0, Math.min(1, vCoord))
        }
        screenMesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))

        const sorted = [ssize.x, ssize.y, ssize.z].sort((a, b) => b - a)
        const worldH = sorted[0]
        const worldW = sorted[1]

        const pw = 2048
        const ph = Math.round(pw * (worldH / worldW))
        const r = CORNER_RADIUS * pw

        const maskCvs = document.createElement('canvas')
        maskCvs.width = pw
        maskCvs.height = ph
        const maskCtx = maskCvs.getContext('2d')
        maskCtx.fillStyle = '#000'
        maskCtx.fillRect(0, 0, pw, ph)
        maskCtx.fillStyle = '#fff'
        drawRoundedRect(maskCtx, 0, 0, pw, ph, r)
        maskCtx.fill()
        const alphaTex = new THREE.CanvasTexture(maskCvs)
        alphaTex.flipY = true

        const imgCvs = document.createElement('canvas')
        imgCvs.width = pw
        imgCvs.height = ph
        const imgCtx = imgCvs.getContext('2d')
        imgCtx.fillStyle = '#0a0a0c'
        imgCtx.fillRect(0, 0, pw, ph)

        const imgTex = new THREE.CanvasTexture(imgCvs)
        imgTex.colorSpace = THREE.SRGBColorSpace
        imgTex.flipY = true
        imgTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
        imgTex.minFilter = THREE.LinearFilter
        imgTex.magFilter = THREE.LinearFilter
        imgTex.generateMipmaps = false

        screenMesh.material = new THREE.MeshBasicMaterial({
          map: imgTex,
          alphaMap: alphaTex,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        })

        screenRef.current = { imgCvs, imgCtx, imgTex, pw, ph, r }
      }

      setLoading(false)
    })

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      controls.update()

      if (pivotGroup) {
        pivotGroup.rotation.x = rotRefs.current.x
        pivotGroup.rotation.y = rotRefs.current.y
        pivotGroup.rotation.z = rotRefs.current.z
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    const resizeObserver = new ResizeObserver(() => onResize())
    resizeObserver.observe(mount)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file || !screenRef.current) return

    setFileName(file.name)
    const { imgCvs, imgCtx, imgTex, pw, ph, r } = screenRef.current
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      imgCtx.clearRect(0, 0, pw, ph)
      imgCtx.save()
      drawRoundedRect(imgCtx, 0, 0, pw, ph, r)
      imgCtx.clip()

      const imgAspect = img.width / img.height
      const cvAspect = pw / ph
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (imgAspect > cvAspect) {
        sw = img.height * cvAspect
        sx = (img.width - sw) / 2
      } else {
        sh = img.width / cvAspect
        sy = (img.height - sh) / 2
      }
      imgCtx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph)
      imgCtx.restore()

      imgTex.needsUpdate = true
      setUploaded(true)
      URL.revokeObjectURL(url)
    }

    img.src = url
  }, [])

  const handleDownload = useCallback(() => {
    const canvas = mountRef.current?.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = fileName ? `mockup-${fileName.split('.')[0]}.png` : 'phone-mockup.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [fileName])

  const handleAngleChange = (axis, value) => {
    updateRotation(axis, value)
    if (currentPoseName !== "Custom") setCurrentPoseName("Custom")
  }

  const stepAngle = (axis, delta, min, max) => {
    const current = axis === 'x' ? rotX : axis === 'y' ? rotY : rotZ
    const next = Math.max(min, Math.min(max, current + delta))
    handleAngleChange(axis, next)
  }

  const handleZoomChange = useCallback((value) => {
    setZoom(value)
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, value)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [])

  const handleZoomStep = useCallback((delta) => {
    setZoom(prev => {
      const next = Math.max(3.5, Math.min(9, prev + delta))
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 0, next)
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
      return next
    })
  }, [])

  const handleResetPose = () => {
    applyPoseAngles([0, 0, 0], "Default Front")
  }

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-background text-foreground overflow-hidden select-none">
      <div className="relative flex-1 h-[55%] md:h-full w-full flex items-center justify-center border-b md:border-b-0 md:border-r border-border/60 bg-dot-black/[0.08] dark:bg-dot-white/[0.04]">
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md z-10">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-muted-foreground tracking-wide">Initializing Studio Engine...</p>
          </div>
        )}

      </div>

      <ControlsPanel
        uploaded={uploaded}
        fileName={fileName}
        loading={loading}
        rotX={rotX}
        rotY={rotY}
        rotZ={rotZ}
        zoom={zoom}
        onImageUpload={handleImageUpload}
        onDownload={handleDownload}
        onResetPose={handleResetPose}
        onRandomPose={handleRandomPose}
        onAngleChange={handleAngleChange}
        onStepAngle={stepAngle}
        onZoomChange={handleZoomChange}
        onZoomStep={handleZoomStep}
      />
    </div>
  )
}
