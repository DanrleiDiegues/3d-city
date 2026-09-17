import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  POIS_DATA,
  generateChacaraBuildings,
  generateChacaraTrees,
  getChacaraTerrainElevation,
  CHACARA_GEO,
} from '../data/chacaraData';
import { POI, BuildingData, TimeOfDay, CameraPreset, MapLayers } from '../types';
import {
  createSatelliteTerrainTexture,
  enhanceWithLiveSatelliteImagery,
  createRoofTexture,
  createFacadeTexture,
} from '../utils/textureGenerator';

interface Map3DCanvasProps {
  timeOfDay: TimeOfDay;
  elevationScale: number;
  layers: MapLayers;
  selectedPoi: POI | null;
  onSelectPoi: (poi: POI | null) => void;
  activePreset: CameraPreset | null;
  onPresetFinished: () => void;
  isCinematicFlight: boolean;
  onHoverPoi: (poi: POI | null, screenPos: { x: number; y: number } | null) => void;
}

export const Map3DCanvas: React.FC<Map3DCanvasProps> = ({
  timeOfDay,
  elevationScale,
  layers,
  selectedPoi,
  onSelectPoi,
  activePreset,
  onPresetFinished,
  isCinematicFlight,
  onHoverPoi,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // References to keep Three.js entities alive across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const terrainWireframeRef = useRef<THREE.Mesh | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const treesGroupRef = useRef<THREE.Group | null>(null);
  const streetLightsGroupRef = useRef<THREE.Group | null>(null);
  const poiMarkersGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Target animation refs
  const cameraAnimRef = useRef<{
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
    duration: number;
    active: boolean;
  }>({
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 1,
    duration: 1.5,
    active: false,
  });

  const [isLoadingTexture, setIsLoadingTexture] = useState(true);
  const [webGlError, setWebGlError] = useState<string | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const mountNode = canvasMountRef.current;
    if (!mountNode || !containerRef.current) return;

    let isMounted = true;
    const width = containerRef.current.clientWidth || window.innerWidth || 800;
    const height = containerRef.current.clientHeight || window.innerHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#93c5fd');
    scene.fog = new THREE.FogExp2('#93c5fd', 0.0018);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, Math.max(0.1, width / (height || 1)), 2, 2000);
    // Initial overview perspective looking towards North-Northwest across Chácara
    camera.position.set(-15, 230, 310);
    cameraRef.current = camera;

    // 3. Renderer with graceful WebGL fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (e) {
      console.error('WebGL not supported or context lost:', e);
      setWebGlError('Seu navegador não suporta aceleração 3D WebGL para renderizar o mapa.');
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    while (mountNode.firstChild) {
      mountNode.removeChild(mountNode.firstChild);
    }
    mountNode.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.06; // Prevent looking under ground
    controls.minDistance = 20;
    controls.maxDistance = 720;
    controls.target.set(-15, 12, -20); // Focus on town center
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5a6838, 0.8);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    dirLight.position.set(160, 240, 180);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 700;
    const shadowD = 280;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. Build Terrain Mesh
    const terrainSize = 640;
    const segments = 160;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    // Apply digital elevation model
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getChacaraTerrainElevation(vx, vz, elevationScale);
      pos.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    // Satellite texture
    const satCanvas = createSatelliteTerrainTexture(2048, 2048);
    const terrainTexture = new THREE.CanvasTexture(satCanvas);
    terrainTexture.wrapS = THREE.ClampToEdgeWrapping;
    terrainTexture.wrapT = THREE.ClampToEdgeWrapping;
    terrainTexture.generateMipmaps = true;

    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTexture,
      roughness: 0.82,
      metalness: 0.05,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Wireframe overlay for topographic inspection
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeMesh = new THREE.Mesh(terrainGeo, wireframeMat);
    wireframeMesh.position.y += 0.2;
    wireframeMesh.visible = false;
    scene.add(wireframeMesh);
    terrainWireframeRef.current = wireframeMesh;

    // Async load live high-res ArcGIS imagery
    enhanceWithLiveSatelliteImagery(satCanvas, () => {
      if (!isMounted) return;
      try {
        terrainTexture.needsUpdate = true;
      } catch (err) {
        console.warn('Could not update texture:', err);
      }
      setIsLoadingTexture(false);
    });

    // 7. Groups
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    const treesGroup = new THREE.Group();
    scene.add(treesGroup);
    treesGroupRef.current = treesGroup;

    const streetLightsGroup = new THREE.Group();
    scene.add(streetLightsGroup);
    streetLightsGroupRef.current = streetLightsGroup;

    const poiMarkersGroup = new THREE.Group();
    scene.add(poiMarkersGroup);
    poiMarkersGroupRef.current = poiMarkersGroup;

    // 8. Build 3D Elevated Houses & Buildings
    buildAllBuildings(buildingsGroup, elevationScale);

    // 9. Build 3D Trees & Forests
    buildAllTrees(treesGroup, elevationScale);

    // 10. Build 3D Streetlights
    buildStreetLights(streetLightsGroup, elevationScale);

    // 11. Build POI Markers
    buildPoiMarkers(poiMarkersGroup, elevationScale);

    // 12. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let flightAngle = 0;

    const animate = () => {
      if (!isMounted) return;
      animationFrameId = requestAnimationFrame(animate);

      try {
        const delta = clock.getDelta();

        // Camera lerp animation
        if (cameraAnimRef.current.active) {
          cameraAnimRef.current.progress += delta / cameraAnimRef.current.duration;
          const t = Math.min(cameraAnimRef.current.progress, 1);
          // Smooth easeInOutCubic
          const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

          camera.position.lerpVectors(
            cameraAnimRef.current.startPos,
            cameraAnimRef.current.endPos,
            easeT
          );
          controls.target.lerpVectors(
            cameraAnimRef.current.startTarget,
            cameraAnimRef.current.endTarget,
            easeT
          );

          if (t >= 1) {
            cameraAnimRef.current.active = false;
            onPresetFinished();
          }
        } else if (isCinematicFlight) {
          // Drone orbit flight
          flightAngle += delta * 0.15;
          const radius = 230;
          camera.position.x = -15 + Math.cos(flightAngle) * radius;
          camera.position.z = -20 + Math.sin(flightAngle) * radius;
          camera.position.y = 135 + Math.sin(flightAngle * 0.7) * 35;
          controls.target.set(-15, 15, -20);
        }

        controls.update();

        // Gentle floating bob for POI markers
        const time = clock.getElapsedTime();
        poiMarkersGroup.children.forEach((child, idx) => {
          if (child.userData.isPoiMarker) {
            child.position.y = child.userData.baseY + Math.sin(time * 2.5 + idx) * 1.4;
            child.quaternion.copy(camera.quaternion); // Always face camera
          }
        });

        renderer.render(scene, camera);
      } catch (renderError) {
        console.warn('Render loop caught error:', renderError);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth || window.innerWidth || 800;
      const newHeight = containerRef.current.clientHeight || window.innerHeight || 600;
      if (newHeight <= 0) return;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      try {
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        controls.dispose();
      } catch {
        // Disposed safely
      }
    };
  }, []);

  // Raycasting for POI and Building clicks & hovers
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      if (poiMarkersGroupRef.current) {
        const poiIntersects = raycaster.intersectObjects(
          poiMarkersGroupRef.current.children,
          true
        );
        if (poiIntersects.length > 0) {
          let current: THREE.Object3D | null = poiIntersects[0].object;
          while (current && !current.userData.poiId) {
            current = current.parent;
          }
          if (current && current.userData.poiId) {
            const found = POIS_DATA.find((p) => p.id === current?.userData.poiId);
            if (found) {
              onSelectPoi(found);
              return;
            }
          }
        }
      }

      if (buildingsGroupRef.current) {
        const buildingIntersects = raycaster.intersectObjects(
          buildingsGroupRef.current.children,
          true
        );
        if (buildingIntersects.length > 0) {
          let current: THREE.Object3D | null = buildingIntersects[0].object;
          while (current && !current.userData.buildingData) {
            current = current.parent;
          }
          if (current && current.userData.buildingData?.poiId) {
            const found = POIS_DATA.find(
              (p) => p.id === current?.userData.buildingData.poiId
            );
            if (found) {
              onSelectPoi(found);
            }
          }
        }
      }
    },
    [onSelectPoi]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!rendererRef.current || !cameraRef.current || !poiMarkersGroupRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(
        poiMarkersGroupRef.current.children,
        true
      );

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.poiId) {
          current = current.parent;
        }
        if (current && current.userData.poiId) {
          const found = POIS_DATA.find((p) => p.id === current?.userData.poiId);
          if (found) {
            onHoverPoi(found, { x: event.clientX, y: event.clientY });
            if (containerRef.current) {
              containerRef.current.style.cursor = 'pointer';
            }
            return;
          }
        }
      }

      onHoverPoi(null, null);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    },
    [onHoverPoi]
  );

  // Respond to elevation scale changes
  useEffect(() => {
    if (!terrainMeshRef.current || !sceneRef.current) return;

    const terrainGeo = terrainMeshRef.current.geometry as THREE.PlaneGeometry;
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getChacaraTerrainElevation(vx, vz, elevationScale);
      pos.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();
    pos.needsUpdate = true;

    if (buildingsGroupRef.current) {
      buildingsGroupRef.current.clear();
      buildAllBuildings(buildingsGroupRef.current, elevationScale);
    }
    if (treesGroupRef.current) {
      treesGroupRef.current.clear();
      buildAllTrees(treesGroupRef.current, elevationScale);
    }
    if (streetLightsGroupRef.current) {
      streetLightsGroupRef.current.clear();
      buildStreetLights(streetLightsGroupRef.current, elevationScale);
    }
    if (poiMarkersGroupRef.current) {
      poiMarkersGroupRef.current.clear();
      buildPoiMarkers(poiMarkersGroupRef.current, elevationScale);
    }
  }, [elevationScale]);

  // Respond to Layer Toggles
  useEffect(() => {
    if (buildingsGroupRef.current) buildingsGroupRef.current.visible = layers.buildings;
    if (treesGroupRef.current) treesGroupRef.current.visible = layers.trees;
    if (streetLightsGroupRef.current) streetLightsGroupRef.current.visible = layers.roads;
    if (poiMarkersGroupRef.current) poiMarkersGroupRef.current.visible = layers.pois;
    if (terrainWireframeRef.current) terrainWireframeRef.current.visible = layers.contourLines;
  }, [layers]);

  // Respond to Time of Day
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current || !ambientLightRef.current)
      return;

    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;
    const amb = ambientLightRef.current;

    if (timeOfDay === 'day') {
      scene.background = new THREE.Color('#93c5fd');
      scene.fog = new THREE.FogExp2('#93c5fd', 0.0018);
      dir.color.set('#fffbeb');
      dir.intensity = 2.2;
      dir.position.set(160, 240, 180);
      hemi.color.set('#ffffff');
      hemi.groundColor.set('#5a6838');
      hemi.intensity = 0.8;
      amb.color.set('#ffffff');
      amb.intensity = 0.7;

      if (streetLightsGroupRef.current) {
        streetLightsGroupRef.current.children.forEach((light) => {
          if (light instanceof THREE.PointLight) light.intensity = 0;
        });
      }
    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color('#fdba74');
      scene.fog = new THREE.FogExp2('#fed7aa', 0.002);
      dir.color.set('#ea580c');
      dir.intensity = 2.8;
      dir.position.set(240, 80, 120); // Low sun angle
      hemi.color.set('#f43f5e');
      hemi.groundColor.set('#78350f');
      hemi.intensity = 0.6;
      amb.color.set('#fed7aa');
      amb.intensity = 0.5;

      if (streetLightsGroupRef.current) {
        streetLightsGroupRef.current.children.forEach((light) => {
          if (light instanceof THREE.PointLight) light.intensity = 0.5;
        });
      }
    } else if (timeOfDay === 'night') {
      scene.background = new THREE.Color('#020617');
      scene.fog = new THREE.FogExp2('#020617', 0.0022);
      dir.color.set('#60a5fa');
      dir.intensity = 0.35; // Moonlight
      dir.position.set(-100, 200, -100);
      hemi.color.set('#1e1b4b');
      hemi.groundColor.set('#020617');
      hemi.intensity = 0.3;
      amb.color.set('#1e293b');
      amb.intensity = 0.25;

      if (streetLightsGroupRef.current) {
        streetLightsGroupRef.current.children.forEach((light) => {
          if (light instanceof THREE.PointLight) light.intensity = 1.8;
        });
      }
    }
  }, [timeOfDay]);

  // Respond to Selected POI (fly to it)
  useEffect(() => {
    if (!selectedPoi || !cameraRef.current || !controlsRef.current) return;

    const terrainY = getChacaraTerrainElevation(selectedPoi.x, selectedPoi.z, elevationScale);
    flyCameraTo(
      cameraRef.current,
      controlsRef.current,
      new THREE.Vector3(selectedPoi.x + 45, terrainY + 38, selectedPoi.z + 55),
      new THREE.Vector3(selectedPoi.x, terrainY + 6, selectedPoi.z),
      1.6
    );
  }, [selectedPoi, elevationScale]);

  // Respond to Camera Presets
  useEffect(() => {
    if (!activePreset || !cameraRef.current || !controlsRef.current) return;

    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (activePreset) {
      case 'overview':
        flyCameraTo(cam, ctrl, new THREE.Vector3(40, 240, 260), new THREE.Vector3(55, 15, -60), 1.8);
        break;
      case 'church': {
        const y = getChacaraTerrainElevation(33, -121, elevationScale);
        flyCameraTo(cam, ctrl, new THREE.Vector3(65, y + 36, -80), new THREE.Vector3(33, y + 10, -121), 1.6);
        break;
      }
      case 'prefeitura': {
        const y = getChacaraTerrainElevation(91, -134, elevationScale);
        flyCameraTo(cam, ctrl, new THREE.Vector3(125, y + 32, -100), new THREE.Vector3(91, y + 8, -134), 1.6);
        break;
      }
      case 'pequena_suica': {
        const y = getChacaraTerrainElevation(-160, -230, elevationScale);
        flyCameraTo(cam, ctrl, new THREE.Vector3(-120, y + 40, -180), new THREE.Vector3(-160, y + 12, -230), 1.8);
        break;
      }
      case 'south_entry': {
        const y = getChacaraTerrainElevation(-22, 15, elevationScale);
        flyCameraTo(cam, ctrl, new THREE.Vector3(15, y + 30, 70), new THREE.Vector3(-22, y + 6, 15), 1.7);
        break;
      }
      case 'aerial_isometric':
        flyCameraTo(cam, ctrl, new THREE.Vector3(-180, 290, 190), new THREE.Vector3(50, 15, -60), 2.0);
        break;
    }
  }, [activePreset, elevationScale]);

  const flyCameraTo = (
    cam: THREE.PerspectiveCamera,
    ctrl: OrbitControls,
    endPos: THREE.Vector3,
    endTarget: THREE.Vector3,
    duration = 1.5
  ) => {
    cameraAnimRef.current = {
      startPos: cam.position.clone(),
      endPos,
      startTarget: ctrl.target.clone(),
      endTarget,
      progress: 0,
      duration,
      active: true,
    };
  };

  if (webGlError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2">Aceleração 3D Indisponível</h2>
          <p className="text-xs text-slate-400 mb-4">{webGlError}</p>
          <p className="text-xs text-slate-500">
            Verifique se a aceleração por hardware está ativada nas configurações do seu navegador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="map-3d-canvas-container"
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Dedicated Three.js canvas mount container with NO React-managed children */}
      <div
        ref={canvasMountRef}
        id="three-canvas-mount"
        className="w-full h-full absolute inset-0"
      />

      {isLoadingTexture && (
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 z-10 border border-slate-700 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Carregando ortofoto de alta precisão de Chácara - MG...</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3D BUILDING GENERATION HELPER
// ==========================================
function buildAllBuildings(parent: THREE.Group, elevationScale: number) {
  const buildingsData = generateChacaraBuildings();

  buildingsData.forEach((bld) => {
    const terrainY = getChacaraTerrainElevation(bld.x, bld.z, elevationScale);
    const bldGroup = new THREE.Group();
    bldGroup.position.set(bld.x, terrainY, bld.z);
    bldGroup.rotation.y = bld.rotation;
    bldGroup.userData = { buildingData: bld };

    // 1. Concrete Sub-Foundation (ensures zero gaps on steep hillside slopes)
    const foundationHeight = 7;
    const foundGeo = new THREE.BoxGeometry(bld.width + 0.4, foundationHeight, bld.depth + 0.4);
    const foundMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Stone / concrete foundation
      roughness: 0.9,
    });
    const foundationMesh = new THREE.Mesh(foundGeo, foundMat);
    foundationMesh.position.y = -foundationHeight / 2;
    foundationMesh.receiveShadow = true;
    bldGroup.add(foundationMesh);

    // 2. Main Wall Body
    const facadeCanvas = createFacadeTexture(bld.wallColor, bld.floors);
    const wallTexture = new THREE.CanvasTexture(facadeCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;

    const wallGeo = new THREE.BoxGeometry(bld.width, bld.height, bld.depth);
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bld.wallColor),
      map: wallTexture,
      roughness: 0.75,
      metalness: 0.05,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = bld.height / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    bldGroup.add(wallMesh);

    // 3. Elevated Roof Architecture
    const roofTextureCanvas = createRoofTexture(bld.roofColor);
    const roofTexture = new THREE.CanvasTexture(roofTextureCanvas);
    roofTexture.wrapS = THREE.RepeatWrapping;
    roofTexture.wrapT = THREE.RepeatWrapping;
    roofTexture.repeat.set(2, 2);

    const roofMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bld.roofColor),
      map: roofTexture,
      roughness: 0.65,
    });

    if (bld.roofType === 'steeple' && bld.type === 'church') {
      // Detailed Paróquia de São Sebastião Model
      buildChurchDetailed(bldGroup, bld, roofMat);
    } else if (bld.roofType === 'gable') {
      // Classic Brazilian 2-Águas Ceramic Gabled Roof
      const roofH = bld.width * 0.32;
      const roofGeo = new THREE.ConeGeometry(bld.width * 0.7, roofH, 4);
      roofGeo.rotateY(Math.PI / 4);
      roofGeo.scale(1, 1, bld.depth / bld.width);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = bld.height + roofH / 2;
      roofMesh.castShadow = true;
      bldGroup.add(roofMesh);
    } else if (bld.roofType === 'hip') {
      // 4-Águas Ceramic Hipped Roof
      const roofH = bld.width * 0.28;
      const hipGeo = new THREE.ConeGeometry(bld.width * 0.72, roofH, 4);
      hipGeo.rotateY(Math.PI / 4);
      hipGeo.scale(1, 1, bld.depth / bld.width);
      const hipMesh = new THREE.Mesh(hipGeo, roofMat);
      hipMesh.position.y = bld.height + roofH / 2;
      hipMesh.castShadow = true;
      bldGroup.add(hipMesh);
    } else if (bld.roofType === 'chalet') {
      // Alpine Swiss Chalet Roof (Pequena Suíça)
      const roofH = bld.width * 0.55; // Steeper pitch
      const chaletGeo = new THREE.ConeGeometry(bld.width * 0.85, roofH, 4);
      chaletGeo.rotateY(Math.PI / 4);
      chaletGeo.scale(1, 1, bld.depth / bld.width);
      const chaletMesh = new THREE.Mesh(chaletGeo, roofMat);
      chaletMesh.position.y = bld.height + roofH / 2;
      chaletMesh.castShadow = true;
      bldGroup.add(chaletMesh);

      // Wooden balcony trim
      const balconyGeo = new THREE.BoxGeometry(bld.width + 1.2, 1, 1.8);
      const balconyMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      const balconyMesh = new THREE.Mesh(balconyGeo, balconyMat);
      balconyMesh.position.set(0, bld.height * 0.55, bld.depth / 2 + 0.9);
      bldGroup.add(balconyMesh);
    } else {
      // Flat terrace roof with authentic Brazilian Blue Water Tank (Caixa d'Água)
      const tankGeo = new THREE.CylinderGeometry(1.2, 1.3, 1.6, 12);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(bld.width * 0.2, bld.height + 0.8, bld.depth * 0.15);
      tankMesh.castShadow = true;
      bldGroup.add(tankMesh);

      // Roof parapet
      const parapetGeo = new THREE.BoxGeometry(bld.width + 0.2, 0.6, bld.depth + 0.2);
      const parapetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
      const parapetMesh = new THREE.Mesh(parapetGeo, parapetMat);
      parapetMesh.position.y = bld.height + 0.3;
      bldGroup.add(parapetMesh);
    }

    // Add Brazilian Flag on Prefeitura Municipal
    if (bld.poiId === 'prefeitura-municipal') {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 12, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8 });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.set(bld.width / 2 - 2, bld.height + 6, bld.depth / 2 - 2);
      bldGroup.add(poleMesh);

      // Green & Yellow Flag
      const flagGeo = new THREE.PlaneGeometry(3.2, 2.2);
      const flagCanvas = document.createElement('canvas');
      flagCanvas.width = 128;
      flagCanvas.height = 88;
      const fCtx = flagCanvas.getContext('2d');
      if (fCtx) {
        fCtx.fillStyle = '#009b3a';
        fCtx.fillRect(0, 0, 128, 88);
        fCtx.fillStyle = '#fedf00';
        fCtx.beginPath();
        fCtx.moveTo(64, 6);
        fCtx.lineTo(122, 44);
        fCtx.lineTo(64, 82);
        fCtx.lineTo(6, 44);
        fCtx.fill();
        fCtx.fillStyle = '#002776';
        fCtx.beginPath();
        fCtx.arc(64, 44, 18, 0, Math.PI * 2);
        fCtx.fill();
      }
      const flagTex = new THREE.CanvasTexture(flagCanvas);
      const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide });
      const flagMesh = new THREE.Mesh(flagGeo, flagMat);
      flagMesh.position.set(bld.width / 2 - 0.4, bld.height + 10, bld.depth / 2 - 2);
      bldGroup.add(flagMesh);
    }

    parent.add(bldGroup);
  });
}

