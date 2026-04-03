'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// 高质量地球贴图 URLs (NASA 蓝色大理石)
const EARTH_DAY_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-day.jpg';
const EARTH_NIGHT_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg';
const EARTH_CLOUDS_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png';
const EARTH_BUMP_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png';

interface EarthProps {
  rotationSpeed: number;
  showBoost: boolean;
  isOverThousand: boolean;
}

function Earth({ rotationSpeed, showBoost, isOverThousand }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const nightLightsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const boostRingRef = useRef<THREE.Mesh>(null);
  const boostRing2Ref = useRef<THREE.Mesh>(null);
  const energyRingRef = useRef<THREE.Mesh>(null);
  
  const glowIntensityRef = useRef(0);
  const boostRingScaleRef = useRef(0);
  const energyRingRefScale = useRef(0);

  // 加载所有贴图
  const [dayTexture, nightTexture, cloudsTexture, bumpTexture] = useLoader(THREE.TextureLoader, [
    EARTH_DAY_TEXTURE,
    EARTH_NIGHT_TEXTURE,
    EARTH_CLOUDS_TEXTURE,
    EARTH_BUMP_TEXTURE,
  ]);

  // 设置贴图参数
  useEffect(() => {
    [dayTexture, nightTexture, cloudsTexture, bumpTexture].forEach(tex => {
      if (tex) {
        tex.anisotropy = 16;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
      }
    });
  }, [dayTexture, nightTexture, cloudsTexture, bumpTexture]);

  // 创建高级昼夜着色器材质
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        bumpTexture: { value: bumpTexture },
        sunDirection: { value: new THREE.Vector3(1, 0.2, 0.7).normalize() },
        glowIntensity: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          // 计算视线方向
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D bumpTexture;
        uniform vec3 sunDirection;
        uniform float glowIntensity;
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        void main() {
          // 计算光照强度 - 昼夜分界
          float sunIntensity = dot(vNormal, sunDirection);
          
          // 获取纹理颜色
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // 增强夜半球城市灯光效果 - 更亮、更金黄
          vec3 cityLights = nightColor.rgb * 2.5;
          // 让灯光更温暖，模拟真实城市灯光
          cityLights.r *= 1.2;
          cityLights.g *= 0.9;
          cityLights.b *= 0.6;
          
          // 创建更自然的昼夜过渡
          // 昼夜分界线区域 (-0.1 到 0.15)
          float dayMix = smoothstep(-0.2, 0.3, sunIntensity);
          float nightMix = 1.0 - dayMix;
          
          // 晨昏线区域增强 - 橙红色日落/日出效果
          float twilightZone = smoothstep(-0.2, -0.05, sunIntensity) * smoothstep(0.25, 0.05, sunIntensity);
          vec3 twilightColor = vec3(1.0, 0.5, 0.2) * twilightZone * 0.6;
          
          // 混合昼夜纹理
          vec4 baseColor = mix(
            vec4(cityLights, 1.0),  // 夜晚
            dayColor,               // 白天
            dayMix
          );
          
          // 添加晨昏线颜色
          baseColor.rgb += twilightColor;
          
          // 添加轻微的大气散射效果在边缘
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
          vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
          baseColor.rgb += atmosphereColor * fresnel * 0.15;
          
          // 超速发光效果 - 更强烈的蓝色光晕
          if (glowIntensity > 0.0) {
            baseColor.rgb += vec3(0.2, 0.5, 1.0) * glowIntensity * 0.5;
          }
          
          gl_FragColor = baseColor;
        }
      `,
    });
  }, [dayTexture, nightTexture, bumpTexture]);

  // 夜晚城市灯光层 - 单独的发光层
  const nightLightsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(1, 0.2, 0.7).normalize() },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // 只在夜半球显示
          float sunIntensity = dot(vNormal, sunDirection);
          
          // 只在夜晚区域显示灯光
          if (sunIntensity > 0.0) discard;
          
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // 城市灯光亮度
          float lightIntensity = (nightColor.r + nightColor.g + nightColor.b) / 3.0;
          
          // 只显示有灯光的区域
          if (lightIntensity < 0.02) discard;
          
          // 增强灯光效果 - 发光
          vec3 glowColor = nightColor.rgb * 3.0;
          glowColor.r *= 1.3;
          glowColor.g *= 1.1;
          
          // 随着深入夜晚逐渐变亮
          float nightDepth = smoothstep(0.1, -0.3, sunIntensity);
          
          gl_FragColor = vec4(glowColor, lightIntensity * nightDepth * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [nightTexture]);

  // 云层材质 - 带光照
  const cloudsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudsTexture: { value: cloudsTexture },
        sunDirection: { value: new THREE.Vector3(1, 0.2, 0.7).normalize() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D cloudsTexture;
        uniform vec3 sunDirection;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vec4 clouds = texture2D(cloudsTexture, vUv);
          
          // 云层光照
          float sunIntensity = dot(vNormal, sunDirection);
          float light = smoothstep(-0.3, 0.5, sunIntensity);
          
          // 白天云层更亮，夜晚云层几乎不可见
          vec3 cloudColor = mix(
            vec3(0.02, 0.02, 0.05),  // 夜晚深蓝
            vec3(1.0, 1.0, 1.0),      // 白天白色
            light
          );
          
          // 云层透明度
          float alpha = clouds.r * mix(0.1, 0.5, light);
          
          gl_FragColor = vec4(cloudColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [cloudsTexture]);

  // 大气层着色器
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: new THREE.Vector3(1, 0.2, 0.7).normalize() },
        glowIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform float glowIntensity;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // 大气散射效果
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          // 日出/日落颜色渐变
          float sunAngle = dot(vNormal, sunDirection);
          vec3 dayColor = vec3(0.3, 0.6, 1.0);   // 白天蓝色
          vec3 sunsetColor = vec3(1.0, 0.4, 0.2); // 日落橙色
          vec3 nightColor = vec3(0.05, 0.1, 0.2); // 夜晚深蓝
          
          vec3 atmosphereColor;
          if (sunAngle > 0.2) {
            atmosphereColor = dayColor;
          } else if (sunAngle > -0.2) {
            float t = (sunAngle + 0.2) / 0.4;
            atmosphereColor = mix(sunsetColor, dayColor, t);
          } else {
            atmosphereColor = nightColor;
          }
          
          // 超速效果 - 更强的蓝色光芒
          if (glowIntensity > 0.0) {
            atmosphereColor += vec3(0.1, 0.3, 0.8) * glowIntensity * 0.6;
          }
          
          gl_FragColor = vec4(atmosphereColor, intensity * 0.6);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // 更新发光强度
  useEffect(() => {
    glowIntensityRef.current = isOverThousand ? 1 : 0;
  }, [isOverThousand]);

  // 地球转速计算
  const TIME_SCALE = 60;
  const baseRotationPerSecond = (2 * Math.PI) / 86400;
  const visualRotationPerSecond = baseRotationPerSecond * TIME_SCALE;
  const rotationPerFrame = visualRotationPerSecond / 60;

  // 动画帧更新
  useFrame((_, delta) => {
    // 更新着色器参数
    if (earthMaterial.uniforms) {
      earthMaterial.uniforms.glowIntensity.value = glowIntensityRef.current;
      earthMaterial.uniforms.time.value += delta;
    }
    
    // 地球旋转
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * rotationPerFrame;
    }
    
    // 云层旋转（稍快）
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * rotationPerFrame * 1.02;
    }
    
    // 夜晚灯光层
    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y = earthRef.current?.rotation.y || 0;
    }
    
    // 大气层
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = earthRef.current?.rotation.y || 0;
      if (atmosphereMaterial.uniforms) {
        atmosphereMaterial.uniforms.glowIntensity.value = glowIntensityRef.current;
      }
    }
    
    // 外层光晕
    if (glowRef.current) {
      glowRef.current.rotation.y += rotationSpeed * rotationPerFrame;
    }
    
    // 加速光环动画 - 主环
    if (boostRingRef.current) {
      if (showBoost) {
        boostRingScaleRef.current = Math.min(boostRingScaleRef.current + 0.05, 1);
      } else {
        boostRingScaleRef.current = Math.max(boostRingScaleRef.current - 0.02, 0);
      }
      boostRingRef.current.scale.setScalar(1 + boostRingScaleRef.current * 0.8);
      const opacity = showBoost 
        ? (1 - boostRingScaleRef.current) * 0.95 
        : boostRingScaleRef.current * 0.4;
      (boostRingRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      // 旋转
      boostRingRef.current.rotation.z += 0.02;
    }
    
    // 第二个加速光环
    if (boostRing2Ref.current) {
      if (showBoost) {
        const scale = 1 + boostRingScaleRef.current * 1.0;
        boostRing2Ref.current.scale.setScalar(scale);
      }
      const opacity = showBoost ? 0.5 : 0;
      (boostRing2Ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      boostRing2Ref.current.rotation.z -= 0.015;
    }
    
    // 能量环 - 粉金色
    if (energyRingRef.current) {
      if (showBoost) {
        energyRingRefScale.current = Math.min(energyRingRefScale.current + 0.03, 1);
      } else {
        energyRingRefScale.current = Math.max(energyRingRefScale.current - 0.02, 0);
      }
      const scale = 1 + energyRingRefScale.current * 0.5;
      energyRingRef.current.scale.setScalar(scale);
      const opacity = showBoost ? energyRingRefScale.current * 0.6 : 0;
      (energyRingRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      energyRingRef.current.rotation.z += 0.03;
    }
  });

  return (
    <group>
      {/* 地球主体 */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[2, 128, 128]} />
      </mesh>

      {/* 夜晚城市灯光层 */}
      <mesh ref={nightLightsRef} material={nightLightsMaterial}>
        <sphereGeometry args={[2.003, 128, 128]} />
      </mesh>

      {/* 云层 */}
      <mesh ref={cloudsRef} material={cloudsMaterial}>
        <sphereGeometry args={[2.02, 64, 64]} />
      </mesh>

      {/* 大气层 */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[2.15, 64, 64]} />
      </mesh>

      {/* 外层光晕 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial
          color={isOverThousand ? 0x4488ff : 0x3388cc}
          transparent
          opacity={isOverThousand ? 0.08 : 0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 主加速光环 - Sonic Boom 效果 - 青色 */}
      <mesh ref={boostRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.4, 128]} />
        <meshBasicMaterial
          color={0x00d4ff}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 第二加速光环 - 浅蓝 */}
      <mesh ref={boostRing2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.75, 64]} />
        <meshBasicMaterial
          color={0x00ffcc}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 能量环 - 粉金色 */}
      <mesh ref={energyRingRef} rotation={[Math.PI / 2.5, 0.2, 0]}>
        <ringGeometry args={[2.2, 2.35, 64]} />
        <meshBasicMaterial
          color={0xffaa88}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 额外的外层光环 - 加速时显示 */}
      {showBoost && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0.5]}>
            <ringGeometry args={[2.8, 3.0, 32]} />
            <meshBasicMaterial
              color={0xff6699}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
            <ringGeometry args={[3.1, 3.25, 32]} />
            <meshBasicMaterial
              color={0xffdd88}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// 增强版星空背景
function SpaceBackground() {
  return (
    <>
      {/* 近景星星 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.2}
      />
      {/* 中景星星 */}
      <Stars
        radius={150}
        depth={80}
        count={6000}
        factor={5}
        saturation={0}
        fade
        speed={0.15}
      />
      {/* 远景星星/星云效果 */}
      <Stars
        radius={250}
        depth={100}
        count={3000}
        factor={6}
        saturation={0.3}
        fade
        speed={0.05}
      />
    </>
  );
}

// 光源系统
function Lights() {
  return (
    <>
      {/* 环境光 - 极微弱 */}
      <ambientLight intensity={0.02} />
      
      {/* 太阳光 - 主光源 */}
      <directionalLight
        position={[5, 1.5, 3]}
        intensity={2.0}
        color={0xffffff}
      />
      
      {/* 地面反射光 */}
      <pointLight 
        position={[0, -10, 0]} 
        intensity={0.05} 
        color={0x4466aa} 
      />
    </>
  );
}

interface EarthSceneProps {
  rotationSpeed: number;
  isOverThousand: boolean;
  showBoost: boolean;
}

export default function EarthScene({ rotationSpeed, isOverThousand, showBoost }: EarthSceneProps) {
  const [isLowPerf, setIsLowPerf] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          const debugInfo = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
          if (typeof debugInfo === 'string' && debugInfo.toLowerCase().includes('swiftshader')) {
            setIsLowPerf(true);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={isLowPerf ? 1 : 2}
        gl={{ antialias: !isLowPerf, alpha: true }}
      >
        <color attach="background" args={['#000004']} />
        <fog attach="fog" args={['#000004', 10, 30]} />
        <SpaceBackground />
        <Lights />
        <Earth
          rotationSpeed={rotationSpeed}
          isOverThousand={isOverThousand}
          showBoost={showBoost}
        />
      </Canvas>
    </div>
  );
}
