import { POI, RoadSegment, BuildingData } from "../types";
import { ROADS_DATA } from "./chacaraRoads";

export { ROADS_DATA };

// Coordenadas geográficas reais e oficiais do município de Chácara - MG
export const CHACARA_GEO = {
  lat: -21.673634,
  lng: -43.2212359,
  name: "Chácara",
  state: "Minas Gerais",
  country: "Brasil",
  altitudeBase: 765, // altitude média no vale urbano
  altitudePeak: 875, // altitude na Serra da Pequena Suíça
  areaKm2: 152.8,
  cep: "36110-000",
  gentilico: "Chacarense",
  ddd: "32",
};

/**
 * Pontos de Interesse (POIs) e Estabelecimentos Oficiais de Chácara - MG
 * Posicionados estritamente nas ruas e coordenadas geográficas reais.
 */
export const POIS_DATA: POI[] = [
  {
    id: "paroquia-sao-sebastiao",
    name: "Paróquia de São Sebastião",
    category: "church",
    lat: -21.672214,
    lng: -43.222045,
    x: 33,
    z: -121,
    altitudeMeters: 792,
    address: "Praça Dona Iria, 75 - Centro",
    description: "Igreja Matriz centenária de Chácara com torre sineira, relógio, praça ajardinada e escadaria voltada para o vale central.",
    iconName: "Church",
    color: "#3b82f6",
  },
  {
    id: "prefeitura-municipal",
    name: "Prefeitura Municipal de Chácara",
    category: "public",
    lat: -21.671997,
    lng: -43.220497,
    x: 91,
    z: -134,
    altitudeMeters: 785,
    address: "R. Heitor Cândido de Oliveira, 60 - Centro",
    description: "Sede administrativa do poder executivo municipal de Chácara, com pórtico cívico e mastros com bandeiras.",
    iconName: "Building2",
    color: "#10b981",
  },
  {
    id: "praca-jk",
    name: "Praça Juscelino Kubitschek",
    category: "landmark",
    lat: -21.67185,
    lng: -43.22072,
    x: 82,
    z: -136,
    altitudeMeters: 784,
    address: "Praça Juscelino K. de Oliveira - Centro",
    description: "Praça cívica arborizada em frente à Prefeitura e na confluência com a Rua São Sebastião.",
    iconName: "Trees",
    color: "#14b8a6",
  },
  {
    id: "centro-chacara",
    name: "Centro Comercial & Histórico",
    category: "landmark",
    lat: -21.674343,
    lng: -43.221419,
    x: 56,
    z: -37,
    altitudeMeters: 772,
    address: "Rua Pedro Brum com Rua Raul Pinto",
    description: "Principal pólo comercial de Chácara com farmácias, padaria, mercearia, lojas e casario tradicional de comércio.",
    iconName: "Store",
    color: "#d97706",
  },
  {
    id: "materiais-sao-matheus",
    name: "Materiais de Construção São Matheus",
    category: "commercial",
    lat: -21.67405,
    lng: -43.2221,
    x: 38,
    z: -48,
    altitudeMeters: 774,
    address: "Rua Pedro Brum, 115 - Centro",
    description: "Tradicional comércio de materiais de construção e suprimentos atendendo toda a cidade e região rural.",
    iconName: "Wrench",
    color: "#f97316",
  },
  {
    id: "escola-municipal",
    name: "Escola Municipal de Chácara",
    category: "public",
    lat: -21.6729,
    lng: -43.2202,
    x: 95,
    z: -90,
    altitudeMeters: 779,
    address: "Rua Nicolau Falci / Cel. Onofre",
    description: "Centro educacional infantil e fundamental que atende as famílias da cidade de Chácara.",
    iconName: "Building2",
    color: "#0284c7",
  },
  {
    id: "bessa-filho",
    name: "Bessa & Filho Comércio",
    category: "commercial",
    lat: -21.671239,
    lng: -43.221768,
    x: 43,
    z: -159,
    altitudeMeters: 802,
    address: "Rua Dona Manuela - Subida Norte",
    description: "Comércio tradicional localizado na subida norte ao longo da Rua Dona Manuela em direção ao topo da serra.",
    iconName: "ShoppingBag",
    color: "#6366f1",
  },
  {
    id: "congregacao-crista",
    name: "Congregação Cristã no Brasil - Chácara",
    category: "church",
    lat: -21.6738,
    lng: -43.2218,
    x: 42,
    z: -18,
    altitudeMeters: 770,
    address: "Rua Martins da Cruz Barreto",
    description: "Templo religioso situado no corredor da Rua Martins da Cruz Barreto com nave espaçosa.",
    iconName: "Church",
    color: "#8b5cf6",
  },
  {
    id: "chacara-recanto-serra",
    name: "Chácara Recanto Da Serra",
    category: "leisure",
    lat: -21.6725,
    lng: -43.2168,
    x: 215,
    z: -108,
    altitudeMeters: 825,
    address: "Rua São Sebastião - Encosta Leste",
    description: "Propriedade campestre e refúgio ecológico nas encostas orientais da cidade, cercado por Mata Atlântica.",
    iconName: "Trees",
    color: "#059669",
  },
  {
    id: "gv-lanches",
    name: "GV Lanches",
    category: "commercial",
    lat: -21.6732,
    lng: -43.2163,
    x: 242,
    z: -77,
    altitudeMeters: 818,
    address: "Rua Coronel Onofre Augusto de Paula (Alto Leste)",
    description: "Ponto gastronômico popular na saída leste de Chácara, muito frequentado por moradores e visitantes.",
    iconName: "Coffee",
    color: "#e11d48",
  },
  {
    id: "sitio-joaozinho-maria",
    name: "Sítio Joãozinho e Maria Hotel de Eventos",
    category: "hotel",
    lat: -21.6745,
    lng: -43.2185,
    x: 165,
    z: -45,
    altitudeMeters: 808,
    address: "Rua Sakar Tanuri (Sakai Tanury)",
    description: "Espaço de eventos campestres, convenções e lazer com piscinas, chalés e área gramada.",
    iconName: "Palmtree",
    color: "#a855f7",
  },
  {
    id: "borracharia-marconato",
    name: "Borracharia Marconato",
    category: "commercial",
    lat: -21.6754,
    lng: -43.2233,
    x: -22,
    z: 15,
    altitudeMeters: 760,
    address: "Trevo Sul / Rua Vereador Luiz Gonzaga Salles",
    description: "Marco comercial e de serviços automotivos no entroncamento sul de acesso a Juiz de Fora.",
    iconName: "Wrench",
    color: "#f59e0b",
  },
  {
    id: "pequena-suica-hotel",
    name: "Pequena Suíça Hotel",
    category: "hotel",
    lat: -21.6698,
    lng: -43.2285,
    x: -160,
    z: -230,
    altitudeMeters: 865,
    address: "Serra de Chácara / Acesso Noroeste",
    description: "Hotel e pousada de montanha no topo da serra noroeste, inspirado na arquitetura alpina com vista panorâmica de Chácara.",
    iconName: "Hotel",
    color: "#ec4899",
  },
];

