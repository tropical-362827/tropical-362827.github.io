import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } from 'three'

interface StarFieldProps {
  sphereRotation?: { x: number; y: number; z: number }
}

export default function StarField({ sphereRotation }: StarFieldProps) {
  const pointsRef = useRef<Points>(null)
  
  // 星の数と配置を生成
  const positions = useMemo(() => {
    const starCount = 3000
    const positions = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount; i++) {
      // 球面上のランダムな位置（ワイヤーフレーム球の外側）
      const radius = 15 + Math.random() * 35  // 15-50の距離（球の半径2より外側）
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = radius * Math.cos(theta)
    }
    
    return positions
  }, [])
  
  // ジオメトリとマテリアルを作成
  const { geometry, material } = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    
    const material = new PointsMaterial({
      color: new Color('white'),
      size: 0.1,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    })
    
    return { geometry, material }
  }, [positions])
  
  // ワイヤーフレームと同期した回転
  useFrame(() => {
    if (pointsRef.current && sphereRotation) {
      pointsRef.current.rotation.set(sphereRotation.x, sphereRotation.y, sphereRotation.z)
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} renderOrder={-1} />
  )
}