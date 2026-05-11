'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const CORNER_RADIUS = 0.06

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function Home() {
  const mountRef = useRef(null)
  const screenRef = useRef(null)
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mount = mountRef.current

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    scene.add(new THREE.AmbientLight(0xffffff, 2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1)
    fillLight.position.set(-5, 2, 3)
    scene.add(fillLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.target.set(0, 0, 0)

    const loader = new GLTFLoader()
    loader.load('/models/iphone_17_pro_max.glb', (gltf) => {
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

      scene.add(model)

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
        imgCtx.fillStyle = '#000'
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
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file || !screenRef.current) return

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

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <label className="cursor-pointer">
          <div className="bg-primary text-primary-foreground text-sm font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg">
            {uploaded ? 'Change wallpaper' : 'Add wallpaper'}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        <p className="text-xs text-muted-foreground">Drag to rotate · Scroll to zoom</p>
      </div>
    </div>
  )
}