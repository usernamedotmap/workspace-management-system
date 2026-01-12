// components/theme-toggle-combined.tsx
import { Moon, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/theme-provider";

const colorThemes = [
  { value: "default", label: "Default", color: "bg-gray-900 dark:bg-gray-100" },
  { value: "blue", label: "Blue", color: "bg-blue-600" },
  { value: "green", label: "Green", color: "bg-green-600" },
  { value: "purple", label: "Purple", color: "bg-purple-600" },
  { value: "orange", label: "Orange", color: "bg-orange-600" },
    {value: "rose", label: "Rose", color: "bg-rose-600"},
//   { value: "red", label: "Red", color: "bg-red-600" },
];

const  ThemeToggle = () => {
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Sun className="mr-2 h-4 w-4" />
          System
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Color
        </DropdownMenuLabel>
        {colorThemes.map((ct) => (
          <DropdownMenuItem
            key={ct.value}
            onClick={() => setColorTheme(ct.value as any)}
          >
            <div className={`mr-2 h-4 w-4 rounded-full ${ct.color}`} />
            {ct.label}
            {colorTheme === ct.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;