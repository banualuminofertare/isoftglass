import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { COLOR_PRESETS, getColorLabel, type ColorPreset } from '@/lib/colorPresets';
import { Check } from 'lucide-react';

interface ColorPickerPopoverProps {
  value: string;
  onChange: (hex: string) => void;
  presets?: readonly ColorPreset[];
}

export function ColorPickerPopover({ value, onChange, presets }: ColorPickerPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activePresets = presets || COLOR_PRESETS;
  const label = getColorLabel(value, activePresets);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-8 px-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors cursor-pointer shrink-0"
        >
          <div
            className="w-5 h-5 rounded-full border border-border shrink-0"
            style={{ backgroundColor: value || 'hsl(var(--muted))' }}
          />
          <span className="text-foreground truncate max-w-[120px]">
            {label || 'Culoare'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={t('settings.color.searchColor')} className="h-9" />
          <CommandList>
            <CommandEmpty>{t('settings.color.noColorFound')}</CommandEmpty>
            <CommandGroup>
              {activePresets.map((preset) => (
                <CommandItem
                  key={preset.value}
                  value={preset.label}
                  onSelect={() => { onChange(preset.value); setOpen(false); }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span className="flex-1 text-foreground">{preset.label}</span>
                  <span className="text-xs text-muted-foreground uppercase">{preset.value}</span>
                  {value === preset.value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="border-t p-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#hex custom"
            className="h-7 text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
