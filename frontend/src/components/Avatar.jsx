import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  useAnimations,
  Environment, 
  PresentationControls,
  OrbitControls,
  SpotLight,
  ContactShadows,
  Float,
  useTexture
} from '@react-three/drei';

export const Avatar = ({emotion = 'neutral', isPlaying = false}) => {
  const group = useRef();
  const { nodes, materials } = useGLTF('/models/67844da6291d1c6abc1e2069.glb');
  const { animations } = useGLTF('/models/animations.glb');
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    console.log('Available animations:', names);
    console.log('Actions:', actions);
  }, [names, actions]);

  useEffect(() => {
    console.log('Current emotion:', emotion);
    console.log('Is playing:', isPlaying);
  }, [emotion, isPlaying]);

  const emotionMappings = {
    happy: {
      morphTargets: {
        mouthSmile: 1,
        eyeSquint: 0.5
      },
      animation: 'Talking'
    },
    sad: {
      morphTargets: {
        mouthFrown: 1,
        browInnerUp: 0.5
      },
      animation: 'Talking'
    },
    excited: {
      morphTargets: {
        eyeWide: 1,
        mouthSmile: 1
      },
      animation: 'Talking'
    },
    angry: {
      morphTargets: {
        browDown: 1,
        mouthFrown: 0.7
      },
      animation: 'Talking'
    },
    neutral: {
      morphTargets: {},
      animation: 'Talking'
    },
    curious: {
      morphTargets: {
        browRaised: 0.7,
        eyeWide: 0.3
      },
      animation: 'Talking'
    }
  };

  useEffect(() => {
    // Set the avatar's position and rotation to face the camera
    if (group.current) {
      group.current.position.y = -1;  // Position avatar properly
      group.current.rotation.y = 20;  // Rotate avatar to face the camera
    }

    const currentEmotion = emotionMappings[emotion] || emotionMappings.neutral;

    // Apply morphTargets for facial expressions
    if (nodes.Wolf3D_Head.morphTargetDictionary) {
      Object.entries(currentEmotion.morphTargets).forEach(([target, value]) => {
        const idx = nodes.Wolf3D_Head.morphTargetDictionary[target];
        if (typeof idx !== 'undefined') {
          nodes.Wolf3D_Head.morphTargetInfluences[idx] = value;
        }
      });
    }

    // Play the first animation by default
    // if (names.length > 0) {
    //   const action = actions[names[0]];
    //   if (action) {
    //     action.reset().fadeIn(0.5).play();
    //   }
    // }

    // Handle animation based on audio playing state
    if (isPlaying) {
      // Play emotion-specific talking animation
      const animationName = currentEmotion.animation;
      if (actions[animationName]) {
        Object.values(actions).forEach(action => action.stop());
        actions[animationName].reset().fadeIn(0.5).play();
      }
    } else {
      // Return to idle animation when not talking
      if (actions.idle) {
        Object.values(actions).forEach(action => action.fadeOut(0.5));
        actions.idle.reset().fadeIn(0.5).play();
      }
    }

    return () => {
      Object.values(actions).forEach(action => {
        action.fadeOut(0.5);
      });
    };
  }, [actions, isPlaying, emotion]);

  return (
    // <Float
    //   speed={1.5}
    //   rotationIntensity={0.2}
    //   floatIntensity={0.2}
    // >
      <group ref={group} dispose={null}>
        <primitive object={nodes.Hips} />
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      </group>
    // </Float>
  );
};

const Background = () => {
  const bgTexture = useTexture('/textures/riad.jpeg');
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial 
        map={bgTexture} 
        depthTest={true}  // Enable depth testing
        depthWrite={false}
      />
    </mesh>
  );
};

export const AvatarScene = ({ emotion, isPlaying }) => {
  // const texture = useTexture('/textures/riad.jpeg');
  // const viewport = useThree((state) => state.viewport);
  return (
    <Canvas
      camera={{ position: [0, 1.5, 3], fov: 25 }}   // Position the camera initially
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      {/* <color attach="background" args={['#fff']} /> */}
      <Background />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <SpotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      {/* Avatar with controls */}
      <PresentationControls
        global
        zoom={1.2}
        rotation={[0, -Math.PI / 6, 0]}
        polar={[-Math.PI / 6, Math.PI / 6]}
        azimuth={[-Math.PI / 6, Math.PI / 6]}
      >
        <group position={[0, -0.5, 0]}>
          <Avatar emotion={emotion} isPlaying={isPlaying} />
        </group>
      </PresentationControls>

      {/* Environment and shadows */}
      <ContactShadows
      opacity={0.5} 
      scale={5} 
      blur={2.4} 
      position={[0, -1.49, 0]} 
      />
      <Environment preset="apartment" />

      {/* Orbit Controls for interactive rotation */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        makeDefault
      />
    </Canvas>
  );
};

useGLTF.preload('/models/67844da6291d1c6abc1e2069.glb');
useGLTF.preload("/models/animations.glb");