/**
 * Modelo de elevação topográfica fidedigno de Chácara - MG:
 * - Serra Noroeste (Pequena Suíça) com cume em x ~ -160, z ~ -230
 * - Colina da Igreja Matriz (Praça Dona Iria) em x ~ 33, z ~ -121
 * - Platô da Prefeitura em x ~ 91, z ~ -134
 * - Fundo do vale comercial (R. Pedro Brum, R. Raul Pinto) em x ~ 50..80, z ~ -50..20
 * - Encosta leste (R. Cel. Onofre, Recanto da Serra) subindo suavemente
 */
export function getChacaraTerrainElevation(x: number, z: number, elevationScale = 1.0): number {
  const nx = x / 100;
  const nz = z / 100;
  let elev = 0;

  // 1. Serra Noroeste (Pequena Suíça / cume montanhoso)
  const distNW = Math.hypot(nx + 1.6, nz + 2.3);
  elev += Math.max(0, 42 - distNW * 12);

  // 2. Encosta Leste (Recanto da Serra / Morro Oriental)
  if (nx > 1.1) {
    elev += Math.pow(nx - 1.1, 1.35) * 20;
  }

  // 3. Colina da Igreja Matriz (Praça Dona Iria)
  const distMatriz = Math.hypot(nx - 0.33, nz + 1.21);
  elev += Math.max(0, 8.5 - distMatriz * 6.5);

  // 4. Platô Cívico da Prefeitura (Rua Heitor Cândido)
  const distPref = Math.hypot(nx - 0.91, nz + 1.34);
  elev += Math.max(0, 6 - distPref * 5.5);

  // 5. Vale central por onde corre o córrego e a R. Raul Pinto / R. Pedro Brum
  const valleyDist = Math.abs((nx - 0.65) * 0.8 + (nz + 0.35) * 0.4);
  elev -= Math.exp(-valleyDist * 1.5) * 4.5;

  // 6. Declive geral em direção ao sul (saída de Chácara)
  if (nz > 0.4) {
    elev -= (nz - 0.4) * 3.5;
  }

  // 7. Micro-ondulações típicas da Zona da Mata mineira
  elev += Math.sin(nx * 1.6 + 0.3) * Math.cos(nz * 1.5) * 2.2;

  // Base do terreno sempre acima do piso d água
  return Math.max(2.5, elev + 8) * elevationScale;
}

