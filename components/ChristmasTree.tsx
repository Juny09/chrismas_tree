import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Instance, Instances, Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// --- Materials ---

const emeraldMaterial = new THREE.MeshStandardMaterial({
  color: "#002415", // Darker, richer emerald
  roughness: 0.7,
  metalness: 0.1,
  flatShading: true,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: "#FFD700",
  metalness: 1,
  roughness: 0.1,
  emissive: "#B8860B",
  emissiveIntensity: 0.2,
});

const crystalMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ffffff",
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.95,
  thickness: 1.5,
  ior: 1.5,
  clearcoat: 1,
  attenuationColor: new THREE.Color("#eeffff"),
  attenuationDistance: 1,
});

const ribbonMaterial = new THREE.MeshStandardMaterial({
  color: "#FCE7A4",
  metalness: 0.8,
  roughness: 0.2,
  side: THREE.DoubleSide,
});

// Gift Materials
const giftRedMaterial = new THREE.MeshStandardMaterial({ color: "#B71C1C", metalness: 0.4, roughness: 0.6 });
const giftGreenMaterial = new THREE.MeshStandardMaterial({ color: "#064e3b", metalness: 0.4, roughness: 0.6 });
const giftRibbon = new THREE.MeshStandardMaterial({ color: "#FFD700", metalness: 1, roughness: 0.2 });

// Doll Materials
const brownMaterial = new THREE.MeshStandardMaterial({ color: "#8B4513", roughness: 0.9 });
const whiteMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.9 });
const redClothMaterial = new THREE.MeshStandardMaterial({ color: "#D32F2F", roughness: 0.8 });
const noseMaterial = new THREE.MeshStandardMaterial({ color: "#FF0000", roughness: 0.5 });
const blackMaterial = new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.5 });

// --- Components ---

const Ribbon: React.FC = () => {
  const curve = useMemo(() => {
    const points = [];
    const turns = 5;
    const height = 6.5; 
    const yStart = 3.5; 
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * turns;
      const y = yStart - (t * height);
      const r = 0.2 + (t * 2.6);
      points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <tubeGeometry args={[curve, 128, 0.12, 8, false]} />
      <primitive object={ribbonMaterial} />
    </mesh>
  );
};

interface TreeLayerProps {
  position: [number, number, number];
  scale: number;
  rotationOffset: number;
}

const TreeLayer: React.FC<TreeLayerProps> = ({ position, scale, rotationOffset }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationOffset + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      scale={[scale, scale, scale]} 
      castShadow 
      receiveShadow
      material={emeraldMaterial}
    >
      <coneGeometry args={[1.5, 2.2, 9]} />
    </mesh>
  );
};

// --- Snow Component ---
const Snow = () => {
  const count = 1500; // Optimized count for performance
  const mesh = useRef<THREE.Points>(null);
  
  // Custom shader or just smarter attribute management
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const speeds = new Float32Array(count); // Store speed per particle
    const offsets = new Float32Array(count); // Store random offsets for wiggle
    
    for (let i = 0; i < count; i++) {
      // Much wider spread to cover the whole environment
      temp[i * 3] = (Math.random() - 0.5) * 50; // x spread (-25 to 25)
      temp[i * 3 + 1] = Math.random() * 40 - 10; // y spread (-10 to 30)
      temp[i * 3 + 2] = (Math.random() - 0.5) * 50; // z spread (-25 to 25)
      
      speeds[i] = 0.5 + Math.random() * 1.5; // Random fall speed
      offsets[i] = Math.random() * 100; // Random offset for wave motion
    }
    return { positions: temp, speeds, offsets };
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    // Safely access geometry attributes
    const geometry = mesh.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Time for sine wave calculation
    // const time = state.clock.getElapsedTime(); // Unused for simple fall
    
    for(let i=0; i<count; i++) {
       // Update Y (Fall)
       let y = positions[i*3+1];
       y -= delta * particles.speeds[i];
       
       // Reset if below ground
       // Use a varied reset height so they don't fall in sheets
       if(y < -5) {
         y = 25 + Math.random() * 5; 
         // Also randomize X/Z slightly on reset to avoid patterns
         positions[i*3] = (Math.random() - 0.5) * 50;
         positions[i*3+2] = (Math.random() - 0.5) * 50;
       }
       
       positions[i*3+1] = y;
    }
    
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.2} 
        color="#fff" 
        transparent 
        opacity={0.8} 
        sizeAttenuation={true} 
        map={null}
        alphaTest={0.5}
      />
    </points>
  )
}

