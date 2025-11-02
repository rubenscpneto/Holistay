"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("hover:scale-110 transition-transform duration-200", className)}>
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("hover:scale-110 transition-transform duration-200", className)}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-all hover:rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

