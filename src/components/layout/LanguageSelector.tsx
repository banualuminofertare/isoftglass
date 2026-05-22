import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const FlagRO = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="6.67" height="15" fill="#002B7F" />
    <rect x="6.67" y="0" width="6.67" height="15" fill="#FCD116" />
    <rect x="13.34" y="0" width="6.67" height="15" fill="#CE1126" />
  </svg>
);

const FlagGB = () => (
  <svg width="20" height="15" viewBox="0 0 60 45" className="rounded-sm overflow-hidden shrink-0">
    <rect width="60" height="45" fill="#012169" />
    <path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,45 M60,0 L0,45" stroke="#C8102E" strokeWidth="2" />
    <path d="M30,0 V45 M0,22.5 H60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 V45 M0,22.5 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const FlagIT = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="6.67" height="15" fill="#009246" />
    <rect x="6.67" y="0" width="6.67" height="15" fill="#fff" />
    <rect x="13.34" y="0" width="6.67" height="15" fill="#CE2B37" />
  </svg>
);

const FlagDE = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="20" height="5" fill="#000" />
    <rect x="0" y="5" width="20" height="5" fill="#DD0000" />
    <rect x="0" y="10" width="20" height="5" fill="#FFCE00" />
  </svg>
);

const FlagPL = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="20" height="7.5" fill="#fff" />
    <rect x="0" y="7.5" width="20" height="7.5" fill="#DC143C" />
  </svg>
);

const FlagFR = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="6.67" height="15" fill="#0055A4" />
    <rect x="6.67" y="0" width="6.67" height="15" fill="#fff" />
    <rect x="13.34" y="0" width="6.67" height="15" fill="#EF4135" />
  </svg>
);

const FlagES = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="20" height="3.75" fill="#AA151B" />
    <rect x="0" y="3.75" width="20" height="7.5" fill="#F1BF00" />
    <rect x="0" y="11.25" width="20" height="3.75" fill="#AA151B" />
  </svg>
);

const FlagNL = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="20" height="5" fill="#AE1C28" />
    <rect x="0" y="5" width="20" height="5" fill="#fff" />
    <rect x="0" y="10" width="20" height="5" fill="#21468B" />
  </svg>
);

const FlagHR = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm overflow-hidden shrink-0">
    <rect x="0" y="0" width="20" height="5" fill="#FF0000" />
    <rect x="0" y="5" width="20" height="5" fill="#fff" />
    <rect x="0" y="10" width="20" height="5" fill="#171796" />
    <rect x="8" y="5" width="4" height="3" fill="#FF0000" stroke="#fff" strokeWidth="0.3" />
  </svg>
);

const languages = [
  { code: 'ro', label: 'Română', Flag: FlagRO },
  { code: 'en', label: 'English', Flag: FlagGB },
  { code: 'it', label: 'Italiano', Flag: FlagIT },
  { code: 'de', label: 'Deutsch', Flag: FlagDE },
  { code: 'pl', label: 'Polski', Flag: FlagPL },
  { code: 'fr', label: 'Français', Flag: FlagFR },
  { code: 'es', label: 'Español', Flag: FlagES },
  { code: 'nl', label: 'Nederlands', Flag: FlagNL },
  { code: 'hr', label: 'Hrvatski', Flag: FlagHR },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <currentLang.Flag />
          <span className="hidden sm:inline text-xs font-medium uppercase">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`gap-2 cursor-pointer ${i18n.language === lang.code ? 'bg-accent' : ''}`}
          >
            <lang.Flag />
            <span className="text-sm">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
