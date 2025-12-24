import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { Lights } from './Lights';

interface ExperienceProps {
  userPhotos?: string[];
  onGiftCardClick?: () => void;
}

const Controls = () => {
  const controlsRef = useRef<CameraControls>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useFrame((_, delta) => {
    if (controlsRef.current && !isInteracting) {
      controlsRef.current.azimuthAngle += 0.2 * delta; 
    }
  });

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      dollyToCursor={true}
      minDistance={2}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 1.9}
      onStart={() => setIsInteracting(true)}
      onEnd={() => setTimeout(() => setIsInteracting(false), 1000)} // Delay resume
      dollySpeed={0.5}
      smoothTime={0.25} // Adds damping feel
    />
  );
};

export const Experience: React.FC<ExperienceProps> = ({ userPhotos = [], onGiftCardClick }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 12], fov: 35 }}
        dpr={[1, 1.5]} // Optimize pixel ratio for performance
        gl={{ antialias: false, alpha: false, stencil: false }} // Post-processing handles AA
      >
        <color attach="background" args={['#020403']} />
        
        <Suspense fallback={null}>
          <ChristmasTree userPhotos={userPhotos} onGiftCardClick={onGiftCardClick} />
          <Lights />
          
          <ContactShadows 
            opacity={0.6} 
            scale={20} 
            blur={2.5} 
            far={4} 
            resolution={128} 
            color="#000000" 
          />
          
          {/* Environment for reflections on gold */}
          <Environment preset="city" />

          {/* Cinematic Post Processing inside Suspense to ensure scene is ready */}
          <group>
             <EffectComposer disableNormalPass>
              <Bloom 
                luminanceThreshold={1.5} 
                mipmapBlur 
                intensity={1.2} 
                radius={0.4}
              />
              <Vignette eskil={false} offset={0.1} darkness={0.5} />
              <Noise opacity={0.02} /> 
            </EffectComposer>
          </group>
        </Suspense>

        <Controls />
      </Canvas>
    </div>
  );
};
