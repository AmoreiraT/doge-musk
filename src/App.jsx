import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Canvas, useFrame, useLoader, extend, useThree } from 'react-three-fiber';
import React, { Suspense, useMemo, useCallback, useRef } from 'react';
import './App.css';
import circleImg from './assets/dogeCoin.png';
extend({ OrbitControls })

function CameraControls() {

  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controlsRef = useRef();
  useFrame(() => controlsRef.current.update())

  return (
    <orbitControls
      ref={controlsRef}
      enablePan
      args={[camera, domElement]}
    // autoRotate
    // autoRotateSpeed={-0.2}
    />
  );
}

function Dots() {
  const ref = useRef()
  const imgTex = useLoader(THREE.TextureLoader, circleImg);

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // Precompute randomized initial positions
    const positions = [...Array(500000)].map((_, i) => {
      const position = new THREE.Vector3()
      // Place in a grid
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 505

      // Offset every other column (hexagonal pattern)
      // position.y += (i % 2) * 0.5

      // Add some noise
      position.x += Math.random() * 0.2
      position.y += Math.random() * 0.5
      return position
    })

    // Precompute initial distances with octagonal offset
    const right = new THREE.Vector3(3, 0, 0)
    const distances = positions.map((pos) => {
      return pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5
    })
    return { vec, transform, positions, distances }
  }, [])
  useFrame(({ clock }) => {
    for (let i = 0; i < 50000; ++i) {
      const dist = distances[i]

      // Distance affects the wave phase
      const t = clock.elapsedTime - dist / 15

      // Oscillates between -0.4 and +0.4
      const wave = roundedSquareWave(t, 0.15 + (0.5 * dist) / 80, 0.8, 1 / 4.0)

      // Scale initial position by our oscillator
      vec.copy(positions[i]).multiplyScalar(wave + 2.0)

      // Apply the Vector3 to a Matrix4
      transform.setPosition(vec)

      // Update Matrix4 for this instance
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh
      ref={ref}
      args={[null, null, 50000]}
    >
      {/* //doge size */}
      <circleBufferGeometry args={[1.80, 50, 8]}

      />

      <meshBasicMaterial
        map={imgTex}
        isMaterial
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
        color={0xFFD700}
      />
    </instancedMesh>
  )
}


const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}






function App() {
  return (
    <div className="anim">
      <Canvas
        camera={{ position: [300, 0, 360], fov: 55, zoom: 4, far: 1000 }}
        orthographic
      >
        <Suspense >
          <Dots />
        </Suspense>
        <CameraControls />
      </Canvas>

    </div>
  );
}

export default App;
