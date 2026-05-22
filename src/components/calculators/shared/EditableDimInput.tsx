import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableDimInputProps {
  value: number;
  onCommit: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function EditableDimInput({ 
  value, 
  onCommit, 
  min = 100, 
  max = 5000, 
  className = "" 
}: EditableDimInputProps) {
  const [localVal, setLocalVal] = useState(value.toString());
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setLocalVal(value.toString());
    }
  }, [value, focused]);

  const commit = () => {
    setFocused(false);
    let num = parseInt(localVal, 10);
    if (isNaN(num)) num = min;
    num = Math.max(min, Math.min(max, num));
    setLocalVal(num.toString());
    onCommit(num);
  };

  return (
    <Input
      type="number"
      value={focused ? localVal : value}
      onChange={(e) => setLocalVal(e.target.value)}
      onFocus={() => { setFocused(true); setLocalVal(value.toString()); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
      min={min}
      max={max}
      className={cn("focus:ring-2 focus:ring-primary focus:bg-background", className)}
    />
  );
}
