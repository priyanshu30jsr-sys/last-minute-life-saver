import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { truncate } from '../utils/helpers';

const MEDAL  = ['🥇', '🥈', '🥉'];
const COLORS_HEX = ['#FBBC04', '#9CA3AF', '#CD7F32'];
const COLORS_3D  = [0xFBBC04,  0x9CA3AF,  0xCD7F32];
// Visual order on podium: 2nd (left), 1st (center), 3rd (right)
const VISUAL_ORDER = [1, 0, 2];
const HEIGHTS      = [2.8, 4.0, 1.9];
const POSITIONS_X  = [-2.8, 0, 2.8];

const PriorityPodium = ({ plans = [] }) => {
  const mountRef = useRef(null);

  // Extract plans criteria safely
  const activePlans = plans.filter(p => p.status !== 'completed');
  const plansKey = activePlans.map(p => `${p._id}-${p.priorityScore}`).join(',');

  useEffect(() => {
    if (!mountRef.current) return;

    // Process top 3 calculation inside the hook to keep operations deterministic
    const top3 = [...plans]
      .filter(p => p.status !== 'completed')
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 3);

    if (top3.length === 0) return;

    const W = mountRef.current.clientWidth;
    const H = 210;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const gold = new THREE.PointLight(0xFBBC04, 2.5, 25);
    gold.position.set(0, 8, 4);
    scene.add(gold);
    const fill = new THREE.DirectionalLight(0x4285F4, 0.5);
    fill.position.set(-4, 3, 3);
    scene.add(fill);

    // =========================================================================
    // ✅ CRITICAL FIX: Direct instantiation without using Object.assign
    // =========================================================================
    const groundGeo = new THREE.PlaneGeometry(12, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0d1120, opacity: 0.45, transparent: true });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    
    // Assign properties directly to avoid throwing read-only exceptions
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -0.01, 0);
    scene.add(groundMesh);

    // Build podium blocks in visual order
    const blocks = [];
    VISUAL_ORDER.forEach((rankIdx) => {
      if (!top3[rankIdx]) return;
      const targetH = HEIGHTS[rankIdx];
      const posX    = POSITIONS_X[VISUAL_ORDER.indexOf(rankIdx)];

      const geo  = new THREE.BoxGeometry(2.0, 1, 1.8);
      const mat  = new THREE.MeshStandardMaterial({
        color:    COLORS_3D[rankIdx],
        metalness: 0.55,
        roughness: 0.30
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.y = 0.001;
      mesh.position.set(posX, 0, 0);
      scene.add(mesh);
      blocks.push({ mesh, targetH, rankIdx });
    });

    let animFrame;
    const clock = new THREE.Clock();
    let elapsed = 0;

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      elapsed  += clock.getDelta();

      blocks.forEach(({ mesh, targetH }, i) => {
        const delay    = i * 0.12;
        const progress = Math.min(1, Math.max(0, (elapsed - delay) * 0.9));
        const eased    = 1 - Math.pow(1 - progress, 3);
        const h        = Math.max(eased * targetH, 0.001);
        mesh.scale.y   = h;
        mesh.position.y = h / 2;
      });

      camera.position.x = Math.sin(elapsed * 0.05) * 2;
      camera.lookAt(0, 2, 0);
      renderer.render(scene, camera);
    };
    animate();

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
      if (mountRef.current && renderer.domElement) {
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [plansKey]); // Hook dependency relies safely on primitive content changes

  // Derive static layout elements outside the hook for React UI loops
  const top3Static = [...plans]
    .filter(p => p.status !== 'completed')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  if (top3Static.length === 0) return null;

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: 210 }}
        className="rounded-xl overflow-hidden" />

      {/* Labels under podium — same visual order */}
      <div className="flex justify-center gap-3 mt-3">
        {VISUAL_ORDER.map((rankIdx) => {
          const plan = top3Static[rankIdx];
          if (!plan) return null;
          return (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + rankIdx * 0.1 }}
              className="flex flex-col items-center gap-1 w-24 text-center"
            >
              <span className="text-xl leading-none">{MEDAL[rankIdx]}</span>
              <p className="text-xs font-bold leading-tight"
                style={{ color: COLORS_HEX[rankIdx] }}>
                {truncate(plan.title, 22)}
              </p>
              <p className="text-white/30 text-[10px]">
                {plan.priorityScore}/10
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityPodium;