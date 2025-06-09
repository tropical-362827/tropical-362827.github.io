import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Color } from 'three'
import WireframeSphere from './WireframeSphere'
import LightStreaks from './LightStreaks'
import StarField from './StarField'

function Scene3D() {
  const { camera, scene } = useThree()
  const cameraTarget = useRef(new Vector3())
  const time = useRef(0)
  const colorTime = useRef(0)
  const bgColorTime = useRef(0)
  
  // 球の回転状態を管理
  const [sphereRotation, setSphereRotation] = useState({ x: 0, y: 0, z: 0 })
  
  // 球の回転更新コールバック
  const handleSphereRotationUpdate = (rotation: { x: number; y: number; z: number }) => {
    setSphereRotation(rotation)
  }
  
  // 初期背景色設定
  useEffect(() => {
    scene.background = new Color(0x000011)
  }, [scene])
  
  useFrame((_, delta) => {
    time.current += delta
    colorTime.current += delta
    bgColorTime.current += delta
    
    // カメラの動き（中心部で角度のみ変化）
    const speed = 0.15
    const targetX = Math.sin(time.current * speed) * 2
    const targetY = Math.cos(time.current * speed * 0.7) * 1.5
    const targetZ = Math.sin(time.current * speed * 0.5) * 2
    
    cameraTarget.current.set(targetX, targetY, targetZ)
    camera.position.set(0, 0, 0)
    camera.lookAt(cameraTarget.current)
    
    // 背景色の変化
    const bgHue = (bgColorTime.current * 0.05) % 1
    const backgroundColor = new Color().setHSL(bgHue, 0.8, 0.05)
    scene.background = backgroundColor
  })
  
  return (
    <>
      {/* 背景の星 */}
      <StarField sphereRotation={sphereRotation} />
      
      {/* 環境光とポイントライト */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* ワイヤーフレーム球体 */}
      <WireframeSphere onRotationUpdate={handleSphereRotationUpdate} />
      
      {/* 光の筋 */}
      <LightStreaks sphereRotation={sphereRotation} />
    </>
  )
}

export default Scene3D