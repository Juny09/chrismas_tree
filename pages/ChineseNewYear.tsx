import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Text, Cylinder } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const Lantern = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.getElapsedTime() + position[0]) * 0.002;
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5 + position[1]) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* String */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Lantern Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      
      {/* Top Cap */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
      </mesh>
      
      {/* Bottom Cap */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
      </mesh>
      
      {/* Tassel */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 0.8]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* Character (Fu) - simplified as gold box for now */}
      <mesh position={[0, 0, 0.81]} scale={[0.4, 0.4, 0.01]}>
         <boxGeometry />
         <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export const CNYPage: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#2a0808] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <color attach="background" args={['#2a0808']} />
        <ambientLight intensity={0.5} color="#FFD700" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            fontSize={2}
            color="#FFD700"
            position={[0, 2.5, 0]}
            maxWidth={10}
            textAlign="center"
          >
            HAPPY CHINESE NEW YEAR
            恭喜发财
          </Text>
        </Float>

        {/* Lanterns */}
        <Lantern position={[-3, 0, 0]} />
        <Lantern position={[3, 0.5, 0]} />
        <Lantern position={[-6, 1, -2]} />
        <Lantern position={[6, -0.5, -2]} />
        <Lantern position={[0, -2, 1]} />
        
        {/* Background Lanterns */}
        <Lantern position={[-2, 3, -5]} />
        <Lantern position={[2, 4, -5]} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} radius={0.5} />
        </EffectComposer>

        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
      
      <div className="absolute bottom-10 w-full text-center pointer-events-none">
        <h2 className="text-[#FFD700] font-serif text-xl tracking-widest">YEAR OF THE SNAKE</h2>
      </div>
    </div>
  );
};
