import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const COLORS = [0x5b8cff, 0xff7b5b, 0x5bcc8c, 0xf5c842, 0xc45bff, 0xff5baa]

// 純前端 3D 預覽：傳入 File 陣列，於瀏覽器解析 STL/OBJ 並渲染。
// 透過 onResult 回報每個檔案的尺寸（mm）給上層，不經過後端。
export default function ModelViewer({ files = [], onResult, height = 340 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const labelRef = useRef(null)
  const stateRef = useRef(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  // 初始化（僅一次）
  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8eaf0)

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000)
    camera.position.set(0, 0, 500)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    const labelRenderer = new CSS2DRenderer({ element: labelRef.current })

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const d1 = new THREE.DirectionalLight(0xffffff, 1.8); d1.position.set(5, 8, 5); scene.add(d1)
    const d2 = new THREE.DirectionalLight(0xffffff, 0.8); d2.position.set(-5, -3, -5); scene.add(d2)

    const st = { scene, camera, renderer, controls, labelRenderer, meshObjects: [], labelObjects: [], raf: 0 }
    stateRef.current = st

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      labelRenderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    function animate() {
      st.raf = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const onFs = () => resize()
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    resize()
    animate()

    return () => {
      cancelAnimationFrame(st.raf)
      ro.disconnect()
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
      st.meshObjects.forEach(o => { scene.remove(o); o.geometry?.dispose?.(); o.material?.dispose?.() })
      st.labelObjects.forEach(o => scene.remove(o))
      renderer.dispose()
      stateRef.current = null
    }
  }, [])

  // 檔案變更時重新載入（以 name|size 簽章避免無關 re-render 觸發）
  const sig = files.map(f => `${f.name}|${f.size}`).join(',')
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    let cancelled = false

    function clearScene() {
      st.meshObjects.forEach(o => { st.scene.remove(o); o.geometry?.dispose?.(); o.material?.dispose?.() })
      st.labelObjects.forEach(o => st.scene.remove(o))
      st.meshObjects = []; st.labelObjects = []
    }

    function addLabel(text, pos) {
      const el = document.createElement('div')
      el.textContent = text
      Object.assign(el.style, {
        background: 'rgba(255,255,255,.85)', border: '1px solid rgba(91,140,255,.5)',
        color: '#2a4aaa', font: '700 11px/1.2 -apple-system, monospace',
        padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap',
      })
      const obj = new CSS2DObject(el)
      obj.position.copy(pos)
      st.scene.add(obj)
      st.labelObjects.push(obj)
    }

    function addBBox(mesh) {
      const box = new THREE.Box3().setFromObject(mesh)
      const helper = new THREE.Box3Helper(box, new THREE.Color(0x2a4aaa))
      st.scene.add(helper); st.meshObjects.push(helper)
      const d = box.getSize(new THREE.Vector3())
      const { min, max } = box
      addLabel(`X: ${d.x.toFixed(1)}`, new THREE.Vector3((min.x + max.x) / 2, min.y, max.z))
      addLabel(`Y: ${d.y.toFixed(1)}`, new THREE.Vector3(max.x, (min.y + max.y) / 2, max.z))
      addLabel(`Z: ${d.z.toFixed(1)}`, new THREE.Vector3(max.x, min.y, (min.z + max.z) / 2))
    }

    function fitCamera() {
      if (!st.meshObjects.length) return
      const box = new THREE.Box3()
      st.meshObjects.forEach(o => box.expandByObject(o))
      const size = box.getSize(new THREE.Vector3()).length()
      const center = box.getCenter(new THREE.Vector3())
      st.camera.position.set(center.x, center.y + size * 0.2, center.z + size * 1.5)
      st.controls.target.copy(center)
      st.controls.minDistance = size * 0.05
      st.controls.maxDistance = size * 20
      st.controls.update()
    }

    ;(async () => {
      clearScene()
      const stl = new STLLoader()
      const objLoader = new OBJLoader()
      let offsetX = 0
      const results = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const ext = '.' + f.name.split('.').pop().toLowerCase()
        const id = `${f.name}|${f.size}`
        try {
          const buf = await f.arrayBuffer()
          if (cancelled) return
          let geo
          if (ext === '.stl') {
            geo = stl.parse(buf)
          } else if (ext === '.obj') {
            const parsed = objLoader.parse(new TextDecoder().decode(buf))
            const geos = []
            parsed.traverse(c => { if (c.isMesh) geos.push(c.geometry) })
            if (!geos.length) { results.push({ id, status: 'error' }); continue }
            geo = geos[0]
          } else {
            results.push({ id, status: 'unsupported' }); continue
          }
          geo.computeVertexNormals()
          geo.center()
          geo.computeBoundingBox()
          const sz = geo.boundingBox.getSize(new THREE.Vector3())
          results.push({ id, status: 'ok', dims: { x: +sz.x.toFixed(1), y: +sz.y.toFixed(1), z: +sz.z.toFixed(1) } })
          geo.translate(offsetX + sz.x / 2, 0, 0)
          offsetX += sz.x + 10
          const mat = new THREE.MeshPhongMaterial({ color: COLORS[i % COLORS.length], specular: 0xffffff, shininess: 60 })
          const mesh = new THREE.Mesh(geo, mat)
          st.scene.add(mesh); st.meshObjects.push(mesh)
          addBBox(mesh)
        } catch {
          results.push({ id, status: 'error' })
        }
      }
      if (cancelled) return
      fitCamera()
      onResultRef.current?.(results)
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  function toggleFullscreen() {
    const wrap = wrapRef.current
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (wrap.requestFullscreen || wrap.webkitRequestFullscreen)?.call(wrap)
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
    }
  }

  return (
    <div ref={wrapRef} className="relative rounded-lg overflow-hidden bg-[#e8eaf0]" style={{ height }}>
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
      <div ref={labelRef} className="absolute inset-0 pointer-events-none" />
      <button
        onClick={toggleFullscreen}
        title="全螢幕"
        className="absolute top-2 right-2 z-10 bg-white/70 hover:bg-white/95 text-zinc-700 rounded-md px-2 py-1 text-sm"
      >⛶</button>
      <div className="absolute bottom-2 right-3 text-[11px] text-black/30 pointer-events-none">拖動旋轉 · 滾輪縮放</div>
    </div>
  )
}
