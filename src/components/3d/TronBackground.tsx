import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function TronGrid() {
  const gridRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  // Create grid lines
  const gridGeometry = useMemo(() => {
    const size = 100;
    const divisions = 50;
    const points: THREE.Vector3[] = [];

    // Horizontal lines
    for (let i = -divisions; i <= divisions; i++) {
      const z = (i / divisions) * size;
      points.push(new THREE.Vector3(-size, 0, z));
      points.push(new THREE.Vector3(size, 0, z));
    }

    // Vertical lines (going into distance)
    for (let i = -divisions; i <= divisions; i++) {
      const x = (i / divisions) * size;
      points.push(new THREE.Vector3(x, 0, -size));
      points.push(new THREE.Vector3(x, 0, size));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, []);

  useFrame((state, delta) => {
    time.current += delta;
    if (gridRef.current) {
      // Subtle movement animation
      gridRef.current.position.z = (time.current * 2) % 4;
    }
  });

  return (
    <group ref={gridRef} position={[0, -2, 0]} rotation={[0, 0, 0]}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial 
          color="#00E5FF" 
          transparent 
          opacity={0.4}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 60;
      pos[i3 + 1] = Math.random() * 30 - 5;
      pos[i3 + 2] = (Math.random() - 0.5) * 60;

      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return [pos, vel];
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArray[i3] += velocities[i3];
        posArray[i3 + 1] += velocities[i3 + 1];
        posArray[i3 + 2] += velocities[i3 + 2];

        // Reset particles that go too far
        if (Math.abs(posArray[i3]) > 30) velocities[i3] *= -1;
        if (posArray[i3 + 1] > 25 || posArray[i3 + 1] < -5) velocities[i3 + 1] *= -1;
        if (Math.abs(posArray[i3 + 2]) > 30) velocities[i3 + 2] *= -1;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00FFC6"
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function HexagonRing({ radius, y, rotationSpeed }: { radius: number; y: number; rotationSpeed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, y, -20]}>
      <torusGeometry args={[radius, 0.05, 6, 6]} />
      <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#050816']} />
      <fog attach="fog" args={['#050816', 10, 80]} />
      
      <TronGrid />
      <FloatingParticles />
      
      {/* Decorative hexagon rings */}
      <HexagonRing radius={8} y={5} rotationSpeed={0.2} />
      <HexagonRing radius={12} y={8} rotationSpeed={-0.15} />
      <HexagonRing radius={6} y={3} rotationSpeed={0.3} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00E5FF" />
    </>
  );
}

export default function TronBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />
    </div>
  );
}
