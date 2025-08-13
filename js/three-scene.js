// Simple lightweight Three.js scene
(() => {
  const container = document.getElementById('three-container');
  if(!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geo = new THREE.IcosahedronGeometry(1.2, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0x6fa8ff, wireframe: true, transparent:true, opacity:0.7 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const geo2 = new THREE.IcosahedronGeometry(1.35, 2);
  const mat2 = new THREE.MeshBasicMaterial({ color: 0xa8d8ff, wireframe: true, transparent:true, opacity:0.16 });
  const mesh2 = new THREE.Mesh(geo2, mat2);
  scene.add(mesh2);

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  };
  const tick = () => {
    mesh.rotation.y += 0.005;
    mesh.rotation.x += 0.003;
    mesh2.rotation.y -= 0.003;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  const onMove = e => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mesh.rotation.x = y * 0.8; mesh.rotation.y = x * 1.2;
  };

  window.addEventListener('resize', resize);
  container.addEventListener('mousemove', onMove);
  resize();
  tick();
})();
