import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Escena
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcfe8ff)

// Càmera
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0, 2, 6)

// Renderitzador
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

// Il·luminació
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 1.5))
const sun = new THREE.DirectionalLight(0xffffff, 2)
sun.position.set(5, 10, 7)
scene.add(sun)

// Controls de rotació amb el ratolí
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Textures
const texLoader = new THREE.TextureLoader()
const loadTex = (file, srgb = false) => {
  const t = texLoader.load(`/textures/${file}`)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return t
}

// Fulles: textura amb transparència (alphaTest per retallar la forma de la fulla)
const leafMaterial = new THREE.MeshStandardMaterial({
  map: loadTex('branch05.png', true),
  normalMap: loadTex('branch05_normal.png'),
  roughnessMap: loadTex('branch05_roughness.png'),
  alphaTest: 0.5,
  side: THREE.DoubleSide,
})

// Escorça del tronc i les branques
const barkMaterial = new THREE.MeshStandardMaterial({
  map: loadTex('mossybark02.png', true),
  normalMap: loadTex('mossybark02_normal.png'),
  roughness: 0.9,
})

// Assigna el material segons el nom que ve de l'OBJ (usemtl)
const materialFor = (name = '') => (name.startsWith('branch') ? leafMaterial : barkMaterial)

// Carregador OBJ
new OBJLoader().load('/tree.obj', (tree) => {
  tree.traverse((o) => {
    if (!o.isMesh) return
    o.material = Array.isArray(o.material)
      ? o.material.map((m) => materialFor(m.name))
      : materialFor(o.material.name)
  })
  // Centra i escala el model perquè càpiga a la vista
  const box = new THREE.Box3().setFromObject(tree)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  tree.scale.setScalar(4 / Math.max(size.x, size.y, size.z))
  tree.position.sub(center.multiplyScalar(tree.scale.x))
  scene.add(tree)
})

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})