/**
 * Gera as casas, comércios e edificações rigorosamente alinhadas às ruas reais de Chácara.
 * Todas as casas possuem orientação frontal para a rua e recuo regular de calçada.
 */
export function generateChacaraBuildings(): BuildingData[] {
  const buildings: BuildingData[] = [];
  let idCounter = 1;

  // Paleta autêntica de cores do casario e arquitetura de Chácara / Minas Gerais
  const wallColors = [
    "#f8fafc", // Branco colonial
    "#f1f5f9", // Off-white
    "#fed7aa", // Terracota claro / pêssego
    "#fef08a", // Amarelo canário suave
    "#e2e8f0", // Cimento / cinza claro
    "#bfdbfe", // Azul colonial suave
    "#bbf7d0", // Verde pistache / menta
    "#fbcfe8", // Rosa seco colonial
    "#ffedd5", // Areia colonial
  ];

  const ceramicRoofColors = [
    "#c2410c", // Telha cerâmica tradicional
    "#9a3412", // Telha terracota envelhecida
    "#ea580c", // Telha cerâmica colonial viva
    "#7c2d12", // Telha colonial escura
    "#b45309", // Telha barroca
  ];

  // =========================================================================
  // 1. EDIFICAÇÕES MARCO E ESTABELECIMENTOS HISTÓRICOS (LOCALIZAÇÃO EXATA)
  // =========================================================================

  // A. Paróquia de São Sebastião (Praça Dona Iria, 75)
  buildings.push({
    id: "bld-paroquia",
    x: 33,
    z: -121,
    width: 20,
    depth: 32,
    height: 14,
    floors: 3,
    rotation: 0.15,
    roofType: "steeple",
    wallColor: "#ffffff",
    roofColor: "#b91c1c",
    type: "church",
    name: "Paróquia de São Sebastião",
    poiId: "paroquia-sao-sebastiao",
  });

  // B. Prefeitura Municipal de Chácara (Rua Heitor Cândido, 60)
  buildings.push({
    id: "bld-prefeitura",
    x: 91,
    z: -134,
    width: 22,
    depth: 18,
    height: 9,
    floors: 2,
    rotation: -0.25,
    roofType: "hip",
    wallColor: "#f1f5f9",
    roofColor: "#1e3a8a",
    type: "public",
    name: "Prefeitura Municipal de Chácara",
    poiId: "prefeitura-municipal",
  });

  // C. Escola Municipal (Rua Nicolau Falci / Cel. Onofre)
  buildings.push({
    id: "bld-escola",
    x: 95,
    z: -90,
    width: 24,
    depth: 16,
    height: 8.5,
    floors: 2,
    rotation: 0.35,
    roofType: "hip",
    wallColor: "#e0f2fe",
    roofColor: "#0369a1",
    type: "public",
    name: "Escola Municipal de Chácara",
    poiId: "escola-municipal",
  });

  // D. Centro Comercial & Padaria / Mercearia São Sebastião (R. Pedro Brum x R. Raul Pinto)
  buildings.push({
    id: "bld-centro-comercio",
    x: 56,
    z: -37,
    width: 18,
    depth: 14,
    height: 9,
    floors: 2,
    rotation: 0.28,
    roofType: "gable",
    wallColor: "#fed7aa",
    roofColor: "#c2410c",
    type: "commercial",
    name: "Centro Comercial & Mercearia São Sebastião",
    poiId: "centro-chacara",
  });

  // E. Materiais de Construção São Matheus (Rua Pedro Brum, 115)
  buildings.push({
    id: "bld-sao-matheus",
    x: 38,
    z: -48,
    width: 22,
    depth: 16,
    height: 7.5,
    floors: 2,
    rotation: 0.3,
    roofType: "flat",
    wallColor: "#fef08a",
    roofColor: "#9a3412",
    type: "commercial",
    name: "Materiais de Construção São Matheus",
    poiId: "materiais-sao-matheus",
  });

  // F. Bessa & Filho Comércio (Rua Dona Manuela)
  buildings.push({
    id: "bld-bessa",
    x: 43,
    z: -159,
    width: 16,
    depth: 14,
    height: 7,
    floors: 2,
    rotation: -0.45,
    roofType: "gable",
    wallColor: "#e2e8f0",
    roofColor: "#ea580c",
    type: "commercial",
    name: "Bessa & Filho",
    poiId: "bessa-filho",
  });

  // G. Congregação Cristã no Brasil (Rua Martins da Cruz Barreto)
  buildings.push({
    id: "bld-congregacao",
    x: 42,
    z: -18,
    width: 17,
    depth: 22,
    height: 10,
    floors: 2,
    rotation: 0.1,
    roofType: "gable",
    wallColor: "#ffffff",
    roofColor: "#7c2d12",
    type: "church",
    name: "Congregação Cristã no Brasil",
    poiId: "congregacao-crista",
  });

  // H. Borracharia Marconato (Trevo Sul / R. Ver. Luiz Gonzaga Salles)
  buildings.push({
    id: "bld-marconato",
    x: -22,
    z: 15,
    width: 16,
    depth: 14,
    height: 6,
    floors: 1,
    rotation: -0.6,
    roofType: "flat",
    wallColor: "#fde047",
    roofColor: "#78716c",
    type: "commercial",
    name: "Borracharia Marconato",
    poiId: "borracharia-marconato",
  });

  // I. GV Lanches (Rua Cel. Onofre Augusto de Paula - Alto Leste)
  buildings.push({
    id: "bld-gv-lanches",
    x: 242,
    z: -77,
    width: 15,
    depth: 13,
    height: 6.5,
    floors: 1,
    rotation: 0.1,
    roofType: "hip",
    wallColor: "#fed7aa",
    roofColor: "#b91c1c",
    type: "commercial",
    name: "GV Lanches",
    poiId: "gv-lanches",
  });

  // J. Chácara Recanto da Serra (Rua São Sebastião)
  buildings.push({
    id: "bld-recanto-serra",
    x: 215,
    z: -108,
    width: 18,
    depth: 16,
    height: 7,
    floors: 2,
    rotation: -0.2,
    roofType: "gable",
    wallColor: "#ffedd5",
    roofColor: "#9a3412",
    type: "residential",
    name: "Chácara Recanto Da Serra",
    poiId: "chacara-recanto-serra",
  });

  // K. Sítio Joãozinho e Maria Hotel de Eventos (Rua Sakar Tanuri)
  buildings.push({
    id: "bld-joaozinho-maria",
    x: 165,
    z: -45,
    width: 22,
    depth: 18,
    height: 8,
    floors: 2,
    rotation: 0.15,
    roofType: "hip",
    wallColor: "#fef08a",
    roofColor: "#c2410c",
    type: "commercial",
    name: "Sítio Joãozinho e Maria Hotel de Eventos",
    poiId: "sitio-joaozinho-maria",
  });

  // L. Pequena Suíça Hotel (Serra Noroeste)
  buildings.push({
    id: "bld-pequena-suica",
    x: -160,
    z: -230,
    width: 26,
    depth: 20,
    height: 11,
    floors: 3,
    rotation: 0.4,
    roofType: "gable",
    wallColor: "#78350f",
    roofColor: "#451a03",
    type: "commercial",
    name: "Pequena Suíça Hotel",
    poiId: "pequena-suica-hotel",
  });

  // Chalés alpinos anexos da Pequena Suíça
  const swissChalets = [
    { x: -145, z: -215, rot: 0.35 },
    { x: -175, z: -210, rot: 0.5 },
    { x: -135, z: -240, rot: 0.2 },
    { x: -180, z: -245, rot: 0.45 },
  ];
  swissChalets.forEach((c, idx) => {
    buildings.push({
      id: `bld-chalet-${idx + 1}`,
      x: c.x,
      z: c.z,
      width: 10,
      depth: 11,
      height: 6.5,
      floors: 2,
      rotation: c.rot,
      roofType: "gable",
      wallColor: "#d97706",
      roofColor: "#7c2d12",
      type: "residential",
      name: `Chalé Alpino ${idx + 1}`,
    });
  });

  // =========================================================================
  // 2. CASARIO RESIDENCIAL E COMERCIAL ALINHADO ÀS RUAS REAIS
  // =========================================================================
  let seed = 42891;
  const rnd = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  ROADS_DATA.forEach((road) => {
    const pts = road.points;
    const isCommercialSpine =
      road.name.includes("Pedro Brum") ||
      road.name.includes("Raul Pinto") ||
      road.name.includes("São Sebastião") ||
      road.name.includes("Heitor");

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // Ignora trechos rurais distantes fora da malha urbana
      if (Math.abs(p1[0]) > 250 || Math.abs(p1[1]) > 250) continue;
      if (Math.abs(p2[0]) > 250 || Math.abs(p2[1]) > 250) continue;

      const dx = p2[0] - p1[0];
      const dz = p2[1] - p1[1];
      const len = Math.hypot(dx, dz);
      if (len < 3) continue;

      const ux = dx / len;
      const uz = dz / len;
      // Vetor normal perpendicular à rua
      const nx = -uz;
      const nz = ux;
      const angle = Math.atan2(dx, dz);

      // Espaçamento entre casas ao longo da rua
      const spacing = 16;
      const steps = Math.floor(len / spacing);

      for (let s = 1; s <= steps; s++) {
        const t = (s * spacing) / len;
        const cx = p1[0] + dx * t;
        const cz = p1[1] + dz * t;

        // Recuo de calçada da margem da rua
        const setback = road.width / 2 + 5.5 + rnd() * 1.5;

        // Gerar casas em ambos os lados da via
        const sides = [
          { sideX: cx + nx * setback, sideZ: cz + nz * setback, rot: angle },
          { sideX: cx - nx * setback, sideZ: cz - nz * setback, rot: angle + Math.PI },
        ];

        sides.forEach((side) => {
          // Garante distância segura dos marcos históricos e outros edifícios
          const tooClose = buildings.some(
            (b) => Math.hypot(b.x - side.sideX, b.z - side.sideZ) < 13
          );
          if (tooClose) return;

          const isCommercial = isCommercialSpine && rnd() < 0.45;
          const floors = isCommercial ? (rnd() > 0.4 ? 2 : 3) : (rnd() > 0.75 ? 2 : 1);
          const height = floors * 3.3 + rnd() * 0.8;
          const width = 8 + rnd() * 5;
          const depth = 9 + rnd() * 6;

          const roofRnd = rnd();
          const roofType = roofRnd > 0.45 ? "gable" : (roofRnd > 0.2 ? "hip" : "flat");
          const wallColor = wallColors[Math.floor(rnd() * wallColors.length)];
          const roofColor = ceramicRoofColors[Math.floor(rnd() * ceramicRoofColors.length)];

          buildings.push({
            id: `bld-street-${idCounter++}`,
            x: Math.round(side.sideX * 10) / 10,
            z: Math.round(side.sideZ * 10) / 10,
            width: Math.round(width * 10) / 10,
            depth: Math.round(depth * 10) / 10,
            height: Math.round(height * 10) / 10,
            floors,
            rotation: side.rot + (rnd() - 0.5) * 0.1, // ligeira variação natural
            roofType,
            wallColor,
            roofColor,
            type: isCommercial ? "commercial" : "residential",
          });
        });
      }
    }
  });

  return buildings;
}

