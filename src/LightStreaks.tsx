import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, Vector3, TubeGeometry, CubicBezierCurve3, MeshBasicMaterial, Color, BufferGeometry, BufferAttribute } from 'three'

interface LightStreak {
  mesh: Mesh
  startTime: number
  duration: number
  isActive: boolean
  curve: CubicBezierCurve3
  segments: number
}

interface LightStreaksProps {
  sphereRotation?: { x: number; y: number; z: number }
}

export default function LightStreaks({ sphereRotation }: LightStreaksProps) {
  const lightStreaksRef = useRef<LightStreak[]>([])
  const { scene } = useThree()
  const time = useRef(0)
  const lastStreakTime = useRef(0)
  
  // オブジェクトプール（事前確保）
  const reusableVector3Pool = useRef<Vector3[]>([])
  const reusableColorPool = useRef<Color[]>([])
  const maxPoolSize = 35  // 最大プールサイズを増加
  
  // プール初期化
  useEffect(() => {
    // Vector3プール初期化
    for (let i = 0; i < maxPoolSize * 4; i++) {  // 1つの光につき4個のVector3が必要
      reusableVector3Pool.current.push(new Vector3())
    }
    // Colorプール初期化
    for (let i = 0; i < maxPoolSize; i++) {
      reusableColorPool.current.push(new Color())
    }
  }, [])
  
  // プールからVector3を取得
  const getVector3FromPool = (index: number): Vector3 => {
    return reusableVector3Pool.current[index % reusableVector3Pool.current.length]
  }
  
  // プールからColorを取得
  const getColorFromPool = (index: number): Color => {
    return reusableColorPool.current[index % reusableColorPool.current.length]
  }
  
  const createRandomStreak = (streakIndex: number) => {
    // 球の半径（ワイヤーフレームと同じサイズ）
    const radius = 2
    
    // プールからVector3を取得して再利用
    const poolOffset = streakIndex * 4
    const startPoint = getVector3FromPool(poolOffset)
    const endPoint = getVector3FromPool(poolOffset + 1)
    const controlPoint1 = getVector3FromPool(poolOffset + 2)
    const controlPoint2 = getVector3FromPool(poolOffset + 3)
    
    // 始点：球面上のランダムな点を生成（球面座標系を使用）
    const phi1 = Math.random() * Math.PI * 2 // 方位角 0-2π
    const theta1 = Math.acos(2 * Math.random() - 1) // 仰角 0-π（均等分布）
    startPoint.set(
      radius * Math.sin(theta1) * Math.cos(phi1),
      radius * Math.sin(theta1) * Math.sin(phi1),
      radius * Math.cos(theta1)
    )
    
    // 終点：球面上の別のランダムな点を生成
    const phi2 = Math.random() * Math.PI * 2
    const theta2 = Math.acos(2 * Math.random() - 1)
    endPoint.set(
      radius * Math.sin(theta2) * Math.cos(phi2),
      radius * Math.sin(theta2) * Math.sin(phi2),
      radius * Math.cos(theta2)
    )
    
    // 制御点1：球の内部のランダムな点（ベジェ曲線の曲がり具合を決定）
    controlPoint1.set(
      (startPoint.x + endPoint.x) * 0.2 + (Math.random() - 0.5) * 1.0,
      (startPoint.y + endPoint.y) * 0.2 + (Math.random() - 0.5) * 1.0,
      (startPoint.z + endPoint.z) * 0.2 + (Math.random() - 0.5) * 1.0
    )
    
    // 制御点2：球の内部の別のランダムな点
    controlPoint2.set(
      (startPoint.x + endPoint.x) * 0.8 + (Math.random() - 0.5) * 1.0,
      (startPoint.y + endPoint.y) * 0.8 + (Math.random() - 0.5) * 1.0,
      (startPoint.z + endPoint.z) * 0.8 + (Math.random() - 0.5) * 1.0
    )
    
    // 3次ベジェ曲線を作成（開始点、制御点1、制御点2、終了点）
    const curve = new CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint)
    
    // チューブジオメトリのパラメータ
    const segments = 64        // セグメント数（多いほど滑らか、重い）
    const tubeRadius = 0.02     // チューブの太さ
    const radialSegments = 8    // チューブの円周方向の分割数
    const tubeGeometry = new TubeGeometry(curve, segments, tubeRadius, radialSegments, false)
    
    // 各頂点に透明度属性を追加（光の移動効果のため）
    const vertexCount = tubeGeometry.attributes.position.count
    const alphas = new Float32Array(vertexCount)
    for (let i = 0; i < vertexCount; i++) {
      alphas[i] = 0  // 初期値は透明
    }
    tubeGeometry.setAttribute('alpha', new BufferAttribute(alphas, 1))
    
    // マテリアル作成（ネオンカラー、高い彩度・明度）
    const neonColors = [
      '#ff0080', '#00ff80', '#8000ff', '#ff8000', 
      '#0080ff', '#ff4080', '#80ff00', '#ff0040',
      '#40ff80', '#8040ff', '#ff8040', '#4080ff'
    ]
    const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)]
    
    // プールからColorを取得して再利用
    const reusableColor = getColorFromPool(streakIndex)
    reusableColor.set(randomColor)
    
    const material = new MeshBasicMaterial({
      color: reusableColor,
      transparent: true,
      opacity: 1
    })
    
    // カスタムシェーダーで頂点ごとの透明度を適用
    material.onBeforeCompile = (shader) => {
      // 頂点シェーダーにアルファ属性を追加
      shader.vertexShader = `
        attribute float alpha;
        varying float vAlpha;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vAlpha = alpha;
        `
      )
      
      // フラグメントシェーダーでアルファ値を適用
      shader.fragmentShader = `
        varying float vAlpha;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        gl_FragColor.a *= vAlpha;
        `
      )
    }
    
    const mesh = new Mesh(tubeGeometry, material)
    scene.add(mesh)
    
    return {
      mesh,
      startTime: time.current,
      duration: 1.5 + Math.random() * 0.5,  // 1.0-1.5秒の持続時間
      isActive: true,
      curve,
      segments
    }
  }
  
  useFrame((_, delta) => {
    time.current += delta
    
    // 新しい光の筋を生成するタイミング制御（頻度を上げる）
    // 0.2-0.8秒の間隔でランダムに生成
    if (time.current - lastStreakTime.current > 0.2 + Math.random() * 0.6) {
      const streakIndex = lightStreaksRef.current.length % maxPoolSize
      const newStreak = createRandomStreak(streakIndex)
      lightStreaksRef.current.push(newStreak)
      lastStreakTime.current = time.current
    }
    
    // 既存の光の筋を更新・管理
    lightStreaksRef.current = lightStreaksRef.current.filter((streak) => {
      if (!streak.isActive) return false
      
      // 時間経過と進行度を計算
      const elapsed = time.current - streak.startTime
      const progress = elapsed / streak.duration  // 0.0（開始）〜1.0（終了）
      
      // 持続時間を超えた場合、メッシュを削除
      if (progress >= 1) {
        scene.remove(streak.mesh)
        streak.mesh.geometry.dispose()
        ;(streak.mesh.material as MeshBasicMaterial).dispose()
        return false
      }
      
      // 球のワイヤーフレームと同期して回転
      if (sphereRotation) {
        streak.mesh.rotation.set(sphereRotation.x, sphereRotation.y, sphereRotation.z)
      }
      
      // 光の移動効果を計算
      const geometry = streak.mesh.geometry as BufferGeometry
      const alphaAttribute = geometry.getAttribute('alpha') as BufferAttribute
      const alphas = alphaAttribute.array as Float32Array
      const verticesPerSegment = alphas.length / streak.segments
      
      // 各頂点の透明度を計算
      for (let i = 0; i < alphas.length; i++) {
        const segmentIndex = Math.floor(i / verticesPerSegment)
        const segmentProgress = segmentIndex / streak.segments  // このセグメントの曲線上の位置（0-1）
        
        let alpha = 0
        
        // 【調整可能パラメータ】
        const sigma = 0.2         // ガウス関数の標準偏差（小さいほどシャープ）
        const trailStretch = 2.0  // 尾の伸長係数（大きいほど長い尾）
        
        // 光の現在位置からの距離（進行方向を考慮）
        const distanceFromLight = progress - segmentProgress
        
        // ガウス関数ベースの光分布
        let gaussianDistance = distanceFromLight
        
        // 尾の部分（進行方向後ろ）では距離を伸長して長い尾を作る
        if (distanceFromLight > 0) {
          gaussianDistance = distanceFromLight * trailStretch
        }
        
        // ガウス関数: exp(-x²/(2σ²))
        alpha = Math.exp(-(gaussianDistance * gaussianDistance) / (2 * sigma * sigma))
        
        // 進行方向前方（まだ光が到達していない部分）は完全に透明
        if (distanceFromLight < -sigma) {
          alpha = 0
        }
        
        alphas[i] = alpha
      }
      
      // GPU に変更を通知
      alphaAttribute.needsUpdate = true
      
      return true
    })
  })
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      lightStreaksRef.current.forEach(streak => {
        scene.remove(streak.mesh)
        streak.mesh.geometry.dispose()
        ;(streak.mesh.material as MeshBasicMaterial).dispose()
      })
    }
  }, [scene])
  
  return null
}