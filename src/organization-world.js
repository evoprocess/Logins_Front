import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

function signTexture(title, subtitle, active) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 180;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, active ? '#eaf6ff' : '#d5dce3');
  gradient.addColorStop(1, active ? '#a9d7f7' : '#909ca8');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = active ? '#168cff' : '#667686'; ctx.lineWidth = 8; ctx.strokeRect(5, 5, 502, 170);
  ctx.fillStyle = '#102237'; ctx.textAlign = 'center'; ctx.font = '700 46px Arial'; ctx.fillText(title, 256, 78);
  ctx.fillStyle = active ? '#075fa9' : '#4e5b68'; ctx.font = '600 25px Arial'; ctx.fillText(subtitle, 256, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function bindFirstPersonDirectory(app, openLogin, directory) {
  const container = app.querySelector('.locator-game');
  const prompt = document.createElement('div');
  prompt.className = 'game-prompt fps-prompt';
  const start = document.createElement('button');
  start.className = 'fps-start';
  start.innerHTML = '<b>Entrar no ambiente 3D</b><span>Clique para controlar a câmera com o mouse</span>';
  container.innerHTML = '';
  container.append(start, prompt);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07101d);
  scene.fog = new THREE.Fog(0x07101d, 18, 52);
  const camera = new THREE.PerspectiveCamera(70, 1, .1, 100);
  camera.position.set(0, 1.7, 4);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Ambiente tridimensional das organizações');
  container.prepend(renderer.domElement);
  const controls = new PointerLockControls(camera, renderer.domElement);
  const clock = new THREE.Clock();
  const keys = { forward: false, backward: false, left: false, right: false };
  const stores = [];
  let floorId = 1;
  let nearby = null;

  scene.add(new THREE.HemisphereLight(0xcde9ff, 0x132035, 1.65));
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.7);
  mainLight.position.set(2, 8, 4); mainLight.castShadow = true; scene.add(mainLight);
  const blueLight = new THREE.PointLight(0x168cff, 22, 24, 2);
  blueLight.position.set(0, 2.6, -12); scene.add(blueLight);

  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: 0x28394b, metalness: .68, roughness: .38 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xcad4dd, metalness: .75, roughness: .3 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x40536a, metalness: .45, roughness: .5 }),
    door: new THREE.MeshStandardMaterial({ color: 0x0b2842, metalness: .72, roughness: .22, emissive: 0x06274a, emissiveIntensity: .45 }),
    blocked: new THREE.MeshStandardMaterial({ color: 0x58636d, metalness: .4, roughness: .7 })
  };
  const architecture = new THREE.Group(); scene.add(architecture);
  const shops = new THREE.Group(); scene.add(shops);
  const staircase = new THREE.Group(); scene.add(staircase);
  let stairCooldown = 0;

  const box = (width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z); mesh.receiveShadow = true; mesh.castShadow = true; architecture.add(mesh); return mesh;
  };
  box(10, .18, 48, materials.floor, 0, -.1, -18);
  box(10, .15, 48, materials.ceiling, 0, 4.3, -18);
  box(.25, 4.4, 48, materials.wall, -5, 2.1, -18);
  box(.25, 4.4, 48, materials.wall, 5, 2.1, -18);
  for (let z = 2; z > -42; z -= 6) {
    const strip = box(7.5, .04, .12, new THREE.MeshBasicMaterial({ color: 0x8bd1ff }), 0, 4.2, z);
    strip.castShadow = false;
  }

  function buildStaircase(id) {
    while (staircase.children.length) {
      const child = staircase.children.pop();
      child.geometry?.dispose(); child.material?.dispose();
    }
    const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x8b9bab, metalness: .72, roughness: .3 });
    const direction = id === 1 ? 1 : -1;
    for (let index = 0; index < 9; index += 1) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.2, .22 + index * .23, .72), stepMaterial);
      step.position.set(0, direction * index * .115, -38.2 - index * .68);
      step.castShadow = true; step.receiveShadow = true; staircase.add(step);
    }
    const landing = new THREE.Mesh(new THREE.BoxGeometry(3.7, .25, 2), stepMaterial);
    landing.position.set(0, direction * 1.12, -44); staircase.add(landing);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .9), new THREE.MeshBasicMaterial({
      map: signTexture(id === 1 ? 'ESCADA ↑' : 'ESCADA ↓', id === 1 ? 'ACESSO AO PISO 2' : 'ACESSO AO PISO 1', true)
    }));
    label.position.set(0, 2.7, -45.02); staircase.add(label);
    const railMaterial = new THREE.MeshStandardMaterial({ color: 0xb8c6d3, metalness: .9, roughness: .18 });
    [-1.75, 1.75].forEach(x => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 7), railMaterial);
      rail.position.set(x, direction * 1.35, -41); rail.rotation.x = direction * -.17; staircase.add(rail);
    });
  }

  function renderFloor(id, arrivalByStairs = false) {
    floorId = id; stores.length = 0;
    while (shops.children.length) {
      const child = shops.children.pop();
      child.traverse(item => { item.geometry?.dispose(); if (item.material?.map) item.material.map.dispose(); item.material?.dispose(); });
    }
    const organizations = directory.floors.find(floor => floor.id === id)?.organizations || [];
    organizations.forEach((organization, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);
      const z = -5 - row * 11;
      const group = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, .45), new THREE.MeshStandardMaterial({ color: 0x9ba9b6, metalness: .72, roughness: .28 }));
      const doorMaterial = organization.status === 'active' ? materials.door.clone() : materials.blocked.clone();
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.35, .18), doorMaterial);
      door.position.set(0, -.35, side > 0 ? -.31 : .31);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.45, .86), new THREE.MeshBasicMaterial({ map: signTexture(organization.id, organization.status === 'active' ? 'ENTRADA' : 'EM CONSTRUÇÃO...', organization.status === 'active') }));
      sign.position.set(0, 1.75, side > 0 ? -.25 : .25);
      if (side < 0) { group.rotation.y = Math.PI / 2; group.position.set(-4.72, 1.65, z); }
      else { group.rotation.y = -Math.PI / 2; group.position.set(4.72, 1.65, z); }
      group.add(frame, door, sign); group.userData = { organization, position: new THREE.Vector3(side * 4.15, 1.7, z) };
      group.traverse(item => { item.castShadow = true; item.receiveShadow = true; });
      shops.add(group); stores.push(group);
      if (organization.status === 'active') {
        const glow = new THREE.PointLight(0x168cff, 7, 6, 2);
        glow.position.set(side * 3.9, 2, z); shops.add(glow);
      }
    });
    buildStaircase(id);
    camera.position.set(0, 1.7, arrivalByStairs ? -34 : 4);
    camera.rotation.set(0, arrivalByStairs ? Math.PI : 0, 0);
    stairCooldown = performance.now() + 1400;
    app.querySelectorAll('[data-floor]').forEach(button => button.classList.toggle('is-active', Number(button.dataset.floor) === id));
    prompt.textContent = `Piso ${id} — caminhe até uma porta`;
  }

  function enterNearby() {
    if (nearby?.organization.status === 'active') {
      controls.unlock();
      openLogin(nearby.organization.id);
    }
  }
  const keyState = (event, pressed) => {
    if (['KeyW', 'ArrowUp'].includes(event.code)) keys.forward = pressed;
    if (['KeyS', 'ArrowDown'].includes(event.code)) keys.backward = pressed;
    if (['KeyA', 'ArrowLeft'].includes(event.code)) keys.left = pressed;
    if (['KeyD', 'ArrowRight'].includes(event.code)) keys.right = pressed;
    if (pressed && ['KeyE', 'Enter'].includes(event.code)) enterNearby();
  };
  const onKeyDown = event => keyState(event, true);
  const onKeyUp = event => keyState(event, false);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  start.onclick = () => controls.lock();
  controls.addEventListener('lock', () => { start.hidden = true; container.focus(); });
  controls.addEventListener('unlock', () => { if (container.isConnected && !app.querySelector('.login-modal')) start.hidden = false; });
  app.querySelectorAll('[data-floor]').forEach(button => { button.onclick = () => renderFloor(Number(button.dataset.floor)); });
  app.querySelectorAll('[data-move]').forEach(button => {
    const direction = Number(button.dataset.move);
    const set = active => { keys[direction < 0 ? 'left' : 'right'] = active; };
    button.onpointerdown = () => set(true); button.onpointerup = () => set(false); button.onpointerleave = () => set(false);
  });
  const enterButton = app.querySelector('#enter-store');
  enterButton.onclick = enterNearby;

  function resize() {
    const width = container.clientWidth; const height = container.clientHeight;
    renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();

  function animate() {
    if (!container.isConnected) {
      document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect(); controls.unlock(); renderer.dispose(); return;
    }
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), .05);
    if (controls.isLocked) {
      const speed = 4.6 * delta;
      if (keys.forward) controls.moveForward(speed);
      if (keys.backward) controls.moveForward(-speed);
      if (keys.left) controls.moveRight(-speed);
      if (keys.right) controls.moveRight(speed);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -3.65, 3.65);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -39.35, 5);
      const stairProgress = THREE.MathUtils.clamp((-camera.position.z - 37) / 2.35, 0, 1);
      camera.position.y = 1.7 + stairProgress * (floorId === 1 ? 1.05 : -.8);
      if (camera.position.z < -39.2 && Math.abs(camera.position.x) < 2.1 && performance.now() > stairCooldown) {
        renderFloor(floorId === 1 ? 2 : 1, true);
        prompt.textContent = floorId === 2 ? 'Você subiu para o Piso 2' : 'Você desceu para o Piso 1';
      }
    }
    nearby = null; let distance = Infinity;
    stores.forEach(store => {
      const current = camera.position.distanceTo(store.userData.position);
      if (current < distance) { distance = current; nearby = store.userData; }
    });
    const available = distance < 3.1;
    if (!available) nearby = null;
    enterButton.disabled = !(nearby?.organization.status === 'active');
    prompt.textContent = nearby
      ? nearby.organization.status === 'active' ? `${nearby.organization.id} — pressione E para entrar` : `${nearby.organization.id} — Em construção...`
      : `Piso ${floorId} — use WASD e o mouse`;
    renderer.render(scene, camera);
  }
  renderFloor(1); animate();
}
