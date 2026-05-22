import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Palette,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
  Eraser,
  Quote,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const FONT_SIZES = ['8', '9', '10', '11', '12', '13', '14', '16', '18', '20', '24', '28', '32'];
const DEFAULT_SIZE = '13';

const TEXT_COLORS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

const HIGHLIGHT_COLORS = [
  '#FEF3C7', '#FED7AA', '#FECACA', '#FBCFE8',
  '#E9D5FF', '#DDD6FE', '#C7D2FE', '#BFDBFE',
  '#A5F3FC', '#A7F3D0', '#D9F99D', '#FEF08A',
];

const TextStyleWithFontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, '') || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor(props: RichTextEditorProps) {
  const { i18n } = useTranslation();
  return <RichTextEditorInner key={i18n.language} {...props} />;
}

function RichTextEditorInner({ value, onChange, placeholder }: RichTextEditorProps) {
  const { t } = useTranslation();
  const [selectedFontSize, setSelectedFontSize] = useState(DEFAULT_SIZE);
  const [, setTick] = useState(0);
  const selectionRef = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
        blockquote: {},
        horizontalRule: {},
      }),
      Underline,
      TextStyleWithFontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content max-w-none focus:outline-none min-h-[60px] px-3 py-2 text-sm',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editor) return;

    const syncFontSize = () => {
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };

      const rawFontSize = editor.getAttributes('textStyle').fontSize;
      const normalized = typeof rawFontSize === 'string'
        ? rawFontSize.replace('px', '').trim()
        : DEFAULT_SIZE;

      setSelectedFontSize(FONT_SIZES.includes(normalized) ? normalized : DEFAULT_SIZE);
    };

    const onAnyChange = () => {
      syncFontSize();
      // Force re-render so toolbar Toggle pressed states refresh
      setTick((n) => n + 1);
    };

    syncFontSize();
    editor.on('selectionUpdate', onAnyChange);
    editor.on('transaction', onAnyChange);
    editor.on('update', onAnyChange);

    return () => {
      editor.off('selectionUpdate', onAnyChange);
      editor.off('transaction', onAnyChange);
      editor.off('update', onAnyChange);
    };
  }, [editor]);

  if (!editor) return null;

  const getSelectionChain = () => {
    const chain = editor.chain().focus();
    const savedSelection = selectionRef.current;
    const docSize = editor.state.doc.content.size;

    if (!savedSelection || docSize === 0) {
      return chain;
    }

    const from = Math.max(1, Math.min(savedSelection.from, docSize));
    const to = Math.max(1, Math.min(savedSelection.to, docSize));
    return chain.setTextSelection({ from, to });
  };

  const runToggle = (cmdName: 'toggleBold' | 'toggleItalic' | 'toggleUnderline' | 'toggleBulletList' | 'toggleOrderedList') => {
    const chain = getSelectionChain();
    (chain as any)[cmdName]().run();
  };

  const setFontSize = (size: string) => {
    setSelectedFontSize(size);

    const chain = getSelectionChain();

    if (size === DEFAULT_SIZE) {
      let commandChain: any = chain.setMark('textStyle', { fontSize: null });
      if (typeof commandChain.removeEmptyTextStyle === 'function') {
        commandChain = commandChain.removeEmptyTextStyle();
      }
      commandChain.run();
    } else {
      chain.setMark('textStyle', { fontSize: `${size}px` }).run();
    }
  };

  const setColor = (color: string | null) => {
    const chain = getSelectionChain();
    if (color === null) {
      (chain as any).unsetColor().run();
    } else {
      (chain as any).setColor(color).run();
    }
  };

  const setHighlight = (color: string | null) => {
    const chain = getSelectionChain();
    if (color === null) {
      (chain as any).unsetHighlight().run();
    } else {
      (chain as any).setHighlight({ color }).run();
    }
  };

  const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    getSelectionChain().setTextAlign(align).run();
  };

  const toggleHeading = (level: 1 | 2 | 3) => {
    getSelectionChain().toggleHeading({ level }).run();
  };

  const toggleBlockquote = () => {
    getSelectionChain().toggleBlockquote().run();
  };

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(t('ui.promptLinkUrl', 'URL:'), previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      getSelectionChain().extendMarkRange('link').unsetLink().run();
      return;
    }
    getSelectionChain().extendMarkRange('link').setLink({ href: url }).run();
  };

  const unsetLink = () => {
    getSelectionChain().extendMarkRange('link').unsetLink().run();
  };

  const clearFormatting = () => {
    getSelectionChain().unsetAllMarks().clearNodes().run();
  };

  return (
    <div className="rounded-md border border-input bg-background">
      <div
        className="flex items-center gap-1 border-b border-input px-2 py-1 flex-wrap"
        onMouseDown={(e) => {
          // Prevent the toolbar from stealing focus/selection from the editor.
          // Allow Radix Select / Popover triggers to receive their own pointer events.
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-trigger], [role="combobox"], [data-radix-popover-trigger], [data-popover-trigger], input')) return;
          e.preventDefault();
        }}
      >
        {/* Headings */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => toggleHeading(1)}
          aria-label="H1"
          title="Titlu 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => toggleHeading(2)}
          aria-label="H2"
          title="Titlu 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => toggleHeading(3)}
          aria-label="H3"
          title="Titlu 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => runToggle('toggleBold')}
          aria-label={t('ui.ariaBold')}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => runToggle('toggleItalic')}
          aria-label={t('ui.ariaItalic')}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => runToggle('toggleUnderline')}
          aria-label={t('ui.ariaUnderline')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => runToggle('toggleBulletList')}
          aria-label={t('ui.ariaList')}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => runToggle('toggleOrderedList')}
          aria-label={t('ui.ariaListNumbered')}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={toggleBlockquote}
          aria-label="Citat"
          title="Citat"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Alignment */}
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => setAlign('left')}
          aria-label="Aliniere stânga"
          title="Aliniere stânga"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => setAlign('center')}
          aria-label="Aliniere centru"
          title="Aliniere centru"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => setAlign('right')}
          aria-label="Aliniere dreapta"
          title="Aliniere dreapta"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'justify' })}
          onPressedChange={() => setAlign('justify')}
          aria-label="Justify"
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              aria-label="Culoare text"
              title="Culoare text"
            >
              <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || undefined }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Culoare ${c}`}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs"
              onClick={() => setColor(null)}
            >
              Resetează culoarea
            </Button>
          </PopoverContent>
        </Popover>

        {/* Highlight color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              aria-label="Evidențiere"
              title="Evidențiere text"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => setHighlight(c)}
                  aria-label={`Highlight ${c}`}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs"
              onClick={() => setHighlight(null)}
            >
              Elimină evidențierea
            </Button>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Link */}
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={setLink}
          aria-label="Inserează link"
          title="Inserează link"
        >
          <Link2 className="h-4 w-4" />
        </Toggle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={unsetLink}
          disabled={!editor.isActive('link')}
          aria-label="Elimină link"
          title="Elimină link"
        >
          <Link2Off className="h-4 w-4" />
        </Button>

        {/* Horizontal rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={insertHorizontalRule}
          aria-label="Linie despărțitoare"
          title="Linie despărțitoare"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Type className="h-3.5 w-3.5 text-muted-foreground" />
          <Select
            value={selectedFontSize}
            onValueChange={setFontSize}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue placeholder={DEFAULT_SIZE} />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Clear formatting + Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={clearFormatting}
          aria-label="Șterge formatarea"
          title="Șterge formatarea"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label={t('ui.tooltipUndo')}
          title={t('ui.tooltipUndo')}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label={t('ui.tooltipRedo')}
          title={t('ui.tooltipRedo')}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'rich-text-editor',
          !value && 'text-muted-foreground',
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