// --- 3D Snow Floor Component ---
const SnowFloor: React.FC = () => {
  // Generate random snow mounds (drifts)
  const mounds = useMemo(() => {
    const R = 4; // Match the new floor radius
    return Array.from({ length: 15 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 2.5 + Math.random() * 6; // Outside the immediate tree area
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      // Calculate y to sit on the curved surface: y = -R + sqrt(R^2 - x^2 - z^2)
      // Note: x^2 + z^2 = distance^2
      const y = -R + Math.sqrt(Math.max(0, R*R - distance*distance));
      
      const scale = 1 + Math.random() * 2;
      return { position: [x, y - 0.2, z] as [number, number, number], scale };
    });
  }, []);

  return (
    <group>
      {/* Main Curved Ground (Huge Sphere Cap) for Horizon Effect */}
      {/* Radius reduced to 14 to make the curve steeper (horizon drops faster) */}
      <mesh position={[0, -14, 0]} receiveShadow>
         <sphereGeometry args={[14, 48, 48, 0, Math.PI * 2, 0, 0.5]} />
         <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Random Snow Mounds/Drifts */}
      {mounds.map((mound, i) => (
        <mesh key={i} position={mound.position} scale={[mound.scale, mound.scale * 0.3, mound.scale]} receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}

      {/* Base Mounds near Tree */}
      <mesh position={[0, -0.2, 0]} scale={[2.5, 0.3, 2.5]} receiveShadow>
         <sphereGeometry args={[1, 32, 16]} />
         <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
};

// --- Dolls & Decorations ---

const SantaDoll: React.FC<{ position: [number, number, number], scale?: number, rotation?: [number, number, number] }> = ({ position, scale = 1, rotation = [0,0,0] }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.4, 0.8, 16]} />
        <primitive object={redClothMaterial} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <primitive object={whiteMaterial} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 0.7, 0]} rotation={[-0.2, 0, 0]}>
        <coneGeometry args={[0.26, 0.5, 16]} />
        <primitive object={redClothMaterial} />
      </mesh>
      {/* PomPom */}
      <mesh position={[0, 0.95, -0.1]}>
        <sphereGeometry args={[0.08]} />
        <primitive object={whiteMaterial} />
      </mesh>
    </group>
  );
};

const DeerDoll: React.FC<{ position: [number, number, number], scale?: number, rotation?: [number, number, number] }> = ({ position, scale = 1, rotation = [0,0,0] }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
        <primitive object={brownMaterial} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0, 0.2]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><primitive object={brownMaterial} /></mesh>
      <mesh position={[0.15, 0, 0.2]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><primitive object={brownMaterial} /></mesh>
      <mesh position={[-0.15, 0, -0.2]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><primitive object={brownMaterial} /></mesh>
      <mesh position={[0.15, 0, -0.2]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><primitive object={brownMaterial} /></mesh>
      {/* Head */}
      <mesh position={[0, 0.6, 0.35]}>
        <sphereGeometry args={[0.18]} />
        <primitive object={brownMaterial} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.65, 0.5]}>
        <sphereGeometry args={[0.05]} />
        <primitive object={noseMaterial} />
      </mesh>
      {/* Antlers */}
      <mesh position={[0.15, 0.8, 0.3]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <primitive object={goldMaterial} />
      </mesh>
      <mesh position={[-0.15, 0.8, 0.3]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <primitive object={goldMaterial} />
      </mesh>
    </group>
  );
};

const Sock: React.FC<{ position: [number, number, number], scale?: number, rotation?: [number, number, number] }> = ({ position, scale = 1, rotation = [0,0,0] }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={rotation}>
      {/* Leg */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.6]} />
        <primitive object={redClothMaterial} />
      </mesh>
      {/* Foot */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4]} />
        <primitive object={redClothMaterial} />
      </mesh>
      {/* Heel */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.125]} />
        <primitive object={redClothMaterial} />
      </mesh>
      {/* Cuff */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.15]} />
        <primitive object={whiteMaterial} />
      </mesh>
    </group>
  );
};

