'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import useEduStore from '@/app/store/useEduStore';
import AvatarFallback from './AvatarFallback';

/**
 * Three.js + @pixiv/three-vrm VRM avatar canvas.
 * Loads AnnieV0.vrm (or any VRM 0/1 file from public folder).
 * Animations: idle breathing, eye blink, talking lip-sync, thinking head tilt, happy nod, pointing.
 */
export default function Avatar3DCanvas({ vrmUrl, size }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const { avatarMood } = useEduStore();
  const moodRef = useRef(avatarMood);
  const [hasError, setHasError] = useState(false);

  // Keep moodRef in sync
  useEffect(() => { moodRef.current = avatarMood; }, [avatarMood]);

  useEffect(() => {
    if (!mountRef.current || !vrmUrl) return;

    let cancelled = false;
    const ctx = {};

    async function init() {
      try {
        // Dynamic imports — these are large, load only when needed
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { VRMLoaderPlugin, VRMUtils } = await import('@pixiv/three-vrm');

        if (cancelled) return;

        const el = mountRef.current;
        const W = el.clientWidth || 400;
        const H = el.clientHeight || 500;

        // ── Renderer ─────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        el.appendChild(renderer.domElement);
        ctx.renderer = renderer;

        // ── Scene ─────────────────────────────────────────────
        const scene = new THREE.Scene();
        ctx.scene = scene;

        // Particle starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 800;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
          starPositions[i] = (Math.random() - 0.5) * 20;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.03, transparent: true, opacity: 0.6 });
        scene.add(new THREE.Points(starGeo, starMat));

        // Grid floor
        const grid = new THREE.GridHelper(6, 20, 0xff6b00, 0xff6b00);
        grid.material.opacity = 0.08;
        grid.material.transparent = true;
        grid.position.y = -1.0;
        scene.add(grid);

        // ── Lighting ──────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xfff3e0, 0.8));
        const rimLight = new THREE.DirectionalLight(0xFF6B00, 1.5); // orange key
        rimLight.position.set(-2, 2, -2);
        scene.add(rimLight);
        const fillLight = new THREE.DirectionalLight(0xFFD700, 0.9); // gold fill
        fillLight.position.set(2, 1, 2);
        scene.add(fillLight);
        const backLight = new THREE.DirectionalLight(0xFF3D00, 0.6); // red-orange back
        backLight.position.set(0, -1, -3);
        scene.add(backLight);
        const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
        topLight.position.set(0, 5, 0);
        scene.add(topLight);

        // ── Camera ────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
        camera.position.set(0, 1.3, 3.5);
        camera.lookAt(0, 1.2, 0);
        ctx.camera = camera;

        // ── OrbitControls (locked to upper body) ─────────────
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.2, 0);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 3;
        controls.maxPolarAngle = Math.PI / 2;
        controls.minAzimuthAngle = -Math.PI / 6;
        controls.maxAzimuthAngle = Math.PI / 6;
        controls.autoRotate = false;
        controls.update();
        ctx.controls = controls;

        // ── VRM Loader ────────────────────────────────────────
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        const gltf = await loader.loadAsync(vrmUrl);
        if (cancelled) return;

        const vrm = gltf.userData.vrm;
        if (!vrm) {
          throw new Error('Parsed GLTF contains no VRM object');
        }
        // Apply optimizations (methods may vary by version)
        try { VRMUtils.removeUnnecessaryVertices(vrm.scene); } catch {}
        try { VRMUtils.removeUnnecessaryJoints(vrm.scene); } catch {}

        // ✅ FIX: Rotate 180° around Y-axis so avatar faces the camera directly
        vrm.scene.rotation.y = Math.PI;

        vrm.scene.traverse((obj) => { obj.frustumCulled = false; });
        scene.add(vrm.scene);
        ctx.vrm = vrm;

        // ── Animation clock ───────────────────────────────────
        const clock = new THREE.Clock();
        ctx.clock = clock;

        // Blink state
        let blinkTimer = 0;
        let blinkState = 'open'; // open | closing | closed | opening
        let blinkPhase = 0;

        // Idle breath
        let breathPhase = 0;

        // Talking jaw
        let jawPhase = 0;
        let jawTarget = 0;

        // Head motion
        let headTiltPhase = 0;
        let nodPhase = 0;

        // Helper: get expression manager (VRM 0 or VRM 1)
        const expr = vrm.expressionManager || vrm.blendShapeProxy;

        function setExpr(name, value) {
          if (!expr) return;
          try {
            if (expr.setValue) expr.setValue(name, value);        // VRM 1
            else if (expr.setBlendShapeWeight) expr.setBlendShapeWeight(name, value); // VRM 0
          } catch {}
        }

        function getExpr(name) {
          if (!expr) return 0;
          try {
            if (expr.getValue) return expr.getValue(name) ?? 0;
            if (expr.getBlendShapeWeight) return expr.getBlendShapeWeight(name) ?? 0;
          } catch {}
          return 0;
        }

        // VRM bone helpers
        const humanoid = vrm.humanoid;
        function getBone(boneName) {
          try {
            return humanoid?.getNormalizedBoneNode?.(boneName) ||
                   humanoid?.getBoneNode?.(boneName);
          } catch { return null; }
        }

        const headBone = getBone('head');
        const neckBone = getBone('neck');
        const leftArmBone  = getBone('leftUpperArm');
        const rightArmBone = getBone('rightUpperArm');
        const leftForearmBone = getBone('leftLowerArm');
        const rightForearmBone = getBone('rightLowerArm');

        // Smooth animation targets
        const targets = {
          head: { x: 0, y: 0, z: 0 },
          leftArm: { x: 0, y: 0, z: -1.25 },
          rightArm: { x: 0, y: 0, z: 1.25 },
          leftForearm: { x: 0, y: 0, z: 0 },
          rightForearm: { x: 0, y: 0, z: 0 }
        };

        // Body/hip sway
        let bodySwayPhase = 0;

        // ── Animate ───────────────────────────────────────────
        function animate() {
          if (cancelled) return;
          requestAnimationFrame(animate);

          const delta = clock.getDelta();
          const elapsed = clock.elapsedTime;
          const mood = moodRef.current;

          // ── Idle breathing + body float (always) ─────────────
          breathPhase += delta * 0.9;
          const breathScale = 1 + Math.sin(breathPhase) * 0.009;
          if (vrm.scene) {
            // Gentle up-down float
            vrm.scene.position.y = Math.sin(elapsed * 0.8) * 0.04;
            vrm.scene.scale.setScalar(breathScale);
          }

          // ── Hip / body sway (idle dance) ─────────────────────
          bodySwayPhase += delta;
          const hipBone = getBone('hips');
          const spineBone = getBone('spine');
          const chestBone = getBone('chest');
          if (hipBone) {
            hipBone.rotation.z = Math.sin(bodySwayPhase * 1.1) * 0.04;
            hipBone.rotation.y = Math.sin(bodySwayPhase * 0.7) * 0.03;
          }
          if (spineBone) spineBone.rotation.z = -Math.sin(bodySwayPhase * 1.1) * 0.025;
          if (chestBone) chestBone.rotation.z = Math.sin(bodySwayPhase * 0.9) * 0.02;

          // ── Eye Blink ────────────────────────────────────────
          blinkTimer -= delta;
          if (blinkTimer <= 0) {
            blinkState = 'closing';
            blinkTimer = 2.5 + Math.random() * 3.5;
          }
          if (blinkState === 'closing') {
            blinkPhase = Math.min(blinkPhase + delta * 9, 1);
            if (blinkPhase >= 1) blinkState = 'closed';
          } else if (blinkState === 'closed') {
            blinkPhase = 1;
            blinkTimer -= delta;
            if (blinkTimer <= -0.08) blinkState = 'opening';
          } else if (blinkState === 'opening') {
            blinkPhase = Math.max(blinkPhase - delta * 9, 0);
            if (blinkPhase <= 0) blinkState = 'open';
          }
          setExpr('blink',     blinkPhase);
          setExpr('blinkLeft', blinkPhase);
          setExpr('blinkRight', blinkPhase);
          setExpr('Blink',     blinkPhase);

          // ── Set default targets (relaxed standing positions) ──
          targets.head.x = 0;
          targets.head.y = 0;
          targets.head.z = 0;
          targets.leftArm.x = 0;
          targets.leftArm.z = -1.25;
          targets.rightArm.x = 0;
          targets.rightArm.z = 1.25;
          targets.leftForearm.y = 0;
          targets.rightForearm.y = 0;

          // ── Mood-based animations ─────────────────────────────
          if (mood === 'talking') {
            // Lip-sync jaw oscillation
            jawPhase += delta * 13;
            jawTarget = (Math.sin(jawPhase) * 0.5 + 0.5) * 0.65;
            setExpr('aa', jawTarget);
            setExpr('A',  jawTarget);
            setExpr('oh', jawTarget * 0.35);

            // Active head movement
            targets.head.x = Math.sin(elapsed * 2.5) * 0.04;
            targets.head.y = Math.sin(elapsed * 1.2) * 0.03;
            targets.head.z = Math.sin(elapsed * 0.8) * 0.02;

            // Expressive hand gesturing while talking
            targets.leftArm.z = -1.1 + Math.sin(elapsed * 1.8) * 0.12;
            targets.leftArm.x = -0.15 + Math.cos(elapsed * 1.4) * 0.15;
            targets.leftForearm.y = 0.5 + Math.sin(elapsed * 2.2) * 0.25;

            targets.rightArm.z = 1.1 - Math.sin(elapsed * 2.0) * 0.12;
            targets.rightArm.x = -0.15 + Math.sin(elapsed * 1.6) * 0.15;
            targets.rightForearm.y = -0.5 - Math.sin(elapsed * 2.4) * 0.25;
          } else {
            // Smoothly close mouth
            const curAA = getExpr('aa') || getExpr('A') || 0;
            if (curAA > 0.01) {
              setExpr('aa', curAA * 0.75);
              setExpr('A',  curAA * 0.75);
              setExpr('oh', (getExpr('oh') || 0) * 0.75);
            }
          }

          if (mood === 'thinking') {
            headTiltPhase += delta;
            targets.head.z = 0.15 + Math.sin(elapsed * 0.8) * 0.05;
            targets.head.x = 0.05 + Math.cos(elapsed * 0.8) * 0.03;
            setExpr('angry', 0.2);
            setExpr('Angry', 0.2);

            // Thinking hand to chin pose
            targets.rightArm.z = -1.1;
            targets.rightArm.x = -0.3;
            targets.rightForearm.y = -1.1;
          } else if (mood === 'happy') {
            // Smile expression
            setExpr('happy', Math.abs(Math.sin(elapsed * 6)) * 0.9);
            setExpr('Joy',   Math.abs(Math.sin(elapsed * 6)) * 0.9);

            // Nodding head
            targets.head.x = Math.sin(elapsed * 6) * 0.14;

            // Waving arms
            targets.leftArm.z = 0.8 - Math.sin(elapsed * 5) * 0.35;
            targets.leftArm.x = -0.2;
            targets.leftForearm.y = 0.3;

            targets.rightArm.z = -0.8 + Math.sin(elapsed * 5) * 0.35;
            targets.rightArm.x = -0.2;
            targets.rightForearm.y = -0.3;
          } else if (mood === 'waving' || mood === 'handshaking') {
            // Friendly hand shaking/waving
            targets.rightArm.z = -1.1 + Math.sin(elapsed * 7) * 0.25;
            targets.rightArm.x = -0.4;
            targets.rightForearm.y = -0.6;
            targets.head.z = Math.sin(elapsed * 1.5) * 0.05;
          } else if (mood === 'laughing') {
            // Body shaking + head back laughing + wide open smile
            setExpr('happy', 1.0);
            setExpr('Joy', 1.0);
            setExpr('aa', 0.4 + Math.sin(elapsed * 12) * 0.1);
            setExpr('A', 0.4 + Math.sin(elapsed * 12) * 0.1);

            targets.head.x = -0.15 + Math.sin(elapsed * 12) * 0.04;
            
            if (vrm.scene) {
              vrm.scene.position.y = Math.sin(elapsed * 12) * 0.02;
            }
            targets.leftArm.z = -1.25 + Math.sin(elapsed * 12) * 0.03;
            targets.rightArm.z = 1.25 - Math.sin(elapsed * 12) * 0.03;
          } else if (mood === 'shock' || mood === 'shocked') {
            // Defensive raise arms + wide eyes + open mouth
            setExpr('surprised', 1.0);
            setExpr('Surprised', 1.0);
            setExpr('aa', 0.5);
            setExpr('A', 0.5);

            targets.head.x = -0.22;

            targets.leftArm.z = -0.8;
            targets.leftArm.x = 0.35;
            targets.leftForearm.y = 0.7;

            targets.rightArm.z = 0.8;
            targets.rightArm.x = 0.35;
            targets.rightForearm.y = -0.7;
          } else if (mood === 'sad') {
            // Head slumped forward + arms slouched down
            setExpr('sad', 1.0);
            setExpr('Sorrow', 1.0);

            targets.head.x = 0.35;

            targets.leftArm.z = -1.35;
            targets.leftArm.x = 0.12;
            targets.rightArm.z = 1.35;
            targets.rightArm.x = 0.12;
          } else if (mood === 'pointing') {
            // Full arm raise pointing gesture
            targets.rightArm.z = -2.0;
            targets.rightArm.x = -0.4;
            targets.rightForearm.y = -0.2;

            targets.head.y = Math.sin(elapsed * 0.5) * 0.06;
          } else if (mood === 'quiz') {
            targets.head.y = Math.sin(elapsed * 0.6) * 0.06;
            targets.head.x = -0.05;
            setExpr('surprised', 0.35);
            setExpr('Surprised', 0.35);
          } else if (mood === 'idle') {
            // Gentle breathing sway in neutral state
            targets.head.y = Math.sin(elapsed * 0.5) * 0.05;
            targets.head.x = Math.sin(elapsed * 0.35) * 0.025;

            targets.leftArm.z = -1.25 + Math.sin(elapsed * 0.9) * 0.05;
            targets.rightArm.z = 1.25 - Math.sin(elapsed * 0.9) * 0.05;
          }

          // Expression decay when not in specific mood
          if (mood !== 'happy' && mood !== 'laughing') {
            setExpr('happy',     (getExpr('happy') || 0) * 0.88);
            setExpr('Joy',       (getExpr('Joy') || 0) * 0.88);
          }
          if (mood !== 'quiz' && mood !== 'shock' && mood !== 'shocked') {
            setExpr('surprised', (getExpr('surprised') || 0) * 0.88);
            setExpr('Surprised', (getExpr('Surprised') || 0) * 0.88);
          }
          if (mood !== 'sad') {
            setExpr('sad', (getExpr('sad') || 0) * 0.88);
            setExpr('Sorrow', (getExpr('Sorrow') || 0) * 0.88);
          }
          if (mood !== 'thinking') {
            setExpr('angry', (getExpr('angry') || 0) * 0.88);
            setExpr('Angry', (getExpr('Angry') || 0) * 0.88);
          }

          // ── Smoothly interpolate bone rotations to targets ──
          const lerpSpeed = 0.08;
          if (headBone) {
            headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, targets.head.x, lerpSpeed);
            headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targets.head.y, lerpSpeed);
            headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, targets.head.z, lerpSpeed);
          }
          if (leftArmBone) {
            leftArmBone.rotation.x = THREE.MathUtils.lerp(leftArmBone.rotation.x, targets.leftArm.x, lerpSpeed);
            leftArmBone.rotation.z = THREE.MathUtils.lerp(leftArmBone.rotation.z, targets.leftArm.z, lerpSpeed);
          }
          if (rightArmBone) {
            rightArmBone.rotation.x = THREE.MathUtils.lerp(rightArmBone.rotation.x, targets.rightArm.x, lerpSpeed);
            rightArmBone.rotation.z = THREE.MathUtils.lerp(rightArmBone.rotation.z, targets.rightArm.z, lerpSpeed);
          }
          if (leftForearmBone) {
            leftForearmBone.rotation.y = THREE.MathUtils.lerp(leftForearmBone.rotation.y, targets.leftForearm.y, lerpSpeed);
          }
          if (rightForearmBone) {
            rightForearmBone.rotation.y = THREE.MathUtils.lerp(rightForearmBone.rotation.y, targets.rightForearm.y, lerpSpeed);
          }

          // Update VRM
          vrm.update(delta);
          controls.update();
          renderer.render(scene, camera);
        }

        animate();

        // Resize handler
        const ro = new ResizeObserver(() => {
          if (!el || !renderer) return;
          const w = el.clientWidth;
          const h = el.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
        ro.observe(el);
        ctx.ro = ro;

      } catch (err) {
        console.error('VRM load error:', err);
        setHasError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      ctx.ro?.disconnect();
      ctx.renderer?.dispose();
      if (mountRef.current && ctx.renderer?.domElement) {
        try { mountRef.current.removeChild(ctx.renderer.domElement); } catch {}
      }
    };
  }, [vrmUrl]);

  if (hasError) {
    return <AvatarFallback size={size} />;
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: size === 'small' ? '100%' : '100%',
        height: size === 'small' ? '200px' : '420px',
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    />
  );
}
