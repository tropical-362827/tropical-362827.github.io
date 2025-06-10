import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { Vector3, Color } from 'three'
import WireframeSphere from './WireframeSphere'
import LightStreaks from './LightStreaks'
import StarField from './StarField'
import LinkSection from './LinkSection'

function Scene3D() {
  const { camera, scene } = useThree()
  const cameraTarget = useRef(new Vector3())
  const time = useRef(0)
  const colorTime = useRef(0)
  const bgColorTime = useRef(0)
  const lastBgHue = useRef(-1)  // 前回の色相をキャッシュ
  
  // 球の回転状態を管理
  const [sphereRotation, setSphereRotation] = useState({ x: 0, y: 0, z: 0 })
  
  // リンクセクションの表示制御
  const [showLinks, setShowLinks] = useState(true)
  
  // Stats表示制御（0:非表示, 1:FPS, 2:MS, 3:MB）
  const [statsMode, setStatsMode] = useState(0)
  
  // 背景色の状態管理（LinkSectionに渡すため）
  const [currentBgColor, setCurrentBgColor] = useState('#000011')
  
  // 事前確保したColorオブジェクト（使い回し用）
  const reusableColor = useRef(new Color())
  
  // 球の回転更新コールバック
  const handleSphereRotationUpdate = (rotation: { x: number; y: number; z: number }) => {
    setSphereRotation(rotation)
  }
  
  // 初期背景色設定
  useEffect(() => {
    scene.background = new Color(0x000011)
  }, [scene])
  
  // キーボードイベントでリンクセクション・Stats切り替え
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'l' || event.key === 'L') {
        setShowLinks(prev => !prev)
      }
      if (event.key === 's' || event.key === 'S') {
        setStatsMode(prev => (prev + 1) % 4)  // 0→1→2→3→0のサイクル
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  
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
    
    // 背景色の変化（事前確保したColorオブジェクトを再利用）
    const bgHue = (bgColorTime.current * 0.05) % 1
    reusableColor.current.setHSL(bgHue, 0.8, 0.05)
    scene.background = reusableColor.current
    
    // 背景色をHEX形式でStateに保存（変化があった場合のみ）
    const hueRounded = Math.round(bgHue * 1000) // 色相を1000分割で丸める
    if (hueRounded !== lastBgHue.current) {
      setCurrentBgColor(`#${reusableColor.current.getHexString()}`)
      lastBgHue.current = hueRounded
    }
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
      
      {/* リンクセクション */}
      {showLinks && <LinkSection currentBgColor={currentBgColor} />}
      
      {/* Stats表示（FPS/MS/MB切り替え） */}
      {statsMode === 1 && <Stats showPanel={0} />}  {/* FPS */}
      {statsMode === 2 && <Stats showPanel={1} />}  {/* MS */}
      {statsMode === 3 && <Stats showPanel={2} />}  {/* MB */}
    </>
  )
}

export default Scene3D