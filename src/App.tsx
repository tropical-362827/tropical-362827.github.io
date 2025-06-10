import { Canvas } from '@react-three/fiber'
import Scene3D from './Scene3D'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{}}
      >
        <Scene3D />
      </Canvas>
    </div>
  )
}

export default App