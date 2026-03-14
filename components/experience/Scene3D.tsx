"use client";

import React, { useRef, useLayoutEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  PerspectiveCamera,
  Environment,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CYAN = "#22D3EE";

const scanShaderMaterial = (): THREE.ShaderMaterial =>
  new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(CYAN) },
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        float scanLine = smoothstep(0.9, 1.0, sin(vPosition.y * 10.0 + uTime * 2.0));
        float alpha = 0.2 + scanLine * 0.5;
        vec3 finalColor = mix(uColor * 0.5, uColor * 2.0, scanLine);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });

/** Placeholder patient: capsule (torso) + sphere (head). Replace with useGLTF("/models/patient.glb") when you have a model. */
function PatientModel() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const sharedMaterial = useMemo(() => scanShaderMaterial(), []);
  materialRef.current = sharedMaterial;

  useFrame((_, delta) => {
    if (sharedMaterial.uniforms?.uTime) {
      sharedMaterial.uniforms.uTime.value += delta;
    }
  });

  useLayoutEffect(() => {
    const el = groupRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(el.position, { x: 1.5, y: -0.5, z: 0 }, 0)
      .to(el.rotation, { y: Math.PI * 1.5 }, 0)
      .to(el.scale, { x: 2.2, y: 2.2, z: 2.2 }, 0.5);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <group ref={groupRef} position={[0, -1.5, 0]} scale={2}>
      {/* Torso - capsule-like: cylinder + two half-spheres would be ideal; using capsule if available else cylinder */}
      <mesh material={sharedMaterial}>
        <capsuleGeometry args={[0.25, 0.6, 4, 8]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.55, 0]} material={sharedMaterial}>
        <sphereGeometry args={[0.28, 16, 16]} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color={CYAN} />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
        <PatientModel />
      </Float>
      <Sparkles count={80} scale={8} size={1} color={CYAN} opacity={0.4} />
      <Environment preset="night" />
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020617]">
      <div className="absolute inset-0 pointer-events-none z-10 border-[20px] border-cyan-500/5">
        <div className="absolute top-10 left-10 text-cyan-400 font-mono text-xs space-y-1">
          <p className="animate-pulse">● SYSTEM_SCAN_ACTIVE</p>
          <p>PATIENT_ID: 882-X</p>
          <p>BIO_METRICS: STABLE</p>
        </div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-cyan-500/20 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 border-t-2 border-cyan-400 rounded-full animate-spin" />
        </div>
      </div>

      <Canvas shadows>
        <SceneContent />
      </Canvas>

      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]"
        aria-hidden
      />
    </div>
  );
}
