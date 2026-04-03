'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_DAY_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-day.jpg';
const EARTH_NIGHT_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg';
const EARTH_CLOUDS_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png';
const EARTH_BUMP_TEXTURE = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png';

interface SatelliteInfo {
  id: number;
  name: string;
  type: string;
  orbit: string;
  status: string;
}

const SATELLITE_INFO: SatelliteInfo[] = [
  { id: 1, name: 'Faymox-1', type: '通信卫星', orbit: 'LEO (低地球轨道)', status: '运行中' },
  { id: 2, name: 'Gravity-X', type: '科研卫星', orbit: 'MEO (中地球轨道)', status: '数据收集中' },
  { id: 3, name: 'Quantum-7', type: '量子通信', orbit: 'GEO (地球同步轨道)', status: '量子纠缠态稳定' },
  { id: 4, name: 'Observer-2', type: '观测卫星', orbit: 'SSO (太阳同步轨道)', status: '监测地球转速' },
  { id: 5, name: 'Pulse-Alpha', type: '能源卫星', orbit: 'HEO (高椭圆轨道)', status: '太阳能收集' },
];

interface SatelliteProps {
  orbitRadius: number;
  orbitTilt: number;
  speed: number;
  startAngle: number;
  color: number;
  size: number;
  info: SatelliteInfo;
  onHover: (info: SatelliteInfo | null) => void;
  globalRotationSpeed: number;
}

