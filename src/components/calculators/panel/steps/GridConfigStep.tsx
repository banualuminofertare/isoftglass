import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditableDimInput } from '@/components/calculators/shared/EditableDimInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { DoorOpen, Square, SquareDashed, Columns, Rows, ChevronDown, Ruler, SplitSquareHorizontal, X, ArrowLeftFromLine, ArrowRightFromLine } from 'lucide-react';
import type { GridCell, PartitionCellType, PartitionDoorConfig, PartitionWallConfig, HingeSide } from '@/types/calculators';

interface GridConfigStepProps {
  config: PartitionWallConfig;
  onGridChange: (columns: number) => void;
  onColumnRowsChange: (colIndex: number, rows: number) => void;
  onColumnWidthChange: (colIndex: number, width: number) => void;
  onRowHeightChange: (colIndex: number, rowIndex: number, height: number) => void;
  onCellTypeChange: (cellId: string, type: PartitionCellType) => void;
  onSplitCell: (colIndex: number, rowIndex: number, splitHeight?: number) => void;
  onDeleteSplit: (colIndex: number, rowIndex: number) => void;
  onUpdateDoor: (cellId: string, updates: Partial<PartitionDoorConfig>) => void;
  allowDoors?: boolean;
}

export function GridConfigStep({
  config,
  onGridChange,
  onColumnRowsChange,
  onColumnWidthChange,
  onRowHeightChange,
  onCellTypeChange,
  onSplitCell,
  onDeleteSplit,
  onUpdateDoor,
  allowDoors = true,
}: GridConfigStepProps) {
  const { t } = useTranslation();
  const { grid, cells } = config;
  const [showDimensions, setShowDimensions] = useState(false);

  const allCellTypeOptions: { type: PartitionCellType; label: string; icon: typeof Square }[] = [
    { type: 'panel', label: t('calc.panelCell'), icon: Square },
    { type: 'door_opening', label: t('calc.doorOpening'), icon: SquareDashed },
    { type: 'door', label: t('calc.doorCell'), icon: DoorOpen },
  ];
  
  const cellTypeOptions = allowDoors 
    ? allCellTypeOptions 
    : allCellTypeOptions.filter(o => o.type === 'panel');
  
  const getCellsByColumn = useCallback((col: number): GridCell[] => {
    return cells.filter(c => c.col === col).sort((a, b) => a.row - b.row);
  }, [cells]);
  
  const getCellTypeIcon = (type: PartitionCellType) => {
    const option = allCellTypeOptions.find(o => o.type === type);
    return option?.icon || Square;
  };

  const getCellTypeLabel = (type: PartitionCellType) => {
    if (type === 'panel') return t('calc.panelCell');
    if (type === 'door_opening') return t('calc.doorOpening');
    return t('calc.doorCell');
  };

  return (
    <div className="space-y-6">
      {/* Simple division controls */}
      <Card className="p-5 space-y-6">
        <div className="text-center pb-2 border-b">
          <p className="text-sm text-muted-foreground">
            {t('calc.mainPanel')} <span className="font-semibold text-foreground">{config.totalWidth} × {config.totalHeight} mm</span>
          </p>
        </div>
        
        {/* Vertical divisions (columns) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Columns className="h-5 w-5 text-primary" />
            <Label className="flex-1">{t('calc.verticalDivision')}</Label>
            <Input
              type="number"
              value={grid.columns}
              onChange={(e) => {
                const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                onGridChange(val);
              }}
              min={1}
              max={20}
              className="w-20 text-center font-bold"
            />
            <span className="text-sm text-muted-foreground">
              {grid.columns === 1 ? t('calc.panel') : t('calc.panels')}
            </span>
          </div>
        </div>

        {/* Info about horizontal divisions */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Rows className="h-4 w-4" />
            <span>{t('calc.horizontalDivisionInfo')}</span>
          </div>
        </div>
      </Card>

      {/* Individual dimensions control */}
      <Collapsible open={showDimensions} onOpenChange={setShowDimensions}>
        <Card className="p-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('calc.individualDimensions')}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showDimensions && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Column widths - left to right */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Columns className="h-4 w-4" />
                {t('calc.columnWidths')}
              </Label>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(grid.columns, 5)}, 1fr)` }}>
                {Array.from({ length: grid.columns }).map((_, colIdx) => (
                  <div key={`width-${colIdx}`} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('calc.col')} {colIdx + 1}</Label>
                    <div className="flex items-center gap-1">
                      <EditableDimInput
                        value={grid.columnWidths[colIdx] || 0}
                        onCommit={(v) => onColumnWidthChange(colIdx, v)}
                        min={200}
                        max={5000}
                        className="text-center text-sm h-8"
                      />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row heights per column - bottom to top */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Rows className="h-4 w-4" />
                {t('calc.rowHeights')}
              </Label>
              <div className="space-y-4">
                {Array.from({ length: grid.columns }).map((_, colIdx) => {
                  const rowCount = grid.columnRows[colIdx] || 1;
                  const rowHeights = grid.columnRowHeights[colIdx] || [];
                  
                  if (rowCount <= 1) return null;
                  
                  return (
                    <div key={`heights-col-${colIdx}`} className="p-3 bg-muted/30 rounded-lg space-y-2">
                      <Label className="text-xs font-medium">{t('calc.column')} {colIdx + 1} ({rowCount} {t('calc.rows')})</Label>
                      <div className="flex flex-wrap gap-2">
                        {/* Reverse order: bottom (last row) first */}
                        {Array.from({ length: rowCount }).map((__, rowIdx) => {
                          const actualRowIdx = rowCount - 1 - rowIdx; // Reverse: show bottom first
                          return (
                            <div key={`height-${colIdx}-${actualRowIdx}`} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                {rowIdx === 0 ? t('calc.bottom') : rowIdx === rowCount - 1 ? t('calc.top') : `R${rowCount - rowIdx}`}
                              </Label>
                              <div className="flex items-center gap-1">
                                <EditableDimInput
                                  value={rowHeights[actualRowIdx] || 0}
                                  onCommit={(v) => onRowHeightChange(colIdx, actualRowIdx, v)}
                                  min={200}
                                  max={4000}
                                  className="w-20 text-center text-sm h-8"
                                />
                                <span className="text-xs text-muted-foreground">mm</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {grid.columnRows.every(r => r <= 1) && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {t('calc.addMoreRows')}
                  </p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Grid visual editor with per-column row controls */}
      <Card className="p-4 space-y-3">
        <Label className="text-sm font-medium">
          {t('calc.cellConfig')} 
          <span className="text-muted-foreground font-normal ml-1">
            ({t('calc.clickToChange')})
          </span>
        </Label>
        
        {/* Column headers with row controls */}
        <div 
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${grid.columns}, 1fr)` }}
        >
          {Array.from({ length: grid.columns }).map((_, colIdx) => (
            <div key={`header-${colIdx}`} className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-t-lg border-b-0 border">
              <span className="text-xs font-medium text-muted-foreground">{t('calc.col')} {colIdx + 1}</span>
              <div className="flex items-center gap-1">
                <Ruler className="h-3 w-3 text-primary" />
                <EditableDimInput
                  value={grid.columnWidths[colIdx] || 0}
                  onCommit={(v) => onColumnWidthChange(colIdx, v)}
                  min={200}
                  max={5000}
                  className="w-16 h-7 text-center text-xs font-bold p-1"
                />
                <span className="text-[10px] text-muted-foreground">mm</span>
              </div>
              <div className="flex items-center gap-1">
                <Rows className="h-3 w-3 text-primary" />
                <Input
                  type="number"
                  value={grid.columnRows[colIdx] || 1}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                    onColumnRowsChange(colIdx, val);
                  }}
                  min={1}
                  max={10}
                  className="w-12 h-7 text-center text-xs font-bold p-1"
                />
                <span className="text-[10px] text-muted-foreground">
                  {(grid.columnRows[colIdx] || 1) === 1 ? t('calc.row') : t('calc.rows')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div 
          className="grid gap-px border rounded-lg p-2 bg-muted/30 overflow-y-auto"
          style={{ 
            gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
            minHeight: '200px',
            maxHeight: '500px'
          }}
        >
          {Array.from({ length: grid.columns }).map((_, colIdx) => {
            const columnCells = getCellsByColumn(colIdx);
            const rowCount = grid.columnRows[colIdx] || 1;
            const rowHeights = grid.columnRowHeights[colIdx] || [];
            
            return (
              <div 
                key={`col-${colIdx}`} 
                className="flex flex-col gap-px"
                style={{ height: '100%' }}
              >
                {Array.from({ length: rowCount }).map((_, idx) => {
                  const rowIdx = rowCount - 1 - idx; // Reverse: top row (highest index) rendered first
                  const cell = columnCells[rowIdx];
                  const cellType = cell?.type || 'panel';
                  const CellIcon = getCellTypeIcon(cellType);
                  const cellHeight = rowHeights[rowIdx] || 0;
                  const cellWidth = grid.columnWidths[colIdx] || 0;
                  
                  // Calculate flex based on height proportion
                  const totalColHeight = rowHeights.reduce((sum, h) => sum + h, 0);
                  const flexValue = totalColHeight > 0 ? cellHeight / totalColHeight : 1;
                  
                  // Get door config for this cell
                  const doorConfig = cell ? config.doors.find(d => d.cellId === cell.id) : undefined;
                  const hingeSide = doorConfig?.hingeSide || 'left';
                  
                  const cycleType = () => {
                    if (!cell) return;
                    const types = cellTypeOptions.map(o => o.type);
                    const currentIdx = types.indexOf(cellType);
                    const nextType = types[(currentIdx + 1) % types.length];
                    onCellTypeChange(cell.id, nextType);
                  };
                  
                    return (
                      <div
                        key={`${colIdx}-${rowIdx}`}
                        className="relative group min-h-[48px]"
                        style={{ flex: flexValue }}
                      >
                        <button
                          className={cn(
                            "w-full h-full flex flex-col items-center justify-center gap-1 p-2 rounded border transition-all",
                            "hover:border-primary/50 hover:bg-primary/5",
                            cellType === 'panel' && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                            cellType === 'door_opening' && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                            cellType === 'door' && "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                          )}
                          onClick={cycleType}
                        >
                          <CellIcon className={cn(
                            "h-5 w-5",
                            cellType === 'panel' && "text-blue-600",
                            cellType === 'door_opening' && "text-amber-600",
                            cellType === 'door' && "text-green-600"
                          )} />
                          <span className="text-xs font-medium">
                            {getCellTypeLabel(cellType)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {cellWidth}×{cellHeight}
                          </span>
                        </button>

                        {/* Door hinge side selector */}
                        {cellType === 'door' && cell && doorConfig && (
                          <div className="absolute top-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className={cn(
                                "rounded p-0.5 transition-colors",
                                hingeSide === 'left'
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                              title={t('calc.openLeft')}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateDoor(cell.id, { hingeSide: 'left' });
                              }}
                            >
                              <ArrowLeftFromLine className="h-3 w-3" />
                            </button>
                            <button
                              className={cn(
                                "rounded p-0.5 transition-colors",
                                hingeSide === 'right'
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                              title={t('calc.openRight')}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateDoor(cell.id, { hingeSide: 'right' });
                              }}
                            >
                              <ArrowRightFromLine className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {/* Split & Delete buttons */}
                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                          {/* Split button */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className="bg-primary text-primary-foreground rounded p-0.5"
                                title={t('calc.splitHorizontal')}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SplitSquareHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3 z-50" side="right" align="center">
                              <SplitDimensionSelector
                                cellHeight={cellHeight}
                                onSplit={(height) => onSplitCell(colIdx, rowIdx, height)}
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Delete split button - only show if there are multiple rows */}
                          {(grid.columnRows[colIdx] || 1) > 1 && (
                            <button
                              className="bg-destructive text-destructive-foreground rounded p-0.5"
                              title={t('calc.split')}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSplit(colIdx, rowIdx);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs pt-2 border-t">
          {cellTypeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.type} className="flex items-center gap-1.5">
                <Icon className={cn(
                  "h-4 w-4",
                  opt.type === 'panel' && "text-blue-600",
                  opt.type === 'door_opening' && "text-amber-600",
                  opt.type === 'door' && "text-green-600"
                )} />
                <span>{opt.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
        <p className="text-sm font-medium">{t('calc.configSummary')}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t('calc.totalCells')}</span>
            <span className="ml-2 font-medium">{cells.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('calc.panelsCountLabel')}</span>
            <span className="ml-2 font-medium">{cells.filter(c => c.type === 'panel').length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('calc.openingsCount')}</span>
            <span className="ml-2 font-medium">{cells.filter(c => c.type === 'door_opening').length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('calc.doorsCount')}</span>
            <span className="ml-2 font-medium">{cells.filter(c => c.type === 'door').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitDimensionSelector({ cellHeight, onSplit }: { cellHeight: number; onSplit: (height: number) => void }) {
  const { t } = useTranslation();
  const [splitHeight, setSplitHeight] = useState(Math.floor(cellHeight / 2));
  const remaining = cellHeight - splitHeight;
  const isValid = splitHeight >= 200 && remaining >= 200;
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('calc.splitHorizontal')}</Label>
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('calc.bottomPart')}</Label>
          <Input
            type="number"
            value={splitHeight}
            onChange={(e) => setSplitHeight(Number(e.target.value) || 200)}
            min={200}
            max={cellHeight - 200}
            className="h-8 text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {t('calc.topPart')} <span className="font-semibold text-foreground">{remaining} mm</span>
        </div>
        {!isValid && (
          <p className="text-xs text-destructive">{t('calc.minPerPart')}</p>
        )}
      </div>
      <Button
        size="sm"
        className="w-full"
        disabled={!isValid}
        onClick={() => onSplit(splitHeight)}
      >
        <SplitSquareHorizontal className="h-4 w-4 mr-1" />
        {t('calc.split')}
      </Button>
    </div>
  );
}