function buildChurchDetailed(parent: THREE.Group, bld: BuildingData, roofMat: THREE.Material) {
  // 1. Church Nave Roof (Pitched colonial roof)
  const naveRoofH = 6;
  const naveRoofGeo = new THREE.ConeGeometry(bld.width * 0.72, naveRoofH, 4);
  naveRoofGeo.rotateY(Math.PI / 4);
  naveRoofGeo.scale(1, 1, bld.depth / bld.width);
  const naveRoofMesh = new THREE.Mesh(naveRoofGeo, roofMat);
  naveRoofMesh.position.y = bld.height + naveRoofH / 2;
  naveRoofMesh.castShadow = true;
  parent.add(naveRoofMesh);

  // 2. Bell Tower (Torre Sineira)
  const towerW = 7.5;
  const towerH = 26;
  const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerW);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
  });
  const towerMesh = new THREE.Mesh(towerGeo, towerMat);
  towerMesh.position.set(0, towerH / 2, bld.depth / 2 - towerW / 2);
  towerMesh.castShadow = true;
  parent.add(towerMesh);

  // 3. Tower Belfry & Arched Openings (Campanário)
  const belfryRoofH = 8;
  const belfryGeo = new THREE.ConeGeometry(towerW * 0.75, belfryRoofH, 4);
  belfryGeo.rotateY(Math.PI / 4);
  const belfryMesh = new THREE.Mesh(belfryGeo, roofMat);
  belfryMesh.position.set(0, towerH + belfryRoofH / 2, bld.depth / 2 - towerW / 2);
  belfryMesh.castShadow = true;
  parent.add(belfryMesh);

  // 4. Church Clock Face
  const clockGeo = new THREE.CircleGeometry(1.6, 16);
  const clockCanvas = document.createElement('canvas');
  clockCanvas.width = 128;
  clockCanvas.height = 128;
  const cCtx = clockCanvas.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#ffffff';
    cCtx.fillRect(0, 0, 128, 128);
    cCtx.strokeStyle = '#0f172a';
    cCtx.lineWidth = 6;
    cCtx.strokeRect(4, 4, 120, 120);
    // Clock hands
    cCtx.beginPath();
    cCtx.moveTo(64, 64);
    cCtx.lineTo(64, 25);
    cCtx.moveTo(64, 64);
    cCtx.lineTo(95, 64);
    cCtx.stroke();
  }
  const clockTex = new THREE.CanvasTexture(clockCanvas);
  const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });
  const clockMesh = new THREE.Mesh(clockGeo, clockMat);
  clockMesh.position.set(0, towerH - 4, bld.depth / 2 + 0.1);
  parent.add(clockMesh);

  // 5. Golden Cross on Spire
  const crossMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Gold
    metalness: 0.9,
    roughness: 0.2,
  });
  const crossVertGeo = new THREE.BoxGeometry(0.4, 3.2, 0.4);
  const crossVertMesh = new THREE.Mesh(crossVertGeo, crossMat);
  crossVertMesh.position.set(0, towerH + belfryRoofH + 1.6, bld.depth / 2 - towerW / 2);
  parent.add(crossVertMesh);

  const crossHorizGeo = new THREE.BoxGeometry(2.0, 0.4, 0.4);
  const crossHorizMesh = new THREE.Mesh(crossHorizGeo, crossMat);
  crossHorizMesh.position.set(0, towerH + belfryRoofH + 2.2, bld.depth / 2 - towerW / 2);
  parent.add(crossHorizMesh);
}

