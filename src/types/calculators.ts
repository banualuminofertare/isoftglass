// Product Types
export type ProductType = 
  | 'shower' 
  | 'balustrade' 
  | 'door' 
  | 'panel' 
  | 'mirror' 
  | 'kitchen_front';

// Glass Types
export type GlassThickness = 6 | 8 | 10 | 12;

export type GlassType = 
  | 'clear' 
  | 'frosted' 
  | 'patterned' 
  | 'bronze' 
  | 'grey' 
  | 'green' 
  | 'low_e';

// Finish Types
export type FinishType = 
  | 'polished_stainless' 
  | 'brushed_stainless' 
  | 'matte_black' 
  | 'chrome' 
  | 'anodized_silver'
  | 'gold'
  | 'ral_painted'
  | (string & {}); // permite variant_code din DB

export interface AccessorySelection {
  materialCode: string;
  name: string;
  unitPrice?: number;
}

// Common Interfaces
export interface Dimensions {
  width: number;
  height: number;
  depth?: number;
}

export interface PriceBreakdown {
  glass: number;
  processing: number;
  accessories: number;
  labor: number;
  total: number;
}

export interface ConfigurationBase {
  id?: string;
  productType: ProductType;
  dimensions: Dimensions;
  glass: {
    thickness: GlassThickness;
    type: GlassType;
  };
  totalPrice: PriceBreakdown;
  createdAt?: string;
}

// Shower Calculator Types
export type ShowerCabinType = 'corner_90' | 'walk_in' | 'pentagon' | 'bathtub' | 'fixed_panel';
export type ShowerDoorType = 'hinged' | 'pivot' | 'sliding';

export type HingeSide = 'left' | 'right';
export type DoorPosition = 'left' | 'right';
export type DoorOpenDirection = 'inward' | 'outward';
/** @deprecated Use fixedPanel.left / fixedPanel.right instead */
export type FixedPanelPosition = 'left' | 'right';

// Latura pe care se află deschiderea (ușa + panou parțial)
export type OpeningSide = 'front' | 'lateral';