const PhotoFrame: React.FC<{ position: [number, number, number], url: string, scale?: number }> = ({ position, url, scale = 1 }) => {
  return (
    <Billboard position={position} scale={[scale, scale, scale]} follow={true} lockX={false} lockY={false} lockZ={false}>
      <group>
        {/* Frame */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.3, 1.5, 0.1]} />
          <primitive object={goldMaterial} />
        </mesh>
        {/* Photo */}
        <Image url={url} scale={[1, 1.2]} transparent opacity={1} />
        {/* Hanging String */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6]} />
          <primitive object={goldMaterial} />
        </mesh>
        {/* Back Glow */}
        <mesh position={[0, 0, -0.1]}>
           <planeGeometry args={[1.5, 1.7]} />
           <meshBasicMaterial color="#FFD700" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Billboard>
  );
};

const GiftCardDecoration: React.FC<{ position: [number, number, number], scale?: number, onClick?: () => void }> = ({ position, scale = 1, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  // Cursor pointer logic
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; }
  }, [hovered]);

  return (
    <group 
      position={position} 
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
         {/* Card Body */}
         <mesh rotation={[0, 0, 0.1]} castShadow receiveShadow>
           <boxGeometry args={[0.8, 0.5, 0.05]} />
           <meshStandardMaterial color="#0f1c15" roughness={0.3} metalness={0.5} />
         </mesh>
         {/* Gold Border/Detail */}
         <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0.1]}>
           <planeGeometry args={[0.7, 0.4]} />
           <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
         </mesh>
         {/* Dark center for text contrast */}
         <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0.1]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshStandardMaterial color="#0f1c15" />
         </mesh>
         {/* "GIFT" text representation - gold strips */}
         <mesh position={[0, 0.05, 0.05]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.4, 0.05, 0.02]} />
            <meshStandardMaterial color="#FFD700" />
         </mesh>
         <mesh position={[0, -0.05, 0.05]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.3, 0.03, 0.02]} />
            <meshStandardMaterial color="#FFD700" />
         </mesh>
         
         {/* Magical Glow */}
         {hovered && (
             <Sparkles count={20} scale={1.5} size={2} speed={0.4} opacity={1} color="#FFD700" />
         )}
      </Float>
    </group>
  );
};

// --- Main Tree Component ---