// ==========================================
// 3D TREES & FORESTS
// ==========================================
function buildAllTrees(parent: THREE.Group, elevationScale: number) {
  const treesData = generateChacaraTrees();

  // Instanced Meshes for high performance 60fps rendering
  // 1. Broadleaf Tropical Tree (Mata Atlântica)
  const broadTrunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 6);
  const broadFoliageGeo = new THREE.DodecahedronGeometry(3.2, 1);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const broadMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });

  // 2. Pine / Conifer (Pequena Suíça Hills)
  const pineTrunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 6, 6);
  const pineConeGeo = new THREE.ConeGeometry(2.6, 7, 7);
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x142814, roughness: 0.8 });

  // 3. Palm Tree (Imperial / Jerivá in town gardens)
  const palmTrunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 7, 6);
  const palmCrownGeo = new THREE.ConeGeometry(3.5, 1.5, 6);
  const palmMat = new THREE.MeshStandardMaterial({ color: 0x225422, roughness: 0.7 });

  treesData.forEach((t) => {
    const y = getChacaraTerrainElevation(t.x, t.z, elevationScale);
    const treeGroup = new THREE.Group();
    treeGroup.position.set(t.x, y, t.z);
    treeGroup.scale.setScalar(t.scale);

    if (t.type === 'pine') {
      const trunk = new THREE.Mesh(pineTrunkGeo, trunkMat);
      trunk.position.y = 3;
      trunk.castShadow = true;
      const foliage = new THREE.Mesh(pineConeGeo, pineMat);
      foliage.position.y = 7;
      foliage.castShadow = true;
      treeGroup.add(trunk, foliage);
    } else if (t.type === 'palm') {
      const trunk = new THREE.Mesh(palmTrunkGeo, trunkMat);
      trunk.position.y = 3.5;
      trunk.castShadow = true;
      const crown = new THREE.Mesh(palmCrownGeo, palmMat);
      crown.position.y = 7.5;
      crown.castShadow = true;
      treeGroup.add(trunk, crown);
    } else {
      const trunk = new THREE.Mesh(broadTrunkGeo, trunkMat);
      trunk.position.y = 2;
      trunk.castShadow = true;
      const foliage = new THREE.Mesh(broadFoliageGeo, broadMat);
      foliage.position.y = 5.2;
      foliage.castShadow = true;
      treeGroup.add(trunk, foliage);
    }

    parent.add(treeGroup);
  });
}

