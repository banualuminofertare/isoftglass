import { useState, useRef, useCallback, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ResizableContentProps {
  children: ReactNode;
  defaultWidthPercent?: number;
  minWidthPx?: number;
}

export function ResizableContent({ children, defaultWidthPercent = 100, minWidthPx = 400 }: ResizableContentProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const startX = e.clientX;
    const startWidth = contentWidth ?? containerRef.current?.offsetWidth ?? 800;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientX - startX;
      const newWidth = Math.max(minWidthPx, startWidth + delta);
      setContentWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [contentWidth, minWidthPx]);

  return (
    <div className="overflow-x-auto w-full h-full">
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: contentWidth ? `${contentWidth}px` : `${defaultWidthPercent}%`,
          minWidth: `${minWidthPx}px`,
        }}
      >
        {children}

        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-3 cursor-col-resize flex items-center justify-center group hover:bg-border/30 transition-colors z-10"
          title={t('ui.dragToResize')}
        >
          <div className="h-8 w-3 flex items-center justify-center rounded-sm border bg-border opacity-50 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
