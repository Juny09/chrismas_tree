import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { Lights } from './Lights';

interface ExperienceProps {
  userPhotos?: string[];
  onGiftCardClick?: () => void;
}

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
            opacity={0.7} 
            scale={20} 
            blur={2} 
            far={4} 
            resolution={256} 
            color="#000000" 
          />
          
          {/* Environment for reflections on gold */}
          <Environment preset="city" />

          {/* Cinematic Post Processing inside Suspense to ensure scene is ready */}
          <group>
             <EffectComposer disableNormalPass>
              <Bloom 
                luminanceThreshold={1.1} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
              />
              <Vignette eskil={false} offset={0.1} darkness={0.6} />
              <Noise opacity={0.02} /> 
            </EffectComposer>
          </group>
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          target={[0, -0.5, 0]}
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