interface ChristmasTreeProps {
  userPhotos?: string[];
  onGiftCardClick?: () => void;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ userPhotos = [], onGiftCardClick }) => {
  // Generate ornament positions
  const { goldOrnaments, crystalOrnaments } = useMemo(() => {
    const gold = [];
    const crystal = [];
    const layers = 6;
    
    for (let i = 0; i < layers; i++) {
      const yBase = i * 1.0 - 2.5; 
      const count = 5 + i * 3;
      
      for (let j = 0; j < count; j++) {
        const theta = (j / count) * Math.PI * 2 + (i * 0.5);
        const y = yBase + (Math.random() - 0.5) * 0.5;
        const taper = Math.max(0, (3.5 - y) / 5); 
        const r = taper * 3.5 * (0.8 + Math.random() * 0.2);

        if (r < 0.2) continue;

        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        const scale = Math.random() * 0.12 + 0.08;
        const item = { position: [x, y, z], scale };

        if (Math.random() > 0.3) {
          gold.push(item);
        } else {
          crystal.push(item);
        }
      }
    }
    return { goldOrnaments: gold, crystalOrnaments: crystal };
  }, []);

  // Generate Photo Positions (Sparse, spiral)
  const photoPositions = useMemo(() => {
    const pos = [];
    const count = Math.max(userPhotos.length, 3); // Reserve at least 3 spots
    for(let i=0; i<count; i++) {
        const y = -1 + (i * 1.2); // Spread vertically
        const theta = i * 2.5;
        const taper = Math.max(0, (3.5 - y) / 5);
        const r = taper * 3.5 * 1.1; // Slightly outside
        pos.push([Math.cos(theta)*r, y, Math.sin(theta)*r]);
    }
    return pos;
  }, [userPhotos.length]);

  return (
    <group position={[0, -1.5, 0]}>
      {/* Falling Snow Animation */}
      <Snow />

      {/* Interactive Gift Card Hanging on Tree - Moved to front and enlarged */}
      <GiftCardDecoration position={[0, -0.2, 2.2]} scale={1.5} onClick={onGiftCardClick} />

      {/* Tree Layers */}
      <TreeLayer position={[0, -1.5, 0]} scale={2.3} rotationOffset={0} />
      <TreeLayer position={[0, -0.2, 0]} scale={1.9} rotationOffset={1} />
      <TreeLayer position={[0, 1.1, 0]} scale={1.5} rotationOffset={2} />
      <TreeLayer position={[0, 2.2, 0]} scale={1.1} rotationOffset={3} />
      <TreeLayer position={[0, 3.1, 0]} scale={0.7} rotationOffset={4} />

      {/* Luxury Ribbon */}
      <Ribbon />

      {/* Gold Ornaments */}
      <Instances range={100} geometry={new THREE.SphereGeometry(1, 24, 24)} material={goldMaterial}>
        {goldOrnaments.map((data, i) => (
          <Instance 
            key={`gold-${i}`} 
            position={data.position as [number, number, number]} 
            scale={[data.scale, data.scale, data.scale]} 
          />
        ))}
      </Instances>

      {/* Crystal Ornaments */}
      <Instances range={50} geometry={new THREE.OctahedronGeometry(1)} material={crystalMaterial}>
        {crystalOrnaments.map((data, i) => (
          <Instance 
            key={`crys-${i}`} 
            position={data.position as [number, number, number]} 
            scale={[data.scale * 1.2, data.scale * 1.2, data.scale * 1.2]} 
          />
        ))}
      </Instances>

      {/* User Photos */}
      {userPhotos.map((url, i) => (
        <PhotoFrame 
          key={`photo-${i}`} 
          url={url} 
          position={photoPositions[i % photoPositions.length] as [number, number, number]} 
          scale={0.5} 
        />
      ))}

      {/* Special Dolls - Scaled Up Significantly (approx 3x) */}
      <SantaDoll position={[1.2, -1.5, 1.2]} scale={1.2} rotation={[0, -Math.PI/4, 0]} />
      <SantaDoll position={[-0.7, 0.5, 1.6]} scale={0.9} rotation={[0, Math.PI/4, 0]} />
      
      <DeerDoll position={[-2.5, -2.2, 0.8]} scale={1.5} rotation={[0, Math.PI/2, 0]} />
      <DeerDoll position={[1.0, -0.5, 1.5]} scale={1.0} rotation={[0, -0.2, 0]} />

      <Sock position={[0, 1.5, 1.2]} scale={0.9} rotation={[0, 0, -0.2]} />
      <Sock position={[-1.0, -0.5, 1.4]} scale={0.9} rotation={[0, 0, 0.2]} />

      {/* The Star */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2} floatingRange={[0, 0.2]}>
        <group position={[0, 4.3, 0]}>
          <mesh>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#FFF5D1" emissive="#FFF5D1" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.02, 16, 32]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
           <pointLight intensity={5} color="#fff" distance={3} decay={2} />
        </group>
      </Float>

      {/* Floating Magic Dust */}
      <Sparkles 
        count={200} 
        scale={[6, 8, 6]} 
        size={3} 
        speed={0.2} 
        opacity={0.5}
        color="#FCE7A4"
        position={[0, 1, 0]}
      />

      {/* Floor Gifts (Massive Pile) & Snowy Ground */}
      <group position={[0, -2.6, 0]}>
        {/* Snowy Ground */}
        <SnowFloor />

        {/* Original Gifts */}
        <mesh position={[-1.2, 0, 0.6]} castShadow><boxGeometry args={[0.7, 0.5, 0.7]} /><primitive object={giftRedMaterial} /></mesh>
        <mesh position={[-1.2, 0.26, 0.6]} castShadow><boxGeometry args={[0.72, 0.04, 0.12]} /><primitive object={giftRibbon} /></mesh>
        <mesh position={[-1.2, 0.26, 0.6]} rotation={[0, Math.PI/2, 0]} castShadow><boxGeometry args={[0.72, 0.04, 0.12]} /><primitive object={giftRibbon} /></mesh>

        <mesh position={[1.1, 0, -0.8]} castShadow><boxGeometry args={[0.6, 0.45, 0.6]} /><primitive object={giftGreenMaterial} /></mesh>
        <mesh position={[1.1, 0.24, -0.8]} castShadow><boxGeometry args={[0.62, 0.04, 0.1]} /><primitive object={giftRibbon} /></mesh>
        <mesh position={[1.1, 0.24, -0.8]} rotation={[0, Math.PI/2, 0]} castShadow><boxGeometry args={[0.62, 0.04, 0.1]} /><primitive object={giftRibbon} /></mesh>

        <mesh position={[0.2, 0, 1.2]} castShadow><boxGeometry args={[0.4, 0.35, 0.4]} /><primitive object={goldMaterial} /></mesh>
        <mesh position={[0.2, 0.2, 1.2]} castShadow><boxGeometry args={[0.42, 0.03, 0.08]} /><primitive object={giftRibbon} /></mesh>
        <mesh position={[0.2, 0.2, 1.2]} rotation={[0, Math.PI/2, 0]} castShadow><boxGeometry args={[0.42, 0.03, 0.08]} /><primitive object={giftRibbon} /></mesh>

        <mesh position={[-0.8, -0.1, -1.2]} castShadow><boxGeometry args={[1.0, 0.3, 0.8]} /><primitive object={giftRedMaterial} /></mesh>
        <mesh position={[-0.8, 0.06, -1.2]} castShadow><boxGeometry args={[1.02, 0.03, 0.15]} /><primitive object={giftRibbon} /></mesh>
        
        <mesh position={[1.4, 0.2, 0.5]} rotation={[0, 0.5, 0]} castShadow><boxGeometry args={[0.5, 0.8, 0.5]} /><primitive object={giftGreenMaterial} /></mesh>
        <mesh position={[1.4, 0.61, 0.5]} rotation={[0, 0.5, 0]} castShadow><boxGeometry args={[0.52, 0.03, 0.1]} /><primitive object={giftRibbon} /></mesh>

        {/* Additional Random Gifts to fill the floor */}
        {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r = 2.0 + Math.random() * 1.5;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const scale = 0.4 + Math.random() * 0.4;
            const mat = Math.random() > 0.5 ? giftRedMaterial : (Math.random() > 0.5 ? giftGreenMaterial : goldMaterial);
            
            return (
              <group key={i} position={[x, -0.2, z]} rotation={[0, Math.random() * Math.PI, 0]}>
                 <mesh castShadow>
                    <boxGeometry args={[scale, scale * 0.8, scale]} />
                    <primitive object={mat} />
                 </mesh>
                 <mesh position={[0, scale * 0.4 + 0.01, 0]}>
                    <boxGeometry args={[scale * 1.05, 0.02, scale * 0.2]} />
                    <primitive object={giftRibbon} />
                 </mesh>
                 <mesh position={[0, scale * 0.4 + 0.01, 0]} rotation={[0, Math.PI/2, 0]}>
                    <boxGeometry args={[scale * 1.05, 0.02, scale * 0.2]} />
                    <primitive object={giftRibbon} />
                 </mesh>
              </group>
            )
        })}
      </group>
    </group>
  );
};