// ==========================================
// 3D STREETLIGHTS (GLOW AT NIGHT)
// ==========================================
function buildStreetLights(parent: THREE.Group, elevationScale: number) {
  const lampPositions = [
    // R. Pedro Brum (Centro Comercial)
    [30, -50],
    [50, -40],
    [70, -30],
    [85, -22],
    // Praça Dona Iria & Paróquia de São Sebastião
    [25, -124],
    [33, -115],
    [35, -130],
    // R. Heitor Cândido & Prefeitura / Praça JK
    [82, -136],
    [92, -134],
    [90, -115],
    // R. Raul Pinto (Corredor comercial do vale)
    [55, -75],
    [65, -55],
    [78, -35],
    [95, -10],
    // R. São Sebastião
    [110, -130],
    [140, -120],
    [180, -110],
    // R. Cel. Onofre Augusto de Paula
    [110, -102],
    [150, -90],
    [200, -80],
    // Entrada Sul / Trevo Borracharia
    [-22, 15],
    [-35, 40],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const y = getChacaraTerrainElevation(lx, lz, elevationScale);

    // Lamp Post Pole
    const postGeo = new THREE.CylinderGeometry(0.12, 0.15, 6.5, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const postMesh = new THREE.Mesh(postGeo, postMat);
    postMesh.position.set(lx, y + 3.25, lz);
    parent.add(postMesh);

    // Lamp Head Fixture
    const headGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(lx, y + 6.6, lz);
    parent.add(headMesh);

    // Night Point Light
    const pointLight = new THREE.PointLight(0xfef08a, 0, 35, 1.8);
    pointLight.position.set(lx, y + 6.8, lz);
    parent.add(pointLight);
  });
}

