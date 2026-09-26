import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortalTheme } from "@/components/theme/PortalThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = usePortalTheme();
  const dark = theme === "dark";
  const label = dark ? "Ativar modo claro" : "Ativar modo escuro";
  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggleTheme}
      className="h-11 w-11 shrink-0 hover:text-lodge-gold focus-visible:ring-lodge-gold"
      aria-label={label} title={label} aria-pressed={dark}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}