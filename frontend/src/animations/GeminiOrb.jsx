import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const OrbMesh = () => {
  const meshRef  = useRef();
  const lightRef = useRef();

  // Custom shader material in Google colors
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uColor1: { value: new THREE.Color('#4285F4') },
      uColor2: { value: new THREE.Color('#8B5CF6') },
      uColor3: { value: new THREE.Color('#EA4335') }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g  = step(x0.yzx, x0.xyz);
        vec3 l  = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x  = x_ * ns.x + ns.yyyy;
        vec4 y  = y_ * ns.x + ns.yyyy;
        vec4 h  = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vNormal   = normal;
        vPosition = position;
        float noise = snoise(position * 1.5 + uTime * 0.3) * 0.25;
        vec3 newPos = position + normal * noise;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3  uColor1;
      uniform vec3  uColor2;
      uniform vec3  uColor3;
      varying vec3  vNormal;
      varying vec3  vPosition;

      void main() {
        float t1 = sin(uTime * 0.5) * 0.5 + 0.5;
        float t2 = cos(uTime * 0.3) * 0.5 + 0.5;
        vec3  col  = mix(uColor1, uColor2, t1);
        col = mix(col, uColor3, t2 * 0.4);
        float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0);
        col += fresnel * 0.3;
        gl_FragColor = vec4(col, 0.92);
      }
    `,
    transparent: true
  }), []);

  useFrame(({ clock, mouse }) => {
    if (!meshRef.current) return;
    material.uniforms.uTime.value = clock.getElapsedTime();
    meshRef.current.rotation.y += 0.004;
    meshRef.current.rotation.x += 0.002;
    // Subtle mouse reaction
    meshRef.current.rotation.y += mouse.x * 0.002;
    meshRef.current.rotation.x += mouse.y * 0.002;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1.8, 128, 128]} />
    </mesh>
  );
};

const GeminiOrb = ({ size = '400px', className = '' }) => (
  <div style={{ width: size, height: size }} className={`animate-float ${className}`}>
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]}  intensity={1.5} color="#4285F4" />
      <pointLight position={[-5, -5, 5]} intensity={1}  color="#8B5CF6" />
      <OrbMesh />
    </Canvas>
  </div>
);

export default GeminiOrb;