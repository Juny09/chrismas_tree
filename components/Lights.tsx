import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Lights: React.FC = () => {
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} color="#001a0f" />
      
      {/* Main warm key light */}
      <spotLight
        ref={spotLightRef}
        position={[10, 15, 10]}
        angle={0.3}
        penumbra={1}
        intensity={200}
        color="#ffecd1"
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Rim light for the "Cinematic" edge */}
      <spotLight
        position={[-10, 5, -10]}
        angle={0.5}
        penumbra={1}
        intensity={300}
        color="#00ff88"
      />
      
      {/* Fill light from below (Gold reflection simulation) */}
      <pointLight position={[0, -2, 2]} intensity={50} color="#ffaa00" distance={10} />
    </>
  );
};