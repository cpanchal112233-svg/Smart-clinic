"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createCharacter(
  scene: THREE.Scene,
  color: number,
  isDoctor: boolean
): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: isDoctor ? 0xf8fafc : color,
    roughness: 0.3,
  });

  const bodyGeo = new THREE.CylinderGeometry(0.35, 0.35, 1, 32);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);

  const capGeo = new THREE.SphereGeometry(0.35, 32, 16);
  const topCap = new THREE.Mesh(capGeo, bodyMat);
  topCap.position.y = 1;
  group.add(topCap);
  const botCap = new THREE.Mesh(capGeo, bodyMat);
  botCap.position.y = 0;
  group.add(botCap);

  const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.5,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.6;
  head.castShadow = true;
  group.add(head);

  const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.12, 1.65, 0.3);
  group.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.12, 1.65, 0.3);
  group.add(eyeR);

  if (isDoctor) {
    const stethGeo = new THREE.TorusGeometry(0.2, 0.02, 8, 32, Math.PI);
    const stethMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const steth = new THREE.Mesh(stethGeo, stethMat);
    steth.position.set(0, 1.3, 0.28);
    steth.rotation.x = Math.PI / 2;
    group.add(steth);

    const tieGeo = new THREE.BoxGeometry(0.08, 0.5, 0.05);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.7, 0.35);
    group.add(tie);
  }

  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
  const armL = new THREE.Mesh(armGeo, bodyMat);
  armL.position.set(-0.5, 0.7, 0);
  armL.rotation.z = 0.2;
  group.add(armL);
  const armR = new THREE.Mesh(armGeo, bodyMat);
  armR.position.set(0.5, 0.7, 0);
  armR.rotation.z = -0.2;
  group.add(armR);

  return group;
}

export default function DiagnosticsView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.1);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0x22d3ee, 1);
    spot.position.set(10, 10, 10);
    spot.castShadow = true;
    scene.add(spot);

    const point = new THREE.PointLight(0x3b82f6, 0.5);
    point.position.set(-5, 5, 5);
    scene.add(point);

    const doctor = createCharacter(scene, 0x3b82f6, true);
    doctor.position.set(1.2, -1, 0);
    doctor.rotation.y = -Math.PI / 6;
    scene.add(doctor);

    const patient = createCharacter(scene, 0xfbbf24, false);
    patient.position.set(-1.2, -1, 0);
    scene.add(patient);

    const scannerGroup = new THREE.Group();
    scannerGroup.position.set(-1.2, 0, 0);
    scene.add(scannerGroup);

    const ringGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scannerGroup.add(ring);

    const beamGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.1,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    scannerGroup.add(beam);

    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    scene.add(floor);

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const scroll =
        window.scrollY /
        Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );

      doctor.position.y = -1 + Math.sin(time) * 0.1;
      patient.position.y = -1 + Math.cos(time * 0.8) * 0.1;
      scannerGroup.position.y = Math.sin(time * 2) * 1.5;

      camera.position.z = 7 - scroll * 2;
      camera.position.x = scroll * 2;
      camera.lookAt(0, 0, 0);
      doctor.rotation.y = -Math.PI / 6 + scroll * (Math.PI / 2);

      renderer.render(scene, camera);
    }

    window.addEventListener("resize", onResize);
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" aria-hidden />;
}
