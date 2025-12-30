import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const Firework = ({ position, color }: { position: [number, number, number], color: string }) => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 100; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.random() * 2;
      p.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(p);
  }, []);

  const ref = useRef<THREE.Points>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.2);
    }
  });

  return (
    <group position={position}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length / 3}
            array={points}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color={color} transparent opacity={0.8} />
      </points>
    </group>
  );
};

export const NewYearPage: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#050510] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            font="/fonts/Cinzel-Bold.ttf" // Assuming font exists or fallback
            fontSize={3}
            color="#FFD700"
            position={[0, 2, 0]}
            maxWidth={10}
            textAlign="center"
          >
            HAPPY NEW YEAR
            2026
          </Text>
        </Float>

        <Firework position={[-5, 0, -5]} color="#FF0000" />
        <Firework position={[5, 2, -5]} color="#00FF00" />
        <Firework position={[0, -2, -5]} color="#0000FF" />
        <Firework position={[-3, 4, -8]} color="#FFD700" />
        <Firework position={[3, -3, -8]} color="#FF00FF" />

        <EffectComposer>
          <Bloom luminanceThreshold={0} mipmapBlur intensity={1.5} radius={0.8} />
        </EffectComposer>

        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
      
      <div className="absolute bottom-10 w-full text-center pointer-events-none">
        <h2 className="text-white/50 font-serif text-xl tracking-widest">WISHING YOU A SPECTACULAR YEAR</h2>
      </div>
    </div>
  );
};
