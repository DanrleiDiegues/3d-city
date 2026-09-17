import { ROADS_DATA, getChacaraTerrainElevation } from '../data/chacaraData';

/**
 * Creates a high-resolution, photorealistic satellite orthophoto canvas texture
 * representing the exact layout, roads, forest cover, and terrain of Chácara - MG.
 */
export function createSatelliteTerrainTexture(width = 2048, height = 2048): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Base Terrain: Minas Gerais tropical highland soil and pasture
  // Warm olive-green base with natural variations
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, '#5a6838'); // Forest green
  baseGrad.addColorStop(0.3, '#747f44'); // Highland pasture
  baseGrad.addColorStop(0.6, '#878c48'); // Dry grass / pasture
  baseGrad.addColorStop(1, '#535f32'); // Southern hillside
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper coordinate mapper: World (-300 to 300) -> Canvas (0 to width)
  const mapX = (x: number) => ((x + 300) / 600) * width;
  const mapY = (z: number) => ((z + 300) / 600) * height;

  // 2. Add realistic natural soil & terrain variations (terra roxa / latossolo patches)
  const soilPatches = [
    { x: -160, z: -200, r: 60, col: 'rgba(168, 102, 59, 0.45)' }, // Cutting near Pequena Suíça
    { x: -20, z: 20, r: 45, col: 'rgba(180, 115, 65, 0.4)' }, // South entry
    { x: 210, z: -100, r: 70, col: 'rgba(160, 95, 55, 0.35)' }, // East hill earth
    { x: 50, z: -30, r: 50, col: 'rgba(175, 110, 60, 0.4)' }, // Center clearing
    { x: 140, z: 20, r: 40, col: 'rgba(165, 105, 58, 0.35)' },
  ];

  soilPatches.forEach((p) => {
    const cx = mapX(p.x);
    const cy = mapY(p.z);
    const cr = (p.r / 600) * width;
    const grad = ctx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr);
    grad.addColorStop(0, p.col);
    grad.addColorStop(1, 'rgba(168, 102, 59, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Dense Forest Areas (Atlantic Forest / Mata Atlântica on North and East hills)
  const forestAreas = [
    // North hill forest behind church & prefeitura
    { x: 60, z: -190, rx: 120, ry: 70, angle: 0.1 },
    // Northwest forest near Pequena Suíça
    { x: -170, z: -230, rx: 90, ry: 90, angle: 0.3 },
    // Northeast and East slopes (Recanto da Serra)
    { x: 210, z: -120, rx: 110, ry: 80, angle: -0.2 },
    // Southeast valley vegetation
    { x: 130, z: 60, rx: 70, ry: 100, angle: 0.4 },
  ];

  forestAreas.forEach((f) => {
    const cx = mapX(f.x);
    const cy = mapY(f.z);
    const rx = (f.rx / 600) * width;
    const ry = (f.ry / 600) * height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(f.angle);

    const grad = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(28, 48, 22, 0.85)'); // Deep forest canopy
    grad.addColorStop(0.7, 'rgba(40, 65, 30, 0.7)');
    grad.addColorStop(1, 'rgba(60, 85, 40, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 4. Urban parcels / Lotting fabric in the valley center
  // Subtle urban texture representing backyards, patios, stone walkways
  const urbanCenters = [
    { x: 55, z: -40, r: 100 },
    { x: 33, z: -121, r: 75 },
    { x: 91, z: -134, r: 75 },
    { x: 165, z: -45, r: 65 },
    { x: 215, z: -85, r: 60 },
    { x: -20, z: 20, r: 55 },
  ];

  urbanCenters.forEach((uc) => {
    const cx = mapX(uc.x);
    const cy = mapY(uc.z);
    const cr = (uc.r / 600) * width;

    const grad = ctx.createRadialGradient(cx, cy, cr * 0.2, cx, cy, cr);
    grad.addColorStop(0, 'rgba(125, 128, 110, 0.45)');
    grad.addColorStop(0.7, 'rgba(110, 115, 95, 0.25)');
    grad.addColorStop(1, 'rgba(110, 115, 95, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Draw the road network matching the satellite image
  ROADS_DATA.forEach((road) => {
    if (road.points.length < 2) return;

    // Road Bed / Sidewalk border
    ctx.beginPath();
    ctx.moveTo(mapX(road.points[0][0]), mapY(road.points[0][1]));
    for (let i = 1; i < road.points.length; i++) {
      ctx.lineTo(mapX(road.points[i][0]), mapY(road.points[i][1]));
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer gravel / curb edge
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = ((road.width + 2) / 600) * width;
    ctx.stroke();

    // Road asphalt / cobblestone surface
    ctx.strokeStyle = road.type === 'main' ? '#475569' : '#64748b';
    ctx.lineWidth = (road.width / 600) * width;
    ctx.stroke();

    // Centerline dashed marking on main roads
    if (road.type === 'main') {
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)'; // Yellow road stripe
      ctx.lineWidth = Math.max(1, (0.6 / 600) * width);
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // 6. Church Plaza (Praça Dona Iria da Paróquia de São Sebastião)
  const churchPlazaX = mapX(33);
  const churchPlazaY = mapY(-121);
  ctx.fillStyle = '#cbd5e1'; // Paved stone plaza
  ctx.beginPath();
  ctx.arc(churchPlazaX, churchPlazaY, 18, 0, Math.PI * 2);
  ctx.fill();

  // Praça Juscelino Kubitschek & Prefeitura Forecourt
  const prefX = mapX(91);
  const prefY = mapY(-134);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(prefX - 14, prefY - 10, 28, 20);

  // Sítio Joãozinho e Maria Swimming Pool & Event Lawn
  const poolX = mapX(165);
  const poolY = mapY(-45);
  ctx.fillStyle = '#38bdf8'; // Crystal blue swimming pool
  ctx.fillRect(poolX - 8, poolY - 5, 16, 10);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(poolX - 8, poolY - 5, 16, 10);

  return canvas;
}

/**
 * Attempts to load live satellite imagery tiles from ArcGIS World Imagery
 * and composite them onto the canvas ONLY if CORS is valid, avoiding canvas tainting.
 */
export async function enhanceWithLiveSatelliteImagery(
  canvas: HTMLCanvasElement,
  onLoaded?: () => void
) {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (onLoaded) onLoaded();
      return;
    }

    // Center tile at z=16: x=24899, y=36811
    // We fetch a 3x3 grid of tiles around the center
    const z = 16;
    const centerTileX = 24899;
    const centerTileY = 36811;

    const tiles: { x: number; y: number; img: HTMLImageElement }[] = [];
    const promises: Promise<void>[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tx = centerTileX + dx;
        const ty = centerTileY + dy;
        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Verify that this image does NOT taint canvas
            try {
              const testCanvas = document.createElement('canvas');
              testCanvas.width = 4;
              testCanvas.height = 4;
              const testCtx = testCanvas.getContext('2d');
              if (testCtx) {
                testCtx.drawImage(img, 0, 0, 4, 4);
                // If tainted, getImageData will throw SecurityError
                testCtx.getImageData(0, 0, 1, 1);
                tiles.push({ x: dx, y: dy, img });
              }
            } catch {
              // Image is tainted by CORS, discard safely
            }
            resolve();
          };
          img.onerror = () => {
            resolve(); // Fail gracefully
          };
          img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;
        });
        promises.push(p);
      }
    }

    await Promise.all(promises);

    if (tiles.length >= 4) {
      // Draw satellite tiles over canvas with smooth overlay
      const tileSize = canvas.width / 3;
      tiles.forEach((t) => {
        const drawX = (t.x + 1) * tileSize;
        const drawY = (t.y + 1) * tileSize;
        ctx.globalAlpha = 0.88;
        ctx.drawImage(t.img, drawX, drawY, tileSize, tileSize);
        ctx.globalAlpha = 1.0;
      });

      // Final test to ensure canvas is clean before calling onLoaded
      try {
        ctx.getImageData(0, 0, 1, 1);
        if (onLoaded) onLoaded();
      } catch {
        console.warn('Canvas was tainted by satellite imagery; retaining local terrain texture.');
      }
    } else {
      if (onLoaded) onLoaded();
    }
  } catch (err) {
    console.warn('Live satellite imagery loading skipped:', err);
    if (onLoaded) onLoaded();
  }
}

/**
 * Generates a realistic ceramic terracotta roof texture
 */
export function createRoofTexture(baseColor = '#b91c1c'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal tile ridges (telhas coloniais)
  for (let y = 0; y < 256; y += 16) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, y, 256, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, y + 3, 256, 2);
  }

  // Vertical staggered tile joints
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    const offset = (row % 2) * 12;
    for (let x = offset; x < 256; x += 24) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(x, y, 2, 16);
    }
  }

  return canvas;
}