export interface ShowerAccessories {
  openingSide: OpeningSide;
  door: {
    position: DoorPosition;
    openDirection: DoorOpenDirection;
    hingeSide: HingeSide;
    slidingDirection?: 'left' | 'right';
  };
  fixedPanel: {
    left: {
      enabled: boolean;
      width: number; // mm
      height?: number; // mm, measured from top down; defaults to cabin height
    };
    right: {
      enabled: boolean;
      width: number; // mm
      height?: number; // mm, measured from top down; defaults to cabin height
    };
  };
  hinges: {
    type: 'wall_glass' | 'glass_glass';
    quantity: number;
    finish: FinishType;
    materialCode?: string;
    positions?: number[]; // positions in mm from base
    selections?: AccessorySelection[];
  };
  handle: {
    model: 'bar' | 'round' | 'square';
    length: number;
    finish: FinishType;
    materialCode?: string;
    positionY?: number; // position in mm from base, default: height/2
    selections?: AccessorySelection[];
  };
  seals: {
    magnetic: boolean;
    magneticMaterialCode?: string;
    magneticSelections?: AccessorySelection[];
    magneticSealDeduction?: number; // mm deduction from glass when magnetic seal is used
    totalWidthDeduction?: number; // aggregated width deduction from all accessories (mm)
    totalHeightDeduction?: number; // aggregated height deduction from all accessories (mm)
    rubber: boolean;
    rubberMaterialCode?: string;
    rubberSelections?: AccessorySelection[];
    threshold: boolean;
    thresholdMaterialCode?: string;
    thresholdSelections?: AccessorySelection[];
  };
  stabilizerShape?: 'round' | 'rectangular';
  stabilizers: Array<{
    type: 'wall_glass' | 'glass_glass' | 'ceiling';
    length: number;
    position: 'top' | 'diagonal';
    materialCode?: string;
  }>;
  stabilizerSelections?: Array<AccessorySelection & { length: number }>;
  profiles: {
    enabled: boolean;
    type: 'u_profile' | 'compensation';
    finish: FinishType;
    materialCode?: string;
    selections?: AccessorySelection[];
    sides?: { left: boolean; right: boolean; top: boolean; bottom: boolean };
    deductFullProfileHeight?: boolean;
  };
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Edge polishing configuration - shared across products
export interface EdgePolishConfig {
  enabled: boolean;
  type: EdgePolishType;
}

export interface LateralConfig {
  enabled: boolean;
  doorType: ShowerDoorType;
  fixedPanel: {
    left: { enabled: boolean; width: number; height?: number };
    right: { enabled: boolean; width: number; height?: number };
  };
  door: {
    position: DoorPosition;
    openDirection: DoorOpenDirection;
    hingeSide: HingeSide;
    slidingDirection?: 'left' | 'right';
  };
  hinges: {
    type: 'wall_glass' | 'glass_glass';
    quantity: number;
    finish: FinishType;
    materialCode?: string;
    positions?: number[];
    selections?: AccessorySelection[];
  };
  handle: {
    model: 'bar' | 'round' | 'square';
    length: number;
    finish: FinishType;
    materialCode?: string;
    positionY?: number;
    selections?: AccessorySelection[];
  };
  seals: {
    magnetic: boolean;
    magneticMaterialCode?: string;
    magneticSelections?: AccessorySelection[];
    magneticSealDeduction?: number; // mm deduction from glass when magnetic seal is used
    totalWidthDeduction?: number; // aggregated width deduction from lateral accessories (mm)
    totalHeightDeduction?: number; // aggregated height deduction from lateral accessories (mm)
    rubber: boolean;
    rubberMaterialCode?: string;
    rubberSelections?: AccessorySelection[];
    threshold: boolean;
    thresholdMaterialCode?: string;
    thresholdSelections?: AccessorySelection[];
  };
}

export interface ShowerConfig {
  cabinType: ShowerCabinType;
  doorType: ShowerDoorType;
  slidingMechanismCode?: string; // code from sliding_mechanisms, maps to pricing_config
  dimensions: {
    width: number;
    height: number;
    depth: number;
    doorWidth: number;
    lateralDoorWidth: number;
    /** When set, lateral full panel becomes trapezoidal: heightA = wall side, heightB = corner side */
    lateralHeightA?: number;
    lateralHeightB?: number;
    /** When set, frontal panels become trapezoidal: heightA = left side, heightB = right side */
    frontalHeightA?: number;
    frontalHeightB?: number;
  };
  glass: {
    thickness: 8 | 10;
    type: 'clear' | 'frosted' | 'patterned' | 'bronze' | 'grey' | 'timeless';
    isLaminated: boolean;
    antiCalc: boolean;
    colorHex?: string;
  };
  accessories: ShowerAccessories;
  lateralConfig: LateralConfig;
  edgePolish: EdgePolishConfig;
  pentagonSides?: { left: boolean; right: boolean; back: boolean };
}

// Balustrade Calculator Types
export type BalustradePlacement = 'interior' | 'exterior' | 'stairs';
export type BalustradeMountType = 'point_mount' | 'u_profile' | 'handrail';

// Mount options - allows multiple selections
export interface MountOptions {
  pointMount: boolean;
  uProfile: boolean;
  handrail: boolean;
}

// Stair mounting position type
export type StairsMountPosition = 'side' | 'tread';

export interface StairsConfig {
  stepCount: number;       // Number of steps
  stepHeight: number;      // Step riser height (mm) - default 170
  stepDepth: number;       // Step tread depth (mm) - default 300
  angle: number;           // Incline angle (calculated from stepHeight/stepDepth)
  heightMin: number;       // Minimum panel height (mm)
  heightMax: number;       // Maximum panel height (mm)
  mountPosition: StairsMountPosition;  // Mounting on tread or side stringer
  // Intermediate landing (podest intermediar)
  hasIntermediateLanding: boolean;   // Enable landing
  landingLength: number;             // Landing length in mm (e.g., 1000)
  landingPosition: number;           // After how many steps (e.g., 5 = after step 5)
  // Final landing (podest final)
  finalLandingLength: number;        // Final landing length in mm (e.g., 800)
  // Panel heights (all in mm)
  stairPanelHeight: number;              // Panel height on stair ramp (e.g., 1000)
  intermediateLandingPanelHeight: number; // Panel height on intermediate landing
  finalLandingPanelHeight: number;        // Panel height on final landing
  // Mount points configuration for landings
  intermediateLandingMountCount?: number;  // Number of mount points on intermediate landing (default: 3)
  finalLandingMountCount?: number;         // Number of mount points on final landing (default: 3)
  // Panel count per ramp (when intermediate landing is enabled)
  ramp1PanelCount?: number;  // Number of panels on ramp 1 (before intermediate landing)
  ramp2PanelCount?: number;  // Number of panels on ramp 2 (after intermediate landing)
}

export interface GlassDeductions {
  totalWidthDeduction?: number;
  totalHeightDeduction?: number;
}

export interface BalustradeConfig {
  placement: BalustradePlacement;
  mountType: BalustradeMountType;
  mountOptions: MountOptions;
  dimensions: {
    length: number;
    height: number;
    panelCount: number;
    stairsConfig?: StairsConfig;
    corners?: {
      left?: { enabled: boolean; length: number; panelCount?: number; subCorners?: { left?: { enabled: boolean; length: number; panelCount?: number }; right?: { enabled: boolean; length: number; panelCount?: number } } };
      right?: { enabled: boolean; length: number; panelCount?: number; subCorners?: { left?: { enabled: boolean; length: number; panelCount?: number }; right?: { enabled: boolean; length: number; panelCount?: number } } };
    };
    cornerConnector?: {
      materialCode?: string;
      materialCodes?: string[];
      quantity: number;
    };
  };
  glass: {
    thickness: 8 | 10 | 12;
    type: 'clear' | 'frosted';
    laminated: boolean;
    colorHex?: string;
  };
  accessories: {
    mountPoints: {
      model: string;
      quantity: number;
      finish: FinishType;
      spacing?: number; // Distance between mount points in mm (default 300)
      materialCode?: string;
      materialCodes?: string[];
    };
    handrail: {
      diameter: 42 | 50;
      type: 'round' | 'square';
      length: number;
      finish: FinishType;
      materialCode?: string;
      materialCodes?: string[];
    } | null;
    uProfile: {
      size: string;
      finish: FinishType;
    } | null;
  };
  edgePolish: EdgePolishConfig;
  glassDeductions?: GlassDeductions;
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Door Calculator Types
export type DoorType = 'hinged' | 'pivot' | 'sliding';
export type FrameType = 'none' | 'aluminum' | 'wood';

export interface EdgeCutout {
  id: string;
  side: 'left' | 'right' | 'center';
  verticalPosition?: 'top' | 'bottom'; // doar pentru left/right
  depth: number;    // X - adâncime în sticlă (mm)
  length: number;   // Y - dimensiunea pe latură (mm)
  position?: number; // cota opțională Y (mm de la bază)
  positionX?: number; // cota opțională X (mm de la stânga) - pentru center
}

export interface DoorConfig {
  doorType: DoorType;
  frameType: FrameType;
  dimensions: {
    width: number;
    height: number;
    openingWidth?: number;
  };
  glass: {
    thickness: 8 | 10;
    type: 'clear' | 'frosted' | 'patterned' | 'frosted_cutout';
    colorHex?: string;
  };
  accessories: {
    hinges?: {
      type: string;
      quantity: number;
      finish: FinishType;
      materialCode?: string;
      positions?: number[]; // positions in mm from base
    };
    pivot?: {
      type: string;
      withDamper: boolean;
      materialCode?: string;
    };
    slidingSystem?: {
      rail: string;
      rollers: string;
      damper: boolean;
      slidingDirection?: 'left' | 'right';
      materialCode?: string;
    };
    handle: {
      model: string;
      length: number;
      finish: FinishType;
      materialCode?: string;
      positionY?: number; // position in mm from base, default: height/2
    };
    lock: {
      enabled: boolean;
      type: 'central_strike' | 'corner_lock' | 'lock_counterlock';
      materialCode?: string;
    };
    seals: {
      lateral: boolean;
      threshold: boolean;
      materialCode?: string;
      lateralMaterialCode?: string;
      lateralSelections?: AccessorySelection[];
      thresholdMaterialCode?: string;
    };
  };
  edgePolish: EdgePolishConfig;
  glassDeductions?: GlassDeductions;
  cutouts?: EdgeCutout[];
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Panel Calculator Types
export type EdgePolishType = 'none' | 'matte' | 'polished' | 'beveled' | 'cnc';
export type PartitionProfileType = 'aluminum' | 'steel' | 'none';
export type PartitionCellType = 'panel' | 'door_opening' | 'door';
export type PartitionDoorType = 'hinged' | 'pivot' | 'sliding';

export interface HoleSpec {
  id: string;
  diameter: number;
  x: number;
  y: number;
}

export interface CutoutSpec {
  id: string;
  type: 'rectangle' | 'l_shape' | 'u_shape';
  width: number;
  height: number;
  x: number;
  y: number;
}

// Partition Wall Types
export interface GridCell {
  id: string;
  row: number;
  col: number;
  type: PartitionCellType;
  width: number;
  height: number;
}

export type PTUSSize = 10 | 20 | 30 | 31 | 40 | 60;

export interface PTUSConfig {
  size: PTUSSize;
  quantity: number;
}

export type PartitionHingeType = 'normal' | 'hydraulic' | 'lift';

export interface PartitionDoorAccessories {
  handle: {
    model: 'bar' | 'round' | 'square';
    length: number;
    finish: FinishType;
    materialCode?: string;
    positionY?: number; // position in mm from base
  };
  lock: {
    enabled: boolean;
    type: 'central_strike' | 'corner_lock' | 'lock_counterlock';
    materialCode?: string;
  };
  hinges: {
    type: PartitionHingeType;
    quantity: number;
    finish: FinishType;
    materialCode?: string;
    positions?: number[]; // positions in mm from base
  };
  pt?: PTUSConfig;
  ptBottom?: PTUSConfig;
  ptTop?: PTUSConfig;
  bts?: PTUSConfig;
  pt40?: PTUSConfig;
  us?: PTUSConfig;
  gk30?: PTUSConfig;
  blockers?: {
    quantity: number;
  };
  extraAccessories?: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
  labelOffsets?: {
    [key: string]: { x: number; y: number };
  };
}

export interface PartitionDoorConfig {
  cellId: string;
  doorType: PartitionDoorType;
  doorWidth: number;
  doorHeight: number;
  hingeSide: HingeSide;
  openDirection: DoorOpenDirection;
  hasFrame: boolean;
  frameQuantity: number;
  slidingRailLength: number; // Rail length in mm for sliding doors
  accessories: PartitionDoorAccessories;
}

export interface PartitionWallGrid {
  columns: number;
  columnWidths: number[];
  columnRows: number[];  // Number of rows per column: [2, 1, 3] = col 0 has 2 rows, col 1 has 1, col 2 has 3
  columnRowHeights: number[][];  // Heights per row per column: [[1250, 1250], [2500], [833, 833, 834]]
}

export interface ProfileSides {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface PartitionWallConfig {
  enabled: boolean;
  totalWidth: number;
  totalHeight: number;
  grid: PartitionWallGrid;
  cells: GridCell[];
  doors: PartitionDoorConfig[];
  profileType: PartitionProfileType;
  profileWidth: number;
  profileMaterialCode?: string;
  profileSelections?: AccessorySelection[];
  profileSides: ProfileSides;
  profile90Degree?: {
    enabled: boolean;
    quantity: number; // Number of 90-degree PVC profiles
  };
  sidePanels?: {
    left?: { enabled: boolean; width: number; height?: number; profileWidth?: number; profileSides?: { front: boolean; back: boolean; top: boolean; bottom: boolean }; grid?: PartitionWallGrid; cells?: GridCell[] };
    right?: { enabled: boolean; width: number; height?: number; profileWidth?: number; profileSides?: { front: boolean; back: boolean; top: boolean; bottom: boolean }; grid?: PartitionWallGrid; cells?: GridCell[] };
  };
}

export interface PanelConfig {
  productType: 'simple' | 'processed' | 'partition_wall';
  dimensions: {
    width: number;
    height: number;
    quantity: number;
  };
  glass: {
    thickness: GlassThickness;
    type: GlassType;
    tempered: boolean;
    laminated: boolean;
    colorHex?: string;
  };
  processing: {
    holes: HoleSpec[];
    cutouts: CutoutSpec[];
    sandblasting: 'none' | 'full' | 'partial';
    bevel: {
      enabled: boolean;
      width: number;
    };
  };
  edgePolish: EdgePolishConfig;
  partitionWall?: PartitionWallConfig;
  glassDeductions?: GlassDeductions;
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Mirror Calculator Types
export type MirrorShape = 'rectangle' | 'square' | 'circle' | 'oval' | 'custom';
export type MirrorType = 'silver' | 'bronze' | 'grey';
export type LEDType = 'none' | 'perimeter' | 'integrated' | 'with_defogging';

export interface MirrorConfig {
  shape: MirrorShape;
  dimensions: {
    width: number;
    height: number;
    diameter?: number;
    quantity: number;
  };
  mirrorType: MirrorType;
  processing: {
    bevel: {
      enabled: boolean;
      width: number;
    };
    sandblasting: {
      enabled: boolean;
      pattern: string;
    };
    holes: HoleSpec[];
    cutoutCount: number;
  };
  led: {
    type: LEDType;
    colorTemp?: 'warm' | 'neutral' | 'cool';
  };
  edgePolish: EdgePolishConfig;
  glassDeductions?: GlassDeductions;
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Kitchen Front Calculator Types
export type KitchenFrontType = 'lacquered' | 'printed' | 'frosted';

export interface KitchenFrontConfig {
  frontType: KitchenFrontType;
  dimensions: {
    width: number;
    height: number;
    quantity: number;
  };
  glass: {
    thickness: 6;
  };
  finish: {
    ralColor?: string;
    printImage?: string;
  };
  processing: {
    holes: HoleSpec[];
    cutouts: CutoutSpec[];
  };
  mounting: {
    type: 'glued' | 'spacers' | 'profile';
  };
  edgePolish: EdgePolishConfig;
  glassDeductions?: GlassDeductions;
  extraAccessories: Array<{
    materialCode: string;
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

// Shared Extra Accessory Type
export interface ExtraAccessory {
  materialCode: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  unit?: string;
}

// Calculator Step Interface
export interface CalculatorStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}