// ==========================================
// 3D POI MARKERS WITH FLOATING LABELS
// ==========================================
function drawCanvasRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

function buildPoiMarkers(parent: THREE.Group, elevationScale: number) {
  POIS_DATA.forEach((poi) => {
    const y = getChacaraTerrainElevation(poi.x, poi.z, elevationScale);
    const baseY = y + 16;

    const markerGroup = new THREE.Group();
    markerGroup.position.set(poi.x, baseY, poi.z);
    markerGroup.userData = {
      isPoiMarker: true,
      poiId: poi.id,
      baseY,
    };

    // Canvas Billboard Label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded pill badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      drawCanvasRoundRect(ctx, 8, 8, 496, 128, 64);
      ctx.fill();

      // Border with POI theme color
      ctx.strokeStyle = poi.color;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Category colored circle
      ctx.fillStyle = poi.color;
      ctx.beginPath();
      ctx.arc(68, 72, 38, 0, Math.PI * 2);
      ctx.fill();

      // Text Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(poi.name, 124, 66, 350);

      // Subtitle (altitude & category)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Alt: ${poi.altitudeMeters}m • Chácara MG`, 124, 104, 350);
    }

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(24, 6.75, 1);
    sprite.userData = { poiId: poi.id };
    markerGroup.add(sprite);

    // Indicator Pin Pointing Down
    const pinStemGeo = new THREE.CylinderGeometry(0.15, 0.05, 8, 8);
    const pinStemMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(poi.color),
      depthTest: false,
    });
    const pinStemMesh = new THREE.Mesh(pinStemGeo, pinStemMat);
    pinStemMesh.position.y = -6;
    markerGroup.add(pinStemMesh);

    // Glowing Ground Ring Target
    const ringGeo = new THREE.RingGeometry(2.5, 3.5, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(poi.color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, -baseY + y + 0.3, 0);
    markerGroup.add(ringMesh);

    parent.add(markerGroup);
  });
}
