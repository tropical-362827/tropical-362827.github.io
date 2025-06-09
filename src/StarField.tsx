import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } from 'three'

interface StarFieldProps {
  sphereRotation?: { x: number; y: number; z: number }
}

export default function StarField({ sphereRotation }: StarFieldProps) {
  const pointsRef = useRef<Points>(null)
  
  // 星の数と配置を生成
  const { positions, brightnesses } = useMemo(() => {
    const starCount = 3000
    const positions = new Float32Array(starCount * 3)
    const brightnesses = new Float32Array(starCount)
    
    for (let i = 0; i < starCount; i++) {
      // 球面上のランダムな位置（ワイヤーフレーム球の外側）
      const radius = 15 + Math.random() * 35  // 15-50の距離（球の半径2より外側）
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = radius * Math.cos(theta)
      
      // 指数関数的な明るさ分布（明るいほど少なく）
      // Math.random()^3 で指数分布を近似
      const randomValue = Math.random()
      brightnesses[i] = Math.pow(randomValue, 3) * 0.8 + 0.2  // 0.2-1.0の範囲
    }
    
    return { positions, brightnesses }
  }, [])
  
  // ジオメトリとマテリアルを作成
  const { geometry, material } = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('brightness', new BufferAttribute(brightnesses, 1))
    
    const material = new PointsMaterial({
      color: new Color('white'),
      size: 0.1,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      alphaTest: 0.1,
      depthTest: false,
      depthWrite: false
    })
    
    // カスタムシェーダーで明るさを適用
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = `
        attribute float brightness;
        varying float vBrightness;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vBrightness = brightness;
        `
      )
      
      shader.fragmentShader = `
        varying float vBrightness;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        
        // 中心から外側への距離
        vec2 center = gl_PointCoord - vec2(0.5);
        float distance = length(center);
        
        // 完全に円形の星
        // ガウシアン分布で中心が明るく、外側に向かって滑らかに減衰
        float gaussian = exp(-distance * distance * 20.0);
        
        // 円形の境界でのソフトカットオフ
        float circle = 1.0 - smoothstep(0.3, 0.5, distance);
        
        // 最終的な透明度（円形のみ）
        float finalAlpha = gaussian * circle;
        
        // 距離による減衰も追加
        if (distance > 0.5) {
          finalAlpha = 0.0;
        }
        
        gl_FragColor.a *= finalAlpha * vBrightness;
        `
      )
    }
    
    return { geometry, material }
  }, [positions, brightnesses])
  
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