/**
 * Generates realistic Brazilian townhouse facade texture with windows and door
 */
export function createFacadeTexture(wallColor = '#ffffff', floors = 2): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle wall plaster texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Windows and Doors
  const floorHeight = 256 / floors;

  for (let f = 0; f < floors; f++) {
    const floorY = 256 - (f + 1) * floorHeight;

    if (f === 0) {
      // Ground floor: Entrance door + ground window
      // Door
      ctx.fillStyle = '#451a03'; // Wooden door
      ctx.fillRect(40, floorY + floorHeight * 0.35, 36, floorHeight * 0.65);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(40, floorY + floorHeight * 0.35, 36, floorHeight * 0.65);

      // Window
      drawWindow(ctx, 130, floorY + floorHeight * 0.35, 45, floorHeight * 0.45);
      drawWindow(ctx, 195, floorY + floorHeight * 0.35, 45, floorHeight * 0.45);
    } else {
      // Upper floors: Regular windows with shutters
      drawWindow(ctx, 35, floorY + floorHeight * 0.25, 45, floorHeight * 0.5);
      drawWindow(ctx, 105, floorY + floorHeight * 0.25, 45, floorHeight * 0.5);
      drawWindow(ctx, 175, floorY + floorHeight * 0.25, 45, floorHeight * 0.5);
    }
  }

  return canvas;
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Window frame
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

  // Glass pane (reflecting blue sky)
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x, y, w, h);

  // Glass highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.6, y);
  ctx.lineTo(x, y + h * 0.6);
  ctx.fill();

  // Grid / Mullions
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}
