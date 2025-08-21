import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import axios from 'axios';
import { initUI } from './ui.js';

const AU = 149597870.7; // kilometers per astronomical unit

async function init() {
  // Create scene, camera, renderer
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Load ephemeris data and convert from km to scene units (AU)
  const { data } = await axios.get('data/3I_atlas.json');
  const ephemeris = data.data.map((entry) => ({
    time: new Date(entry.timestamp),
    position: entry.position.map((v) => v / AU),
  }));

  // Plot comet path
  const pathPoints = ephemeris.map((e) => new THREE.Vector3(...e.position));
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const path = new THREE.Line(pathGeometry, pathMaterial);
  scene.add(path);

  // Comet representation
  const cometGeometry = new THREE.SphereGeometry(0.02, 16, 16);
  const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const comet = new THREE.Mesh(cometGeometry, cometMaterial);
  scene.add(comet);

  function updateCometPosition(now = new Date()) {

    if (now <= ephemeris[0].time) {
      comet.position.copy(pathPoints[0]);
      return;
    }
    if (now >= ephemeris[ephemeris.length - 1].time) {
      comet.position.copy(pathPoints[pathPoints.length - 1]);
      return;
    }

    for (let i = 0; i < ephemeris.length - 1; i++) {
      const t0 = ephemeris[i].time;
      const t1 = ephemeris[i + 1].time;
      if (now >= t0 && now <= t1) {
        const alpha = (now - t0) / (t1 - t0);
        comet.position.copy(
          pathPoints[i].clone().lerp(pathPoints[i + 1], alpha)
        );
        break;
      }
    }
  }

  const ui = initUI(
    ephemeris[0].time,
    ephemeris[ephemeris.length - 1].time,
    updateCometPosition
  );

  setInterval(() => {
    ui.updateCurrentTime(new Date());
  }, 5000);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

init();
