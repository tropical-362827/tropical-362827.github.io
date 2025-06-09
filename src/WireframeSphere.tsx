import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, LineSegments, IcosahedronGeometry, EdgesGeometry, LineBasicMaterial, Color } from 'three'

interface WireframeSphereProps {
  onRotationUpdate?: (rotation: { x: number; y: number; z: number }) => void
}

export default function WireframeSphere({ onRotationUpdate }: WireframeSphereProps) {
  const meshRef = useRef<Mesh>(null)
  const lineSegmentsRef = useRef<LineSegments>(null)
  
  // 球状多面体（イコサヘドロン）のジオメトリを作成
  const geometry = useMemo(() => new IcosahedronGeometry(2, 4), [])
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry])
  
  // ワイヤーフレーム用のマテリアル
  const wireframeMaterial = useMemo(() => 
    new LineBasicMaterial({ 
      color: new Color('#ff0080'),
      linewidth: 2
    }), []
  )
  
  useFrame(() => {
    if (meshRef.current && lineSegmentsRef.current) {
      // ゆっくりとした回転
      meshRef.current.rotation.x += 0.001
      meshRef.current.rotation.y += 0.002
      meshRef.current.rotation.z += 0.0005
      
      // ワイヤーフレームを同期
      lineSegmentsRef.current.rotation.x = meshRef.current.rotation.x
      lineSegmentsRef.current.rotation.y = meshRef.current.rotation.y
      lineSegmentsRef.current.rotation.z = meshRef.current.rotation.z
      
      // 親コンポーネントに回転情報を通知
      if (onRotationUpdate) {
        onRotationUpdate({
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
          z: meshRef.current.rotation.z
        })
      }
    }
  })
  
  return (
    <>
      {/* 透明なメッシュ（回転用） */}
      <mesh ref={meshRef}>
        <primitive object={geometry} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* ワイヤーフレーム */}
      <primitive object={new LineSegments(edges, wireframeMaterial)} ref={lineSegmentsRef} />
    </>
  )
}