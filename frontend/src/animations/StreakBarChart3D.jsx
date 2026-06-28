import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const StreakBarChart3D = ({ data = [] }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || data.length === 0) return;

    const W = mountRef.current.clientWidth;
    const H = 280;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Scene + camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    camera.position.set(0, 9, 22);
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dLight = new THREE.DirectionalLight(0x4285F4, 1.4);
    dLight.position.set(6, 12, 8);
    scene.add(dLight);
    const pLight = new THREE.PointLight(0x8B5CF6, 1.2, 40);
    pLight.position.set(-8, 6, 4);
    scene.add(pLight);

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(data.length * 0.8 + 2, 14),
      new THREE.MeshStandardMaterial({ color: 0x0d1120, opacity: 0.5, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    // Color helper
    const maxVal  = Math.max(...data.map(d => d.count), 1);
    const getColor = (v) => {
      const t = v / maxVal;
      if (t >= 0.75) return new THREE.Color('#34A853');
      if (t >= 0.45) return new THREE.Color('#4285F4');
      if (t >= 0.15) return new THREE.Color('#8B5CF6');
      return new THREE.Color('#1e2535');
    };

    // Build bars
    const spacing = 0.75;
    const barW    = 0.52;
    const offsetX = -((data.length - 1) * spacing) / 2;
    const bars    = [];

    data.forEach((d, i) => {
      const targetH = Math.max(d.count * 1.6, 0.06);
      const color   = getColor(d.count);

      // Main bar
      const geo  = new THREE.BoxGeometry(barW, 1, barW);
      const mat  = new THREE.MeshStandardMaterial({
        color, metalness: 0.25, roughness: 0.45, transparent: true, opacity: 0.92
      });
      const bar  = new THREE.Mesh(geo, mat);
      bar.scale.y = 0.001;
      bar.position.set(offsetX + i * spacing, 0, 0);
      scene.add(bar);

      // Glowing top cap
      const capGeo = new THREE.BoxGeometry(barW + 0.06, 0.05, barW + 0.06);
      const capMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.7
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.5;
      bar.add(cap);

      bars.push({ bar, cap, targetH, h: 0 });
    });

    // Animation
    let animFrame;
    let elapsed = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      elapsed  += clock.getDelta();

      bars.forEach(({ bar, cap, targetH }, i) => {
        const delay    = i * 0.03;
        const progress = Math.min(1, Math.max(0, (elapsed - delay) * 1.1));
        const eased    = 1 - Math.pow(1 - progress, 3);
        const h        = Math.max(eased * targetH, 0.001);

        bar.scale.y = h;
        bar.position.y = h / 2;
        cap.position.y = 0.5 / h;
      });

      // Gentle orbit
      const t = elapsed;
      camera.position.x = Math.sin(t * 0.07) * 4;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: 280 }}
      className="rounded-xl overflow-hidden" />
  );
};

export default StreakBarChart3D;