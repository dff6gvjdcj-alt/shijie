/**
 * 俯仰之间 —— 3D 立体画廊
 * Three.js r160 · 第一人称漫游 · 画作交互
 */
const Gallery3D = (function () {
  /* ---------- 状态 ---------- */
  let scene, camera, renderer, clock;
  let raycaster, mouse;
  let animationId = null;
  let isInitialized = false;

  // 控制器状态（注意：THREE 对象在 init 后才可用，此处用普通对象占位）
  const controls = {
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0,
    position: { x: 0, y: 1.6, z: 8 },
    velocity: { x: 0, y: 0, z: 0 },
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    // 点击地面移动
    targetPosition: null,
    // 观看画作模式
    viewingArtwork: null,
    viewReturnPosition: null,
    viewReturnYaw: null,
    viewReturnPitch: null
  };

  // 画作数据
  let artworks = []; // { mesh, frameMesh, data, light, baseScale }
  let hoveredArtwork = null;

  // 当前选择
  const selection = {
    zone: null,
    medium: null,
    exhibition: null,
    step: 'zone' // zone -> medium -> exhibition -> gallery
  };

  const EYE_HEIGHT = 1.6;
  const MOVE_SPEED = 3.0;
  const LOOK_SENSITIVITY = 0.003;
  const DAMPING = 0.08;

  const canvasEl = document.getElementById('gallery3dCanvas');
  const selectorEl = document.getElementById('gallery3dSelector');
  const topbarEl = document.getElementById('gallery3dTopbar');
  const hintEl = document.getElementById('gallery3dHint');
  const infocardEl = document.getElementById('gallery3dInfocard');

  /* ============================================================
     选择界面
     ============================================================ */
  function showSelector() {
    selectorEl.classList.remove('hide');
    topbarEl.style.display = 'none';
    hintEl.style.display = 'none';
    infocardEl.classList.remove('show');
    selection.step = 'zone';
    selection.zone = null;
    selection.medium = null;
    selection.exhibition = null;
    renderSelector();
  }

  function renderSelector() {
    const titleEl = document.getElementById('selectorTitle');
    const subEl = document.getElementById('selectorSubtitle');
    const gridEl = document.getElementById('selectorGrid');
    const backEl = document.getElementById('selectorBack');

    if (selection.step === 'zone') {
      titleEl.textContent = '选 择 分 区';
      subEl.textContent = '3D 立体画廊 · 四大分区';
      backEl.style.display = 'none';
      gridEl.className = 'selector-grid cols-4';
      gridEl.innerHTML = DataUtil._data().zones.map(z => `
        <div class="selector-item" onclick="Gallery3D.selectZone('${z.id}')" style="border-color:${z.accent}33;">
          <div class="selector-item-name" style="color:${z.accent}">${z.name}</div>
          <div class="selector-item-sub">${z.subtitle}</div>
        </div>
      `).join('');
    } else if (selection.step === 'medium') {
      const zone = selection.zone;
      titleEl.textContent = '选 择 媒 介';
      subEl.textContent = `${zone.name} · ${zone.subtitle}`;
      backEl.style.display = 'block';
      gridEl.className = 'selector-grid cols-' + Math.min(zone.media.length, 4);
      gridEl.innerHTML = zone.media.map(m => `
        <div class="selector-item" onclick="Gallery3D.selectMedium('${m.id}')">
          <div class="selector-item-name">${m.name}</div>
          <div class="selector-item-sub">${m.exhibitions.length} 个画展</div>
        </div>
      `).join('');
    } else if (selection.step === 'exhibition') {
      const zone = selection.zone;
      const medium = selection.medium;
      titleEl.textContent = '选 择 画 展';
      subEl.textContent = `${zone.name} · ${medium.name}`;
      backEl.style.display = 'block';
      gridEl.className = 'selector-grid cols-' + Math.min(medium.exhibitions.length, 3);
      gridEl.innerHTML = medium.exhibitions.map(e => `
        <div class="selector-item" onclick="Gallery3D.selectExhibition('${e.id}')">
          <div class="selector-item-name">${e.name}</div>
          <div class="selector-item-sub">${DataUtil.countExhibitionWorks(e)} 件作品 · ${e.themes.length} 个主题</div>
        </div>
      `).join('');
    }
  }

  function selectZone(zoneId) {
    selection.zone = DataUtil.getZone(zoneId);
    selection.step = 'medium';
    renderSelector();
  }

  function selectMedium(mediumId) {
    selection.medium = DataUtil.getMedium(selection.zone.id, mediumId);
    selection.step = 'exhibition';
    renderSelector();
  }

  function selectExhibition(exhibitionId) {
    selection.exhibition = DataUtil.getExhibition(selection.zone.id, selection.medium.id, exhibitionId);
    enterGallery();
  }

  function selectorBack() {
    if (selection.step === 'exhibition') {
      selection.step = 'medium';
      selection.exhibition = null;
    } else if (selection.step === 'medium') {
      selection.step = 'zone';
      selection.medium = null;
      selection.zone = null;
    }
    renderSelector();
  }

  function backToZoneSelect() {
    // 如果正在看画作，先退出
    if (controls.viewingArtwork) {
      closeInfoCard();
    }
    showSelector();
  }

  /* ============================================================
     进入画廊
     ============================================================ */
  function enterGallery() {
    // 确保 Three.js 已加载
    if (typeof THREE === 'undefined') {
      const check = setInterval(() => {
        if (typeof THREE !== 'undefined') {
          clearInterval(check);
          doEnter();
        }
      }, 100);
      setTimeout(() => { clearInterval(check); }, 8000);
      return;
    }
    doEnter();

    function doEnter() {
      selectorEl.classList.add('hide');
      topbarEl.style.display = 'flex';
      hintEl.style.display = 'flex';

      const ex = selection.exhibition;
      const medium = selection.medium;
      const zone = selection.zone;
      document.getElementById('gallery3dTitle').innerHTML =
        `${ex.name} <small>${zone.name} · ${medium.name}</small>`;

      // 延迟一帧确保选择界面隐藏后再初始化
      setTimeout(() => {
        buildScene();
      }, 50);

      // 5秒后隐藏操作提示
      setTimeout(() => {
        if (hintEl) hintEl.classList.add('hide');
      }, 6000);
    }
  }

  /* ============================================================
     场景构建
     ============================================================ */
  function buildScene() {
    if (isInitialized) {
      clearScene();
    }

    const ex = selection.exhibition;
    const allWorks = DataUtil.getAllExhibitionWorks(ex);

    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0e14);
    // 雾效根据展厅长度动态调整，避免远处作品完全不可见
    const _worksPerWall = Math.ceil(allWorks.length / 2);
    const _roomLen = Math.max(12, _worksPerWall * 2.0 + 4);
    scene.fog = new THREE.Fog(0x08080c, _roomLen * 0.35, _roomLen * 1.1);

    // 相机
    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.rotation.order = 'YXZ';

    // 渲染器
    renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    // 时钟
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 环境光（较暗）
    const ambientLight = new THREE.AmbientLight(0x6a6560, 0.9);
    scene.add(ambientLight);

    // 微弱半球光
    const hemiLight = new THREE.HemisphereLight(0x7a7570, 0x1e1e24, 0.6);
    scene.add(hemiLight);

    // 构建展厅
    buildRoom(allWorks.length);

    // 相机初始位置：展厅入口处，朝向内部，一进入即可看到两侧作品
    const _room = scene.userData.room;
    camera.position.set(0, EYE_HEIGHT, _room.length / 2 - 5);

    // 悬挂作品
    hangArtworks(allWorks);

    // 重置控制器
    controls.yaw = 0;
    controls.pitch = 0;
    controls.targetYaw = 0;
    controls.targetPitch = 0;
    controls.position = new THREE.Vector3(0, EYE_HEIGHT, scene.userData.room.length / 2 - 5);
    controls.velocity = new THREE.Vector3(0, 0, 0);
    controls.targetPosition = null;
    controls.viewingArtwork = null;
    controls.viewReturnPosition = null;

    // 绑定事件
    bindEvents();

    isInitialized = true;
    animate();
  }

  /* ---------- 展厅空间 ---------- */
  function buildRoom(workCount) {
    // 根据作品数量决定展厅长度（固定间距2米）
    const worksPerWall = Math.ceil(workCount / 2);
    const roomWidth = 10;
    const roomLength = Math.max(12, worksPerWall * 2.0 + 4);
    const roomHeight = 4.5;

    // 地板
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x22222a,
      roughness: 0.75,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'floor';
    scene.add(floor);

    // 天花板
    const ceilGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x16161c,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    scene.add(ceiling);

    // 墙壁材质
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x2c2c34,
      roughness: 0.85,
      metalness: 0.05
    });

    // 左墙
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomLength, roomHeight),
      wallMat
    );
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // 右墙
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomLength, roomHeight),
      wallMat
    );
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // 前墙（入口方向）
    const frontWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomHeight),
      wallMat
    );
    frontWall.position.set(0, roomHeight / 2, roomLength / 2);
    frontWall.receiveShadow = true;
    scene.add(frontWall);

    // 后墙
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomHeight),
      wallMat
    );
    backWall.position.set(0, roomHeight / 2, -roomLength / 2);
    backWall.rotation.y = Math.PI;
    backWall.receiveShadow = true;
    scene.add(backWall);

    // 踢脚线（暗金细线）
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xB8955A,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0xB8955A,
      emissiveIntensity: 0.05
    });
    const baseboardH = 0.08;
    const baseboardGeoL = new THREE.BoxGeometry(0.02, baseboardH, roomLength);
    const bbLeft = new THREE.Mesh(baseboardGeoL, baseboardMat);
    bbLeft.position.set(-roomWidth / 2 + 0.01, baseboardH / 2, 0);
    scene.add(bbLeft);
    const bbRight = new THREE.Mesh(baseboardGeoL, baseboardMat);
    bbRight.position.set(roomWidth / 2 - 0.01, baseboardH / 2, 0);
    scene.add(bbRight);

    // 顶部装饰线
    const crownGeo = new THREE.BoxGeometry(0.03, 0.06, roomLength);
    const crownLeft = new THREE.Mesh(crownGeo, baseboardMat);
    crownLeft.position.set(-roomWidth / 2 + 0.015, roomHeight - 0.03, 0);
    scene.add(crownLeft);
    const crownRight = new THREE.Mesh(crownGeo, baseboardMat);
    crownRight.position.set(roomWidth / 2 - 0.015, roomHeight - 0.03, 0);
    scene.add(crownRight);

    // 天花板灯带（参考美术馆天窗效果，暖白色发光条）
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xFFF5E0 });
    const stripCount = Math.max(3, Math.floor(roomLength / 6));
    const stripSpacing = roomLength / (stripCount + 1);
    for (let i = 0; i < stripCount; i++) {
      const stripZ = -roomLength / 2 + stripSpacing * (i + 1);
      // 左侧灯带
      const stripL = new THREE.Mesh(new THREE.PlaneGeometry(0.15, roomWidth * 0.7), stripMat);
      stripL.rotation.x = Math.PI / 2;
      stripL.position.set(-roomWidth * 0.25, roomHeight - 0.02, stripZ);
      scene.add(stripL);
      // 右侧灯带
      const stripR = new THREE.Mesh(new THREE.PlaneGeometry(0.15, roomWidth * 0.7), stripMat);
      stripR.rotation.x = Math.PI / 2;
      stripR.position.set(roomWidth * 0.25, roomHeight - 0.02, stripZ);
      scene.add(stripR);
      // 灯带对应的点光源（向下照射）
      const ptLight = new THREE.PointLight(0xFFF0D0, 0.8, 8, 1.5);
      ptLight.position.set(0, roomHeight - 0.3, stripZ);
      scene.add(ptLight);
    }

    // 存储房间尺寸供碰撞检测
    scene.userData.room = { width: roomWidth, length: roomLength, height: roomHeight };
  }

  /* ---------- 悬挂作品 ---------- */
  function hangArtworks(works) {
    const room = scene.userData.room;
    const artWidth = 1.4;
    const artHeight = 1.8;
    const frameThickness = 0.06;
    const artCenterY = 1.7; // 作品中心高度

    // 分配到左右墙
    const leftWorks = works.filter((_, i) => i % 2 === 0);
    const rightWorks = works.filter((_, i) => i % 2 === 1);

    function hangSide(sideWorks, side) {
      if (sideWorks.length === 0) return;
      const artSpacing = 2.0; // 固定作品间距2米
      const totalSpan = (sideWorks.length - 1) * artSpacing;
      const startZ = -totalSpan / 2; // 居中分布
      const x = side === 'left' ? -room.width / 2 + 0.08 : room.width / 2 - 0.08;
      const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

      sideWorks.forEach((work, i) => {
        const z = startZ + i * artSpacing;

        // 画作组
        const artGroup = new THREE.Group();
        artGroup.position.set(x, artCenterY, z);
        artGroup.rotation.y = rotY;

        // 画框（极细暗金）
        const frameGeo = new THREE.BoxGeometry(artWidth + frameThickness * 2, artHeight + frameThickness * 2, 0.05);
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0xB8955A,
          roughness: 0.35,
          metalness: 0.7,
          emissive: 0xB8955A,
          emissiveIntensity: 0.08
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = 0.01;
        artGroup.add(frame);

        // 画布（深灰占位）
        const canvasGeo = new THREE.PlaneGeometry(artWidth, artHeight);
        const canvasMat = new THREE.MeshStandardMaterial({
          color: 0x3e3e46,
          roughness: 0.8,
          metalness: 0.0
        });
        const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
        canvasMesh.position.z = 0.04;
        canvasMesh.name = 'artworkCanvas';
        artGroup.add(canvasMesh);

        // 画布上的文字（用canvas纹理生成）
        const textTexture = createArtworkLabel(work);
        const textMat = new THREE.MeshBasicMaterial({
          map: textTexture,
          transparent: true
        });
        const textMesh = new THREE.Mesh(canvasGeo, textMat);
        textMesh.position.z = 0.045;
        artGroup.add(textMesh);

        // 聚光灯（暖色，从上方照射）
        const spotLight = new THREE.SpotLight(0xFFF0D0, 7.0, 10, Math.PI / 5, 0.4, 1.0);
        spotLight.position.set(0, artCenterY + 1.8, 0.6);
        spotLight.target.position.set(0, artCenterY, 0.1);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 512;
        spotLight.shadow.mapSize.height = 512;
        artGroup.add(spotLight);
        artGroup.add(spotLight.target);

        // 记录
        const artworkData = {
          group: artGroup,
          frame: frame,
          canvas: canvasMesh,
          data: work,
          light: spotLight,
          baseScale: 1,
          hovered: false
        };
        canvasMesh.userData.artwork = artworkData;
        textMesh.userData.artwork = artworkData;
        artworks.push(artworkData);

        scene.add(artGroup);
      });
    }

    hangSide(leftWorks, 'left');
    hangSide(rightWorks, 'right');
  }

  /* ---------- 生成作品标签纹理 ---------- */
  function createArtworkLabel(work) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 640;
    const ctx = c.getContext('2d');

    // 背景透明
    ctx.clearRect(0, 0, c.width, c.height);

    // 作品编号
    ctx.fillStyle = 'rgba(235, 235, 245, 0.95)';
    ctx.font = '300 28px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(work.id, c.width / 2, c.height / 2 - 20);

    // 媒介类型（从画展推断）
    const mediumName = selection.medium ? selection.medium.name : '';
    ctx.fillStyle = 'rgba(210, 180, 120, 0.9)';
    ctx.font = '300 22px "Noto Serif SC", serif';
    ctx.fillText(mediumName, c.width / 2, c.height / 2 + 20);

    // 装饰线
    ctx.strokeStyle = 'rgba(210, 180, 120, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.width / 2 - 40, c.height / 2 - 50);
    ctx.lineTo(c.width / 2 + 40, c.height / 2 - 50);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(c);
    texture.needsUpdate = true;
    return texture;
  }

  /* ============================================================
     事件绑定
     ============================================================ */
  function bindEvents() {
    canvasEl.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvasEl.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });
  }

  function unbindEvents() {
    canvasEl.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    canvasEl.removeEventListener('click', onClick);
    window.removeEventListener('resize', onResize);
    canvasEl.removeEventListener('wheel', onWheel);
  }

  function onMouseDown(e) {
    if (controls.viewingArtwork) return;
    controls.isDragging = true;
    controls.lastMouseX = e.clientX;
    controls.lastMouseY = e.clientY;
    canvasEl.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    // 更新鼠标位置用于射线检测
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (controls.isDragging && !controls.viewingArtwork) {
      const dx = e.clientX - controls.lastMouseX;
      const dy = e.clientY - controls.lastMouseY;
      controls.targetYaw -= dx * LOOK_SENSITIVITY;
      controls.targetPitch -= dy * LOOK_SENSITIVITY;
      // 限制俯仰角
      controls.targetPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, controls.targetPitch));
      controls.lastMouseX = e.clientX;
      controls.lastMouseY = e.clientY;
      // 拖拽时取消点击地面移动
      controls.targetPosition = null;
    }

    // 悬停检测
    if (!controls.viewingArtwork) {
      checkHover();
    }
  }

  function onMouseUp() {
    controls.isDragging = false;
    canvasEl.style.cursor = hoveredArtwork ? 'pointer' : 'grab';
  }

  function onClick(e) {
    if (controls.viewingArtwork) {
      // 观看模式下点击任意处关闭
      closeInfoCard();
      return;
    }

    // 射线检测
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // 检测画作
    for (const hit of intersects) {
      if (hit.object.userData.artwork) {
        viewArtwork(hit.object.userData.artwork);
        return;
      }
    }

    // 检测地面（点击移动）
    for (const hit of intersects) {
      if (hit.object.name === 'floor') {
        controls.targetPosition = hit.point.clone();
        controls.targetPosition.y = EYE_HEIGHT;
        return;
      }
    }
  }

  function onKeyDown(e) {
    if (controls.viewingArtwork) {
      if (e.key === 'Escape') closeInfoCard();
      return;
    }
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': controls.moveForward = true; break;
      case 'KeyS': case 'ArrowDown': controls.moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft': controls.moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': controls.moveRight = true; break;
      case 'Escape':
        if (controls.targetPosition) controls.targetPosition = null;
        break;
    }
  }

  function onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': controls.moveForward = false; break;
      case 'KeyS': case 'ArrowDown': controls.moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft': controls.moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': controls.moveRight = false; break;
    }
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onWheel(e) {
    e.preventDefault();
  }

  /* ============================================================
     悬停检测
     ============================================================ */
  function checkHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let found = null;
    for (const hit of intersects) {
      if (hit.object.userData.artwork) {
        found = hit.object.userData.artwork;
        break;
      }
    }

    if (found !== hoveredArtwork) {
      // 恢复之前的
      if (hoveredArtwork) {
        hoveredArtwork.hovered = false;
        hoveredArtwork.frame.material.emissiveIntensity = 0.08;
        hoveredArtwork.light.intensity = 2.5;
      }
      hoveredArtwork = found;
      if (hoveredArtwork) {
        hoveredArtwork.hovered = true;
        hoveredArtwork.frame.material.emissiveIntensity = 0.35;
        hoveredArtwork.light.intensity = 3.5;
        canvasEl.style.cursor = 'pointer';
      } else {
        canvasEl.style.cursor = controls.isDragging ? 'grabbing' : 'grab';
      }
    }
  }

  /* ============================================================
     观看画作
     ============================================================ */
  function viewArtwork(artwork) {
    controls.viewingArtwork = artwork;
    controls.viewReturnPosition = controls.position.clone();
    controls.viewReturnYaw = controls.targetYaw;
    controls.viewReturnPitch = controls.targetPitch;
    controls.targetPosition = null;
    controls.moveForward = controls.moveBackward = controls.moveLeft = controls.moveRight = false;

    // 计算画作正前方2m的位置
    const artPos = artwork.group.position.clone();
    const artRot = artwork.group.rotation.y;
    // 画作法线方向（朝向展厅内部）
    const normal = new THREE.Vector3(Math.sin(artRot), 0, Math.cos(artRot));
    const viewPos = artPos.clone().add(normal.multiplyScalar(2.0));
    viewPos.y = EYE_HEIGHT;

    controls.targetPosition = viewPos;
    // 朝向画作
    const dir = artPos.clone().sub(viewPos).normalize();
    controls.targetYaw = Math.atan2(dir.x, dir.z);
    controls.targetPitch = 0;

    // 显示信息卡片（延迟到相机接近后）
    setTimeout(() => {
      showInfoCard(artwork.data);
    }, 800);
  }

  function showInfoCard(work) {
    document.getElementById('infoCardTitle').textContent = work.title;
    document.getElementById('infoCardAuthor').textContent = work.author;
    document.getElementById('infoCardDesc').textContent = work.desc;
    const ex = selection.exhibition;
    document.getElementById('infoCardMeta').textContent =
      `${ex.name}${work.themeName ? ' · ' + work.themeName : ''}`;
    infocardEl.classList.add('show');
  }

  function closeInfoCard() {
    infocardEl.classList.remove('show');
    if (controls.viewingArtwork && controls.viewReturnPosition) {
      controls.targetPosition = controls.viewReturnPosition.clone();
      controls.targetYaw = controls.viewReturnYaw;
      controls.targetPitch = controls.viewReturnPitch;
    }
    controls.viewingArtwork = null;
    controls.viewReturnPosition = null;
  }

  /* ============================================================
     主循环
     ============================================================ */
  function animate() {
    animationId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    updateControls(delta);
    updateArtworks(delta);
    renderer.render(scene, camera);
  }

  function updateControls(delta) {
    // 平滑视角（阻尼感）
    controls.yaw += (controls.targetYaw - controls.yaw) * DAMPING;
    controls.pitch += (controls.targetPitch - controls.pitch) * DAMPING;

    camera.rotation.y = controls.yaw;
    camera.rotation.x = controls.pitch;

    // 键盘移动（观看模式下禁用）
    const moveDir = new THREE.Vector3();
    if (!controls.viewingArtwork) {
      if (controls.moveForward) moveDir.z -= 1;
      if (controls.moveBackward) moveDir.z += 1;
      if (controls.moveLeft) moveDir.x -= 1;
      if (controls.moveRight) moveDir.x += 1;
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      // 按yaw旋转方向
      const sin = Math.sin(controls.yaw);
      const cos = Math.cos(controls.yaw);
      const worldDir = new THREE.Vector3(
        moveDir.x * cos - moveDir.z * sin,
        0,
        moveDir.x * sin + moveDir.z * cos
      );
      controls.velocity.lerp(worldDir.multiplyScalar(MOVE_SPEED), 0.15);
      controls.targetPosition = null; // 键盘移动取消点击移动
    } else {
      controls.velocity.multiplyScalar(0.85);
    }

    // 点击地面平滑移动
    if (controls.targetPosition) {
      const toTarget = controls.targetPosition.clone().sub(controls.position);
      toTarget.y = 0;
      const dist = toTarget.length();
      if (dist > 0.1) {
        toTarget.normalize();
        const speed = controls.viewingArtwork ? 2.5 : Math.min(3.5, dist * 2);
        controls.velocity.lerp(toTarget.multiplyScalar(speed), 0.1);
      } else {
        controls.targetPosition = null;
        controls.velocity.multiplyScalar(0.5);
      }
    }

    // 应用速度
    controls.position.add(controls.velocity.clone().multiplyScalar(delta));
    controls.position.y = EYE_HEIGHT; // 固定高度，不头浮动

    // 碰撞检测（墙壁）
    const room = scene.userData.room;
    if (room) {
      const margin = 0.5;
      controls.position.x = Math.max(-room.width / 2 + margin, Math.min(room.width / 2 - margin, controls.position.x));
      controls.position.z = Math.max(-room.length / 2 + margin, Math.min(room.length / 2 - margin, controls.position.z));
    }

    camera.position.copy(controls.position);
  }

  function updateArtworks(delta) {
    const time = clock.elapsedTime;
    artworks.forEach(art => {
      // 悬停放大动画（1.03，0.2s过渡感）
      const targetScale = art.hovered ? 1.03 : 1.0;
      const currentScale = art.group.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.15;
      art.group.scale.setScalar(newScale);

      // 灯光呼吸感
      if (art.hovered) {
        art.light.intensity = 3.5 + Math.sin(time * 3) * 0.3;
      }
    });
  }

  /* ============================================================
     初始化 / 销毁
     ============================================================ */
  function init() {
    showSelector();
    canvasEl.style.cursor = 'grab';
  }

  function clearScene() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    unbindEvents();
    artworks = [];
    hoveredArtwork = null;
    if (scene) {
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });
      scene = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    isInitialized = false;
  }

  function destroy() {
    clearScene();
    infocardEl.classList.remove('show');
    selectorEl.classList.add('hide');
    topbarEl.style.display = 'none';
    hintEl.style.display = 'none';
    hintEl.classList.remove('hide');
  }

  return {
    init,
    destroy,
    selectZone,
    selectMedium,
    selectExhibition,
    selectorBack,
    backToZoneSelect,
    closeInfoCard
  };
})();
