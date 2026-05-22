import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImageLightbox({ src, alt = '', className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{ cursor: 'zoom-in' }}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-2 bg-background border">
          <DialogTitle className="sr-only">Previzualizare imagine</DialogTitle>
          <DialogDescription className="sr-only">Previzualizare imagine</DialogDescription>
          <img src={src} alt={alt} className="w-full h-auto rounded object-contain max-h-[80vh]" />
        </DialogContent>
      </Dialog>
    </>
  );
}