// Árvores e vegetação nativa da Mata Atlântica de Chácara
export interface TreeData {
  x: number;
  z: number;
  scale: number;
  type: "pine" | "broadleaf" | "palm";
}

export function generateChacaraTrees(): TreeData[] {
  const trees: TreeData[] = [];
  let seed = 76543;
  const rnd = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // 1. Floresta de pinheiros e mata densa na Serra Noroeste (Pequena Suíça)
  for (let i = 0; i < 90; i++) {
    const angle = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 85;
    trees.push({
      x: -160 + Math.cos(angle) * r,
      z: -230 + Math.sin(angle) * r,
      scale: 0.85 + rnd() * 0.7,
      type: "pine",
    });
  }

  // 2. Mata ciliar e encostas verdes atrás da Praça Dona Iria e Prefeitura
  for (let i = 0; i < 70; i++) {
    const angle = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 65;
    trees.push({
      x: 60 + Math.cos(angle) * r,
      z: -180 + Math.sin(angle) * r,
      scale: 0.8 + rnd() * 0.8,
      type: "broadleaf",
    });
  }

  // 3. Floresta nativa da encosta oriental (Chácara Recanto da Serra)
  for (let i = 0; i < 90; i++) {
    const angle = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 80;
    trees.push({
      x: 210 + Math.cos(angle) * r,
      z: -110 + Math.sin(angle) * r,
      scale: 0.8 + rnd() * 0.8,
      type: rnd() > 0.35 ? "broadleaf" : "pine",
    });
  }

  // 4. Palmeiras e jardins na Praça Dona Iria e Praça JK
  const plazaTrees = [
    { x: 30, z: -112 },
    { x: 36, z: -112 },
    { x: 26, z: -128 },
    { x: 40, z: -128 },
    { x: 80, z: -130 },
    { x: 84, z: -142 },
    { x: 76, z: -140 },
  ];
  plazaTrees.forEach((pt) => {
    trees.push({
      x: pt.x,
      z: pt.z,
      scale: 0.8 + rnd() * 0.4,
      type: "palm",
    });
  });

  // 5. Vegetação de quintais e encostas suaves
  for (let i = 0; i < 80; i++) {
    const x = (rnd() - 0.5) * 380;
    const z = (rnd() - 0.5) * 380;
    trees.push({
      x,
      z,
      scale: 0.65 + rnd() * 0.5,
      type: rnd() > 0.4 ? "palm" : "broadleaf",
    });
  }

  return trees;
}
