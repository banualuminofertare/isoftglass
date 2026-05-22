import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  PanelConfig, 
  GlassThickness,
  GlassType,
  EdgePolishType,
  EdgePolishConfig,
  HoleSpec,
  CutoutSpec,
  PriceBreakdown,
  CalculatorStep,
  PartitionWallConfig,
  PartitionDoorConfig,
  PartitionCellType,
  GridCell,
  ProfileSides,
} from '@/types/calculators';
import { calculatePanelPrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';

// Helpers: usable space after subtracting inner profile widths
function getUsableWidth(totalWidth: number, columns: number, profileWidth: number): number {
  return totalWidth - Math.max(0, columns - 1) * profileWidth;
}
function getUsableHeight(totalHeight: number, rowCount: number, profileWidth: number): number {
  return totalHeight - Math.max(0, rowCount - 1) * profileWidth;
}

const DEFAULT_PROFILE_WIDTH = 12;

const DEFAULT_PARTITION_WALL: PartitionWallConfig = {
  enabled: false,
  totalWidth: 3000,
  totalHeight: 2500,
  grid: {
    columns: 2,
    columnWidths: distributeEqually(getUsableWidth(3000, 2, DEFAULT_PROFILE_WIDTH), 2),
    columnRows: [1, 1],
    columnRowHeights: [[2500], [2500]],
  },
  cells: [],
  doors: [],
  profileType: 'aluminum',
  profileWidth: DEFAULT_PROFILE_WIDTH,
  profileSides: { top: true, bottom: true, left: true, right: true },
};

const DEFAULT_CONFIG: PanelConfig = {
  productType: 'simple',
  dimensions: {
    width: 1000,
    height: 1500,
    quantity: 1,
  },
  glass: {
    thickness: 10,
    type: 'clear',
    tempered: true,
    laminated: false,
  },
  processing: {
    holes: [],
    cutouts: [],
    sandblasting: 'none',
    bevel: { enabled: false, width: 0 },
  },
  edgePolish: {
    enabled: false,
    type: 'polished',
  },
  partitionWall: undefined,
  extraAccessories: [],
};

// Dynamic steps based on product type
import i18next from 'i18next';

function getStepsForProductType(productType: PanelConfig['productType']): CalculatorStep[] {
  if (productType === 'partition_wall') {
    return [
      { id: 1, title: i18next.t('calc.steps.panel.productType'), description: i18next.t('calc.steps.panel.productTypeDescWall'), isCompleted: false, isActive: true },
      { id: 2, title: i18next.t('calc.steps.panel.dimensions'), description: i18next.t('calc.steps.panel.dimensionsDescWall'), isCompleted: false, isActive: false },
      { id: 3, title: i18next.t('calc.steps.panel.gridConfig'), description: i18next.t('calc.steps.panel.gridConfigDesc'), isCompleted: false, isActive: false },
      { id: 4, title: i18next.t('calc.steps.panel.doorConfig'), description: i18next.t('calc.steps.panel.doorConfigDesc'), isCompleted: false, isActive: false },
      { id: 5, title: i18next.t('calc.steps.panel.glassType'), description: i18next.t('calc.steps.panel.glassTypeDesc'), isCompleted: false, isActive: false },
      { id: 6, title: i18next.t('calc.steps.panel.quote'), description: i18next.t('calc.steps.panel.quoteDesc'), isCompleted: false, isActive: false },
    ];
  }

  if (productType === 'simple') {
    return [
      { id: 1, title: i18next.t('calc.steps.panel.productType'), description: i18next.t('calc.steps.panel.productTypeDescSimple'), isCompleted: false, isActive: true },
      { id: 2, title: i18next.t('calc.steps.panel.dimensions'), description: i18next.t('calc.steps.panel.dimensionsDescWall'), isCompleted: false, isActive: false },
      { id: 3, title: i18next.t('calc.steps.panel.gridConfig'), description: i18next.t('calc.steps.panel.gridConfigDescSimple'), isCompleted: false, isActive: false },
      { id: 4, title: i18next.t('calc.steps.panel.glassType'), description: i18next.t('calc.steps.panel.glassTypeDesc'), isCompleted: false, isActive: false },
      { id: 5, title: i18next.t('calc.steps.panel.accessories'), description: i18next.t('calc.steps.panel.accessoriesDesc'), isCompleted: false, isActive: false },
      { id: 6, title: i18next.t('calc.steps.panel.quote'), description: i18next.t('calc.steps.panel.quoteDesc'), isCompleted: false, isActive: false },
    ];
  }
  
  return [
    { id: 1, title: i18next.t('calc.steps.panel.productType'), description: i18next.t('calc.steps.panel.productTypeDescSimple'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.panel.dimensions'), description: i18next.t('calc.steps.panel.dimensionsDescProcessed'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.panel.glassType'), description: i18next.t('calc.steps.panel.glassTypeDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.panel.processing'), description: i18next.t('calc.steps.panel.processingDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.panel.quote'), description: i18next.t('calc.steps.panel.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

// Helper to generate grid cells with individual row heights per column
function generateGridCells(
  columns: number, 
  columnWidths: number[], 
  columnRows: number[],
  columnRowHeights: number[][],
  existingCells: GridCell[] = []
): GridCell[] {
  const cells: GridCell[] = [];
  
  for (let col = 0; col < columns; col++) {
    const rowCount = columnRows[col] || 1;
    const rowHeights = columnRowHeights[col] || [];
    
    for (let row = 0; row < rowCount; row++) {
      // Check if cell already exists to preserve its type
      const existingCell = existingCells.find(c => c.row === row && c.col === col);
      
      cells.push({
        id: existingCell?.id || crypto.randomUUID(),
        row,
        col,
        type: existingCell?.type || 'panel',
        width: columnWidths[col] || 1000,
        height: rowHeights[row] || 1000,
      });
    }
  }
  
  return cells;
}

// Helper to distribute heights equally within a column
function distributeColumnHeights(totalHeight: number, rowCount: number): number[] {
  const base = Math.floor(totalHeight / rowCount);
  const result = Array(rowCount).fill(base);
  const remainder = totalHeight - (base * rowCount);
  for (let i = 0; i < remainder; i++) {
    result[i]++;
  }
  return result;
}

// Helper to distribute dimensions equally
function distributeEqually(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const result = Array(count).fill(base);
  // Distribute remainder to first items
  const remainder = total - (base * count);
  for (let i = 0; i < remainder; i++) {
    result[i]++;
  }
  return result;
}

export function usePanelCalculator() {
  const [config, setConfig] = useState<PanelConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedKit, setSelectedKit] = useState<SelectedKit | null>(null);

  // Get dynamic pricing from database
  const { pricing, isLoading: isPricingLoading, pricingItems } = usePricingData();

  // Recompute aggregated glass deductions from all selected accessories + kit
  // Exclude partition wall profile codes — profiles only apply to fixed panels, not doors
  useEffect(() => {
    if (!pricing) return;
    // Collect codes but exclude partition wall profiles
    const configWithoutProfileCodes = {
      ...config,
      partitionWall: config.partitionWall ? {
        ...config.partitionWall,
        profileMaterialCode: undefined,
        profileSelections: undefined,
      } : config.partitionWall,
    };
    const codes = collectMaterialCodesFromConfig(configWithoutProfileCodes);
    const kd = selectedKit?.glass_deductions;
    let sA = 0, sB = 0, top = 0, bot = 0;
    for (const code of codes) {
      const d = pricing.getGlassDeductionsByCode(code);
      if (d.side_a) sA = Math.max(sA, d.side_a);
      if (d.side_b) sB = Math.max(sB, d.side_b);
      if (d.top) top = Math.max(top, d.top);
      if (d.bottom) bot = Math.max(bot, d.bottom);
    }
    const newW = Math.max(sA, kd?.side_a || 0) + Math.max(sB, kd?.side_b || 0);
    const newH = Math.max(top, kd?.top || 0) + Math.max(bot, kd?.bottom || 0);
    setConfig(prev => {
      const curW = prev.glassDeductions?.totalWidthDeduction || 0;
      const curH = prev.glassDeductions?.totalHeightDeduction || 0;
      if (curW === newW && curH === newH) return prev;
      return { ...prev, glassDeductions: { totalWidthDeduction: newW, totalHeightDeduction: newH } };
    });
  }, [config.extraAccessories, config.partitionWall, pricing, selectedKit]);

  const price = useMemo<PriceBreakdown>(() => {
    const base = calculatePanelPrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  const stepsConfig = useMemo(() => getStepsForProductType(config.productType), [config.productType]);

  const steps = useMemo(() => {
    return stepsConfig.map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps, stepsConfig]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= stepsConfig.length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= stepsConfig.length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep, stepsConfig.length]);

  const nextStep = useCallback(() => {
    if (currentStep < stepsConfig.length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, stepsConfig.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = currentStep - 1; i <= stepsConfig.length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, stepsConfig.length]);

  const setProductType = useCallback((productType: PanelConfig['productType']) => {
    setConfig(prev => {
      const newConfig = { ...prev, productType };
      
      // Initialize partition wall config when switching to partition_wall or simple
      if ((productType === 'partition_wall' || productType === 'simple') && !prev.partitionWall) {
        const partitionWall: PartitionWallConfig = {
          ...DEFAULT_PARTITION_WALL,
          enabled: true,
          cells: generateGridCells(
            DEFAULT_PARTITION_WALL.grid.columns,
            DEFAULT_PARTITION_WALL.grid.columnWidths,
            DEFAULT_PARTITION_WALL.grid.columnRows,
            DEFAULT_PARTITION_WALL.grid.columnRowHeights
          ),
        };
        newConfig.partitionWall = partitionWall;
      }
      
      return newConfig;
    });
    // Reset steps when changing product type
    setCurrentStep(1);
    setCompletedSteps(new Set());
  }, []);

  const setDimensions = useCallback((dimensions: Partial<PanelConfig['dimensions']>) => {
    setConfig(prev => ({ ...prev, dimensions: { ...prev.dimensions, ...dimensions } }));
  }, []);

  const setGlass = useCallback((glass: Partial<PanelConfig['glass']>) => {
    setConfig(prev => ({ ...prev, glass: { ...prev.glass, ...glass } }));
  }, []);

  const setProcessing = useCallback((processing: Partial<PanelConfig['processing']>) => {
    setConfig(prev => ({ ...prev, processing: { ...prev.processing, ...processing } }));
  }, []);

  const addHole = useCallback((hole: Omit<HoleSpec, 'id'>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        holes: [...prev.processing.holes, { ...hole, id: crypto.randomUUID() }],
      },
    }));
  }, []);

  const removeHole = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        holes: prev.processing.holes.filter(h => h.id !== id),
      },
    }));
  }, []);

  const addCutout = useCallback((cutout: Omit<CutoutSpec, 'id'>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        cutouts: [...prev.processing.cutouts, { ...cutout, id: crypto.randomUUID() }],
      },
    }));
  }, []);

  const removeCutout = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        cutouts: prev.processing.cutouts.filter(c => c.id !== id),
      },
    }));
  }, []);

  const setEdgePolish = useCallback((edgePolish: Partial<EdgePolishConfig>) => {
    setConfig(prev => ({ ...prev, edgePolish: { ...prev.edgePolish, ...edgePolish } }));
  }, []);

  // Partition Wall specific functions
  const setPartitionWallDimensions = useCallback((totalWidth: number, totalHeight: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const { columns, columnRows } = prev.partitionWall.grid;
      const pw = prev.partitionWall.profileWidth;
      const usableW = getUsableWidth(totalWidth, columns, pw);
      
      // Preserve existing column width proportions instead of distributing equally
      const oldWidths = prev.partitionWall.grid.columnWidths;
      const oldTotal = oldWidths.reduce((s, w) => s + w, 0);
      const columnWidths = oldTotal > 0 && oldWidths.length === columns
        ? oldWidths.map((w, i, arr) => {
            if (i === arr.length - 1) {
              return usableW - arr.slice(0, -1).reduce((s, _, j) => 
                s + Math.round((oldWidths[j] / oldTotal) * usableW), 0);
            }
            return Math.round((w / oldTotal) * usableW);
          })
        : distributeEqually(usableW, columns);

      // Preserve existing row height proportions instead of distributing equally
      const oldRowHeights = prev.partitionWall.grid.columnRowHeights;
      const columnRowHeights = columnRows.map((rowCount, colIdx) => {
        const usableH = getUsableHeight(totalHeight, rowCount, pw);
        const oldHeights = oldRowHeights[colIdx] || [];
        const oldColTotal = oldHeights.reduce((s, h) => s + h, 0);
        if (oldColTotal > 0 && oldHeights.length === rowCount) {
          return oldHeights.map((h, i, arr) => {
            if (i === arr.length - 1) {
              return usableH - arr.slice(0, -1).reduce((s, _, j) => 
                s + Math.round((oldHeights[j] / oldColTotal) * usableH), 0);
            }
            return Math.round((h / oldColTotal) * usableH);
          });
        }
        return distributeColumnHeights(usableH, rowCount);
      });
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          totalWidth,
          totalHeight,
          grid: {
            ...prev.partitionWall.grid,
            columnWidths,
            columnRowHeights,
          },
          cells: generateGridCells(columns, columnWidths, columnRows, columnRowHeights, prev.partitionWall.cells),
        },
      };
    });
  }, []);

  const setPartitionProfileWidth = useCallback((profileWidth: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      return {
        ...prev,
        partitionWall: { ...prev.partitionWall, profileWidth },
      };
    });
  }, []);

  const setPartitionProfileMaterialCode = useCallback((code: string) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      return {
        ...prev,
        partitionWall: { ...prev.partitionWall, profileMaterialCode: code || undefined },
      };
    });
  }, []);

  const addPartitionProfileSelection = useCallback((sel: { materialCode: string; name: string; unitPrice?: number }) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const existing = prev.partitionWall.profileSelections || [];
      if (existing.some(s => s.materialCode === sel.materialCode)) return prev;
      return {
        ...prev,
        partitionWall: { ...prev.partitionWall, profileSelections: [...existing, sel] },
      };
    });
  }, []);

  const removePartitionProfileSelection = useCallback((idx: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const updated = [...(prev.partitionWall.profileSelections || [])];
      updated.splice(idx, 1);
      return {
        ...prev,
        partitionWall: { ...prev.partitionWall, profileSelections: updated },
      };
    });
  }, []);

  const setPartitionGrid = useCallback((columns: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const { totalWidth, totalHeight, profileWidth: pw } = prev.partitionWall;
      const usableW = getUsableWidth(totalWidth, columns, pw);
      const columnWidths = distributeEqually(usableW, columns);
      // Initialize each column with 1 row of full height (1 row = no inner horizontal profiles)
      const columnRows = Array(columns).fill(1);
      const columnRowHeights = columnRows.map(() => [totalHeight]);
      
      // Remove doors for cells that no longer exist
      const validDoors = prev.partitionWall.doors.filter(door => {
        const cell = prev.partitionWall!.cells.find(c => c.id === door.cellId);
        return cell && cell.col < columns;
      });
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          grid: {
            columns,
            columnWidths,
            columnRows,
            columnRowHeights,
          },
          cells: generateGridCells(columns, columnWidths, columnRows, columnRowHeights, prev.partitionWall.cells),
          doors: validDoors,
        },
      };
    });
  }, []);

  const setColumnRows = useCallback((colIndex: number, rowCount: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const newRowCount = Math.max(1, Math.min(10, rowCount));
      const pw = prev.partitionWall.profileWidth;
      const usableH = getUsableHeight(prev.partitionWall.totalHeight, newRowCount, pw);
      const newColumnRows = [...prev.partitionWall.grid.columnRows];
      newColumnRows[colIndex] = newRowCount;
      
      // Distribute heights equally for this column using usable height
      const newColumnRowHeights = [...prev.partitionWall.grid.columnRowHeights];
      newColumnRowHeights[colIndex] = distributeColumnHeights(usableH, newRowCount);
      
      // Remove doors for cells in this column that no longer exist
      const validDoors = prev.partitionWall.doors.filter(door => {
        const cell = prev.partitionWall!.cells.find(c => c.id === door.cellId);
        if (!cell || cell.col !== colIndex) return true;
        return cell.row < newRowCount;
      });
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          grid: {
            ...prev.partitionWall.grid,
            columnRows: newColumnRows,
            columnRowHeights: newColumnRowHeights,
          },
          cells: generateGridCells(
            prev.partitionWall.grid.columns,
            prev.partitionWall.grid.columnWidths,
            newColumnRows,
            newColumnRowHeights,
            prev.partitionWall.cells
          ),
          doors: validDoors,
        },
      };
    });
  }, []);

  const updateColumnWidth = useCallback((colIndex: number, width: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const { totalWidth, profileWidth: pw } = prev.partitionWall;
      const columns = prev.partitionWall.grid.columns;
      const usableW = getUsableWidth(totalWidth, columns, pw);
      const clampedWidth = Math.max(200, Math.min(width, usableW - (columns - 1) * 200));
      const oldWidths = prev.partitionWall.grid.columnWidths;
      const newColumnWidths = [...oldWidths];
      newColumnWidths[colIndex] = clampedWidth;
      
      // Redistribute difference to other columns proportionally, keeping usableWidth fixed
      const otherIndices = newColumnWidths.map((_, i) => i).filter(i => i !== colIndex);
      const otherTotal = otherIndices.reduce((s, i) => s + oldWidths[i], 0);
      
      if (otherIndices.length > 0 && otherTotal > 0) {
        let remaining = usableW - clampedWidth;
        otherIndices.forEach((i, idx) => {
          if (idx === otherIndices.length - 1) {
            newColumnWidths[i] = Math.max(200, Math.round(remaining));
          } else {
            const proportion = oldWidths[i] / otherTotal;
            const newW = Math.max(200, Math.round(remaining * proportion));
            newColumnWidths[i] = newW;
            remaining -= newW;
          }
        });
      }
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          grid: {
            ...prev.partitionWall.grid,
            columnWidths: newColumnWidths,
          },
          cells: generateGridCells(
            prev.partitionWall.grid.columns,
            newColumnWidths,
            prev.partitionWall.grid.columnRows,
            prev.partitionWall.grid.columnRowHeights,
            prev.partitionWall.cells
          ),
        },
      };
    });
  }, []);

  const updateRowHeight = useCallback((colIndex: number, rowIndex: number, height: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const pw = prev.partitionWall.profileWidth;
      const rowCount = prev.partitionWall.grid.columnRows[colIndex] || 1;
      
      const newColumnRowHeights = prev.partitionWall.grid.columnRowHeights.map((heights, col) => 
        col === colIndex 
          ? heights.map((h, row) => row === rowIndex ? Math.max(200, height) : h)
          : [...heights]
      );
      
      // Calculate new usable height for this column → derive new totalHeight
      const columnUsableHeight = newColumnRowHeights[colIndex].reduce((sum, h) => sum + h, 0);
      const newTotalHeight = columnUsableHeight + Math.max(0, rowCount - 1) * pw;
      
      // Update all other columns to match the new total height using their usable heights
      const adjustedColumnRowHeights = newColumnRowHeights.map((heights, col) => {
        if (col === colIndex) return heights;
        const colRowCount = heights.length;
        const usableH = getUsableHeight(newTotalHeight, colRowCount, pw);
        return distributeColumnHeights(usableH, colRowCount);
      });
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          totalHeight: newTotalHeight,
          grid: {
            ...prev.partitionWall.grid,
            columnRowHeights: adjustedColumnRowHeights,
          },
          cells: generateGridCells(
            prev.partitionWall.grid.columns,
            prev.partitionWall.grid.columnWidths,
            prev.partitionWall.grid.columnRows,
            adjustedColumnRowHeights,
            prev.partitionWall.cells
          ),
        },
      };
    });
  }, []);

  const splitCellHorizontally = useCallback((colIndex: number, rowIndex: number, splitHeight?: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const oldColumnRows = [...prev.partitionWall.grid.columnRows];
      const oldRowHeights = [...(prev.partitionWall.grid.columnRowHeights[colIndex] || [])];
      const cellHeight = oldRowHeights[rowIndex] || prev.partitionWall.totalHeight;
      
      // Use custom split height or default to half — splitHeight = bottom part
      const bottomHeight = splitHeight ? Math.min(Math.max(200, splitHeight), cellHeight - 200) : Math.floor(cellHeight / 2);
      const topHeight = cellHeight - bottomHeight;
      
      // Insert new row height after the split row
      const newRowHeights = [
        ...oldRowHeights.slice(0, rowIndex),
        bottomHeight,  // lower index = bottom visually
        topHeight,     // higher index = top visually
        ...oldRowHeights.slice(rowIndex + 1),
      ];
      
      const newColumnRows = [...oldColumnRows];
      newColumnRows[colIndex] = (oldColumnRows[colIndex] || 1) + 1;
      
      const newColumnRowHeights = prev.partitionWall.grid.columnRowHeights.map((heights, col) =>
        col === colIndex ? newRowHeights : [...heights]
      );
      
      // Update door cellIds: rows after the split shift down by 1
      const updatedDoors = prev.partitionWall.doors.map(door => {
        const cell = prev.partitionWall!.cells.find(c => c.id === door.cellId);
        if (!cell || cell.col !== colIndex || cell.row <= rowIndex) return door;
        // This cell's row index will shift, but since we regenerate cells by matching row/col,
        // the door's cellId will be updated when we regenerate
        return door;
      });
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          grid: {
            ...prev.partitionWall.grid,
            columnRows: newColumnRows,
            columnRowHeights: newColumnRowHeights,
          },
          cells: generateGridCells(
            prev.partitionWall.grid.columns,
            prev.partitionWall.grid.columnWidths,
            newColumnRows,
            newColumnRowHeights,
            prev.partitionWall.cells
          ),
          doors: updatedDoors,
        },
      };
    });
  }, []);

  const deleteSplitRow = useCallback((colIndex: number, rowIndex: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const rowHeights = prev.partitionWall.grid.columnRowHeights[colIndex] || [];
      
      // Can't delete if there's only 1 row
      if (rowHeights.length <= 1) return prev;
      
      // Merge current row with next row (if exists) or previous row (if it's the last)
      const mergeWithNext = rowIndex < rowHeights.length - 1;
      const deleteIdx = mergeWithNext ? rowIndex : rowIndex - 1;
      const keepIdx = mergeWithNext ? rowIndex + 1 : rowIndex;
      
      const mergedHeight = rowHeights[deleteIdx] + rowHeights[keepIdx];
      const newRowHeights = [
        ...rowHeights.slice(0, deleteIdx),
        mergedHeight,
        ...rowHeights.slice(keepIdx + 1),
      ];
      
      const newColumnRows = [...prev.partitionWall.grid.columnRows];
      newColumnRows[colIndex] = (newColumnRows[colIndex] || 1) - 1;
      
      const newColumnRowHeights = prev.partitionWall.grid.columnRowHeights.map((heights, col) =>
        col === colIndex ? newRowHeights : [...heights]
      );
      
      // Remove doors for the deleted cell
      const deletedCellId = prev.partitionWall.cells.find(c => c.col === colIndex && c.row === deleteIdx)?.id;
      const updatedDoors = prev.partitionWall.doors.filter(d => d.cellId !== deletedCellId);
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          grid: {
            ...prev.partitionWall.grid,
            columnRows: newColumnRows,
            columnRowHeights: newColumnRowHeights,
          },
          cells: generateGridCells(
            prev.partitionWall.grid.columns,
            prev.partitionWall.grid.columnWidths,
            newColumnRows,
            newColumnRowHeights,
            prev.partitionWall.cells
          ),
          doors: updatedDoors,
        },
      };
    });
  }, []);

  const setCellType = useCallback((cellId: string, type: PartitionCellType) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      const updatedCells = prev.partitionWall.cells.map(cell =>
        cell.id === cellId ? { ...cell, type } : cell
      );
      
      // Add or remove door config based on cell type
      let updatedDoors = [...prev.partitionWall.doors];
      
      if (type === 'door') {
        // Add door config if it doesn't exist
        if (!updatedDoors.find(d => d.cellId === cellId)) {
          const cell = updatedCells.find(c => c.id === cellId);
          if (cell) {
            updatedDoors.push({
              cellId,
              doorType: 'hinged',
              doorWidth: cell.width - 11,
              doorHeight: cell.height - 18,
              hingeSide: 'left',
              openDirection: 'inward',
              hasFrame: false,
              frameQuantity: 0,
              slidingRailLength: 0,
              accessories: {
                handle: { model: 'bar', length: 400, finish: 'polished_stainless' },
                lock: { enabled: false, type: 'central_strike' },
                hinges: { type: 'normal', quantity: 3, finish: 'polished_stainless', positions: [200, Math.round((cell.height - 18) / 2), (cell.height - 18) - 200] },
                ptBottom: { size: 10, quantity: 1 },
                ptTop: { size: 20, quantity: 1 },
              },
            });
          }
        }
      } else {
        // Remove door config if cell type is not 'door'
        updatedDoors = updatedDoors.filter(d => d.cellId !== cellId);
      }
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          cells: updatedCells,
          doors: updatedDoors,
        },
      };
    });
  }, []);

  const updateDoorConfig = useCallback((cellId: string, updates: Partial<PartitionDoorConfig>) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          doors: prev.partitionWall.doors.map(door =>
            door.cellId === cellId ? { ...door, ...updates } : door
          ),
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(1);
    setCompletedSteps(new Set());
  }, []);

  const canGoNext = useMemo(() => true, []);

  const setPartitionProfileSides = useCallback((sides: Partial<ProfileSides>) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          profileSides: { ...prev.partitionWall.profileSides, ...sides },
        },
      };
    });
  }, []);

  const setProfile90Degree = useCallback((profile90: { enabled: boolean; quantity: number }) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          profile90Degree: profile90,
        },
      };
    });
  }, []);

  const setSidePanels = useCallback((side: 'left' | 'right', panelConfig: Partial<{ enabled: boolean; width: number; height: number; profileWidth: number; profileSides: { front: boolean; back: boolean; top: boolean; bottom: boolean } }>) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const existing = prev.partitionWall.sidePanels?.[side] || { enabled: false, width: 500 };
      const merged = { ...existing, ...panelConfig };
      // Initialize grid when enabling a side panel
      if (panelConfig.enabled && !existing.grid) {
        const spHeight = merged.height ?? prev.partitionWall.totalHeight;
        merged.grid = {
          columns: 1,
          columnWidths: [merged.width],
          columnRows: [1],
          columnRowHeights: [[spHeight]],
        };
        merged.cells = generateGridCells(1, [merged.width], [1], [[spHeight]]);
      }
      // Update grid widths when width changes
      if (panelConfig.width !== undefined && merged.grid) {
        const spPw = merged.profileWidth ?? prev.partitionWall.profileWidth;
        const usableSpW = getUsableWidth(panelConfig.width, merged.grid.columns, spPw);
        const newWidths = distributeEqually(usableSpW, merged.grid.columns);
        merged.grid = { ...merged.grid, columnWidths: newWidths };
        merged.cells = generateGridCells(merged.grid.columns, newWidths, merged.grid.columnRows, merged.grid.columnRowHeights, merged.cells);
      }
      // Update grid heights when height changes
      if (panelConfig.height !== undefined && merged.grid) {
        const spPw = merged.profileWidth ?? prev.partitionWall.profileWidth;
        const newRowHeights = merged.grid.columnRows.map((rc: number) => {
          const usableSpH = getUsableHeight(panelConfig.height!, rc, spPw);
          return distributeColumnHeights(usableSpH, rc);
        });
        merged.grid = { ...merged.grid, columnRowHeights: newRowHeights };
        merged.cells = generateGridCells(merged.grid.columns, merged.grid.columnWidths, merged.grid.columnRows, newRowHeights, merged.cells);
      }
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: merged,
          },
        },
      };
    });
  }, []);

  const setSidePanelGrid = useCallback((side: 'left' | 'right', columns: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const sp = prev.partitionWall.sidePanels?.[side];
      if (!sp?.enabled) return prev;
      const spWidth = sp.width;
      const spHeight = sp.height ?? prev.partitionWall.totalHeight;
      const spPw = sp.profileWidth ?? prev.partitionWall.profileWidth;
      const usableSpW = getUsableWidth(spWidth, columns, spPw);
      const columnWidths = distributeEqually(usableSpW, columns);
      const columnRows = Array(columns).fill(1);
      const columnRowHeights = columnRows.map(() => [spHeight]);
      const grid = { columns, columnWidths, columnRows, columnRowHeights };
      const cells = generateGridCells(columns, columnWidths, columnRows, columnRowHeights, sp.cells);
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: { ...sp, grid, cells },
          },
        },
      };
    });
  }, []);

  const setSidePanelColumnRows = useCallback((side: 'left' | 'right', colIndex: number, rowCount: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const sp = prev.partitionWall.sidePanels?.[side];
      if (!sp?.enabled || !sp.grid) return prev;
      const spPw = sp.profileWidth ?? prev.partitionWall.profileWidth;
      const spHeight = sp.height ?? prev.partitionWall.totalHeight;
      const newRowCount = Math.max(1, Math.min(10, rowCount));
      const usableSpH = getUsableHeight(spHeight, newRowCount, spPw);
      const newColumnRows = [...sp.grid.columnRows];
      newColumnRows[colIndex] = newRowCount;
      const newColumnRowHeights = sp.grid.columnRowHeights.map((heights: number[], col: number) =>
        col === colIndex ? distributeColumnHeights(usableSpH, newRowCount) : [...heights]
      );
      const grid = { ...sp.grid, columnRows: newColumnRows, columnRowHeights: newColumnRowHeights };
      const cells = generateGridCells(sp.grid.columns, sp.grid.columnWidths, newColumnRows, newColumnRowHeights, sp.cells);
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: { ...sp, grid, cells },
          },
        },
      };
    });
  }, []);

  const setSidePanelColumnWidth = useCallback((side: 'left' | 'right', colIndex: number, width: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const sp = prev.partitionWall.sidePanels?.[side];
      if (!sp?.enabled || !sp.grid) return prev;
      const totalWidth = sp.width;
      const spPw = sp.profileWidth ?? prev.partitionWall.profileWidth;
      const usableSpW = getUsableWidth(totalWidth, sp.grid.columns, spPw);
      const clampedWidth = Math.max(200, Math.min(width, usableSpW - (sp.grid.columns - 1) * 200));
      const oldWidth = sp.grid.columnWidths[colIndex];
      const diff = clampedWidth - oldWidth;
      const otherIndices = sp.grid.columnWidths.map((_: number, i: number) => i).filter((i: number) => i !== colIndex);
      const otherTotal = otherIndices.reduce((s: number, i: number) => s + sp.grid.columnWidths[i], 0);
      const newWidths = [...sp.grid.columnWidths];
      newWidths[colIndex] = clampedWidth;
      if (otherIndices.length > 0 && otherTotal > 0) {
        let remaining = usableSpW - clampedWidth;
        otherIndices.forEach((i: number, idx: number) => {
          if (idx === otherIndices.length - 1) {
            newWidths[i] = Math.max(200, Math.round(remaining));
          } else {
            const proportion = sp.grid!.columnWidths[i] / otherTotal;
            const newW = Math.max(200, Math.round(remaining * proportion));
            newWidths[i] = newW;
            remaining -= newW;
          }
        });
      }
      const grid = { ...sp.grid, columnWidths: newWidths };
      const cells = generateGridCells(sp.grid.columns, newWidths, sp.grid.columnRows, sp.grid.columnRowHeights, sp.cells);
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: { ...sp, grid, cells },
          },
        },
      };
    });
  }, []);

  const setSidePanelRowHeight = useCallback((side: 'left' | 'right', colIndex: number, rowIndex: number, height: number) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const sp = prev.partitionWall.sidePanels?.[side];
      if (!sp?.enabled || !sp.grid) return prev;
      const totalHeight = sp.height || sp.grid.columnRowHeights[colIndex].reduce((s: number, h: number) => s + h, 0);
      const rowCount = sp.grid.columnRows[colIndex] || 1;
      const clampedHeight = Math.max(100, Math.min(height, totalHeight - (rowCount - 1) * 100));
      const oldHeights = [...sp.grid.columnRowHeights[colIndex]];
      const oldH = oldHeights[rowIndex];
      const otherIndicesInCol = oldHeights.map((_: number, i: number) => i).filter((i: number) => i !== rowIndex);
      const otherTotal = otherIndicesInCol.reduce((s: number, i: number) => s + oldHeights[i], 0);
      const newColHeights = [...oldHeights];
      newColHeights[rowIndex] = clampedHeight;
      if (otherIndicesInCol.length > 0 && otherTotal > 0) {
        let remaining = totalHeight - clampedHeight;
        otherIndicesInCol.forEach((i: number, idx: number) => {
          if (idx === otherIndicesInCol.length - 1) {
            newColHeights[i] = Math.max(100, Math.round(remaining));
          } else {
            const proportion = oldHeights[i] / otherTotal;
            const newH = Math.max(100, Math.round(remaining * proportion));
            newColHeights[i] = newH;
            remaining -= newH;
          }
        });
      }
      const newRowHeights = sp.grid.columnRowHeights.map((heights: number[], col: number) =>
        col === colIndex ? newColHeights : [...heights]
      );
      const grid = { ...sp.grid, columnRowHeights: newRowHeights };
      const cells = generateGridCells(sp.grid.columns, sp.grid.columnWidths, sp.grid.columnRows, newRowHeights, sp.cells);
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: { ...sp, grid, cells },
          },
        },
      };
    });
  }, []);

  const setSidePanelCellType = useCallback((side: 'left' | 'right', cellId: string, type: PartitionCellType) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      const sp = prev.partitionWall.sidePanels?.[side];
      if (!sp?.cells) return prev;
      const updatedCells = sp.cells.map(cell => cell.id === cellId ? { ...cell, type } : cell);
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          sidePanels: {
            ...prev.partitionWall.sidePanels,
            [side]: { ...sp, cells: updatedCells },
          },
        },
      };
    });
  }, []);

  const updateDoorLabelOffset = useCallback((cellId: string, labelKey: string, offset: { x: number; y: number }) => {
    setConfig(prev => {
      if (!prev.partitionWall) return prev;
      return {
        ...prev,
        partitionWall: {
          ...prev.partitionWall,
          doors: prev.partitionWall.doors.map(door =>
            door.cellId === cellId
              ? {
                  ...door,
                  accessories: {
                    ...door.accessories,
                    labelOffsets: {
                      ...door.accessories.labelOffsets,
                      [labelKey]: offset,
                    },
                  },
                }
              : door
          ),
        },
      };
    });
  }, []);

  const addExtraAccessory = useCallback((accessory: { materialCode: string; name: string; quantity?: number; unitPrice?: number; unit?: string }) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: [...prev.extraAccessories, { ...accessory, quantity: accessory.quantity ?? 1 }],
    }));
  }, []);

  const removeExtraAccessory = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: prev.extraAccessories.filter((_, i) => i !== index),
    }));
  }, []);

  const updateExtraAccessory = useCallback((index: number, updates: Partial<{ materialCode: string; name: string; quantity: number; unitPrice?: number }>) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: prev.extraAccessories.map((acc, i) => i === index ? { ...acc, ...updates } : acc),
    }));
  }, []);

  const removeSelectedKit = useCallback(() => setSelectedKit(null), []);

  return {
    config, currentStep, steps, price, canGoNext, isPricingLoading, pricingItems,
    selectedKit, setSelectedKit, removeSelectedKit,
    goToStep, nextStep, prevStep,
    setProductType, setDimensions, setGlass, setProcessing, setEdgePolish,
    addHole, removeHole, addCutout, removeCutout, reset,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    // Partition wall specific
    setPartitionWallDimensions, setPartitionGrid, updateColumnWidth, updateRowHeight, setColumnRows,
    setCellType, updateDoorConfig, splitCellHorizontally, deleteSplitRow, setPartitionProfileWidth,
    setPartitionProfileSides, setProfile90Degree, updateDoorLabelOffset, setSidePanels,
    setPartitionProfileMaterialCode, addPartitionProfileSelection, removePartitionProfileSelection,
    setSidePanelGrid, setSidePanelColumnRows, setSidePanelColumnWidth, setSidePanelRowHeight, setSidePanelCellType,
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as PanelConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        const steps = getStepsForProductType((saved as PanelConfig).productType);
        setCurrentStep(steps.length);
        setCompletedSteps(new Set(steps.map(s => s.id)));
      }
    }, []),
  };
}