function Satellite({ 
  orbitRadius, 
  orbitTilt, 
  speed, 
  startAngle, 
  color, 
  size, 
  info,
  onHover,
  globalRotationSpeed
}: SatelliteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Line>(null);
  const angleRef = useRef(startAngle);
  const floatOffsetRef = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  const orbitPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(a) * orbitRadius,
        0,
        Math.sin(a) * orbitRadius
      ));
    }
    return points;
  }, [orbitRadius]);

  const orbitGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitPoints);
  }, [orbitPoints]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      angleRef.current += speed * delta * globalRotationSpeed;
      const angle = angleRef.current;
      
      const floatOffset = Math.sin(floatOffsetRef.current + angleRef.current * 0.5) * 0.03;
      
      meshRef.current.position.x = Math.cos(angle) * orbitRadius;
      meshRef.current.position.z = Math.sin(angle) * orbitRadius;
      meshRef.current.position.y = floatOffset;
      
      meshRef.current.rotation.y = -angle;
      meshRef.current.rotation.x = Math.sin(angleRef.current * 2) * 0.1;
    }
  });

  const handlePointerOver = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    onHover(info);
    document.body.style.cursor = 'pointer';
  }, [info, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  return (
    <group rotation={[orbitTilt, 0, 0]}>
      <line ref={orbitRef} geometry={orbitGeometry}>
        <lineBasicMaterial 
          color={hovered ? 0x00ffff : 0x334455} 
          transparent 
          opacity={hovered ? 0.6 : 0.2} 
        />
      </line>
      
      <mesh 
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={hovered ? 0x00ffff : color}
          emissive={hovered ? 0x00ffff : color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {hovered && (
        <mesh ref={meshRef}>
          <sphereGeometry args={[size * 2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

interface SatelliteSystemProps {
  onHover: (info: SatelliteInfo | null) => void;
  globalRotationSpeed: number;
}

function SatelliteSystem({ onHover, globalRotationSpeed }: SatelliteSystemProps) {
  const satellites = useMemo(() => {
    const count = 3 + Math.floor(Math.random() * 3);
    return Array.from({ length: count }, (_, i) => ({
      orbitRadius: 2.8 + i * 0.4 + Math.random() * 0.2,
      orbitTilt: (Math.random() - 0.5) * 1.2,
      speed: 0.3 + Math.random() * 0.4,
      startAngle: Math.random() * Math.PI * 2,
      color: [0x00aaff, 0xff6699, 0x66ff99, 0xffaa00, 0xaa66ff][i % 5],
      size: 0.04 + Math.random() * 0.03,
      info: SATELLITE_INFO[i],
    }));
  }, []);

  return (
    <>
      {satellites.map((sat, i) => (
        <Satellite
          key={i}
          {...sat}
          onHover={onHover}
          globalRotationSpeed={globalRotationSpeed}
        />
      ))}
    </>
  );
}

interface EarthProps {
  rotationSpeed: number;
  showBoost: boolean;
  isOverThousand: boolean;
  onSatelliteHover: (info: SatelliteInfo | null) => void;
}

function Earth({ rotationSpeed, showBoost, isOverThousand, onSatelliteHover }: EarthProps) {
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

  const [dayTexture, nightTexture, cloudsTexture, bumpTexture] = useLoader(THREE.TextureLoader, [
    EARTH_DAY_TEXTURE,
    EARTH_NIGHT_TEXTURE,
    EARTH_CLOUDS_TEXTURE,
    EARTH_BUMP_TEXTURE,
  ]);

  useEffect(() => {
    [dayTexture, nightTexture, cloudsTexture, bumpTexture].forEach(tex => {
      if (tex) {
        tex.anisotropy = 16;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
      }
    });
  }, [dayTexture, nightTexture, cloudsTexture, bumpTexture]);

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
          float sunIntensity = dot(vNormal, sunDirection);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          vec3 cityLights = nightColor.rgb * 2.5;
          cityLights.r *= 1.2;
          cityLights.g *= 0.9;
          cityLights.b *= 0.6;
          
          float dayMix = smoothstep(-0.2, 0.3, sunIntensity);
          float nightMix = 1.0 - dayMix;
          
          float twilightZone = smoothstep(-0.2, -0.05, sunIntensity) * smoothstep(0.25, 0.05, sunIntensity);
          vec3 twilightColor = vec3(1.0, 0.5, 0.2) * twilightZone * 0.6;
          
          vec4 baseColor = mix(
            vec4(cityLights, 1.0),
            dayColor,
            dayMix
          );
          
          baseColor.rgb += twilightColor;
          
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
          vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
          baseColor.rgb += atmosphereColor * fresnel * 0.15;
          
          if (glowIntensity > 0.0) {
            baseColor.rgb += vec3(0.2, 0.5, 1.0) * glowIntensity * 0.5;
          }
          
          gl_FragColor = baseColor;
        }
      `,
    });
  }, [dayTexture, nightTexture, bumpTexture]);

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
          float sunIntensity = dot(vNormal, sunDirection);
          if (sunIntensity > 0.0) discard;
          
          vec4 nightColor = texture2D(nightTexture, vUv);
          float lightIntensity = (nightColor.r + nightColor.g + nightColor.b) / 3.0;
          if (lightIntensity < 0.02) discard;
          
          vec3 glowColor = nightColor.rgb * 3.0;
          glowColor.r *= 1.3;
          glowColor.g *= 1.1;
          
          float nightDepth = smoothstep(0.1, -0.3, sunIntensity);
          gl_FragColor = vec4(glowColor, lightIntensity * nightDepth * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [nightTexture]);

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
          float sunIntensity = dot(vNormal, sunDirection);
          float light = smoothstep(-0.3, 0.5, sunIntensity);
          
          vec3 cloudColor = mix(
            vec3(0.02, 0.02, 0.05),
            vec3(1.0, 1.0, 1.0),
            light
          );
          
          float alpha = clouds.r * mix(0.1, 0.5, light);
          gl_FragColor = vec4(cloudColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [cloudsTexture]);

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
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          float sunAngle = dot(vNormal, sunDirection);
          vec3 dayColor = vec3(0.3, 0.6, 1.0);
          vec3 sunsetColor = vec3(1.0, 0.4, 0.2);
          vec3 nightColor = vec3(0.05, 0.1, 0.2);
          
          vec3 atmosphereColor;
          if (sunAngle > 0.2) {
            atmosphereColor = dayColor;
          } else if (sunAngle > -0.2) {
            float t = (sunAngle + 0.2) / 0.4;
            atmosphereColor = mix(sunsetColor, dayColor, t);
          } else {
            atmosphereColor = nightColor;
          }
          
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

  useEffect(() => {
    glowIntensityRef.current = isOverThousand ? 1 : 0;
  }, [isOverThousand]);

  const TIME_SCALE = 60;
  const baseRotationPerSecond = (2 * Math.PI) / 86400;
  const visualRotationPerSecond = baseRotationPerSecond * TIME_SCALE;
  const rotationPerFrame = visualRotationPerSecond / 60;

  useFrame((_, delta) => {
    if (earthMaterial.uniforms) {
      earthMaterial.uniforms.glowIntensity.value = glowIntensityRef.current;
      earthMaterial.uniforms.time.value += delta;
    }
    
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * rotationPerFrame;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * rotationPerFrame * 1.02;
    }
    
    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y = earthRef.current?.rotation.y || 0;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = earthRef.current?.rotation.y || 0;
      if (atmosphereMaterial.uniforms) {
        atmosphereMaterial.uniforms.glowIntensity.value = glowIntensityRef.current;
      }
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y += rotationSpeed * rotationPerFrame;
    }
    
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
      boostRingRef.current.rotation.z += 0.02;
    }
    
    if (boostRing2Ref.current) {
      if (showBoost) {
        const scale = 1 + boostRingScaleRef.current * 1.0;
        boostRing2Ref.current.scale.setScalar(scale);
      }
      const opacity = showBoost ? 0.5 : 0;
      (boostRing2Ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      boostRing2Ref.current.rotation.z -= 0.015;
    }
    
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
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      <mesh ref={nightLightsRef} material={nightLightsMaterial}>
        <sphereGeometry args={[2.003, 64, 64]} />
      </mesh>

      <mesh ref={cloudsRef} material={cloudsMaterial}>
        <sphereGeometry args={[2.02, 32, 32]} />
      </mesh>

      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[2.15, 32, 32]} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshBasicMaterial
          color={isOverThousand ? 0x4488ff : 0x3388cc}
          transparent
          opacity={isOverThousand ? 0.08 : 0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={boostRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.4, 64]} />
        <meshBasicMaterial
          color={0x00d4ff}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={boostRing2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.75, 32]} />
        <meshBasicMaterial
          color={0x00ffcc}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={energyRingRef} rotation={[Math.PI / 2.5, 0.2, 0]}>
        <ringGeometry args={[2.2, 2.35, 32]} />
        <meshBasicMaterial
          color={0xffaa88}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {showBoost && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0.5]}>
            <ringGeometry args={[2.8, 3.0, 16]} />
            <meshBasicMaterial
              color={0xff6699}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
            <ringGeometry args={[3.1, 3.25, 16]} />
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

      <SatelliteSystem onHover={onSatelliteHover} globalRotationSpeed={rotationSpeed} />
    </group>
  );
}

function SpaceBackground() {
  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.2} />
      <Stars radius={150} depth={80} count={4000} factor={5} saturation={0} fade speed={0.15} />
      <Stars radius={250} depth={100} count={2000} factor={6} saturation={0.3} fade speed={0.05} />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.02} />
      <directionalLight position={[5, 1.5, 3]} intensity={2.0} color={0xffffff} />
      <pointLight position={[0, -10, 0]} intensity={0.05} color={0x4466aa} />
    </>
  );
}

interface EarthSceneProps {
  rotationSpeed: number;
  isOverThousand: boolean;
  showBoost: boolean;
  onSatelliteHover?: (info: SatelliteInfo | null) => void;
}

export default function EarthScene({ rotationSpeed, isOverThousand, showBoost, onSatelliteHover }: EarthSceneProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredSatellite, setHoveredSatellite] = useState<SatelliteInfo | null>(null);

  const handleSatelliteHover = useCallback((info: SatelliteInfo | null) => {
    setHoveredSatellite(info);
    onSatelliteHover?.(info);
  }, [onSatelliteHover]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 touch-pan-y">
      <Canvas
        camera={{ position: [0, 0, isMobile ? 6 : 5], fov: isMobile ? 50 : 42 }}
        dpr={isMobile ? 1 : 1.5}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#000004']} />
        <fog attach="fog" args={['#000004', 10, 30]} />
        <SpaceBackground />
        <Lights />
        <Earth
          rotationSpeed={rotationSpeed}
          isOverThousand={isOverThousand}
          showBoost={showBoost}
          onSatelliteHover={handleSatelliteHover}
        />
      </Canvas>

      {hoveredSatellite && !isMobile && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-4 shadow-2xl shadow-cyan-500/20 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-semibold text-sm">{hoveredSatellite.name}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">类型</span>
                <span className="text-white/80">{hoveredSatellite.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">轨道</span>
                <span className="text-white/80">{hoveredSatellite.orbit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">状态</span>
                <span className="text-green-400">{hoveredSatellite.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { SatelliteInfo };
