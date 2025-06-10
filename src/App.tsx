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
        gl={{
          antialias: false,  // Windows向けアンチエイリアス無効
          powerPreference: 'high-performance',  // 高性能GPU使用
          alpha: false  // 透明度無効で高速化
        }}
      >
        <Scene3D />
      </Canvas>
    </div>
  )
}

export default App