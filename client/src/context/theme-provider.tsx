import { createContext, useContext, useEffect, useState } from "react";


type Theme = 'light' | 'dark' | 'system';
type ColorTheme = "default" | "blue" | "green" | "red" | "purple" | "orange" | "rose" | "red";


type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: string;
    defaultColorTheme?: ColorTheme;
    storageKey?: string;
}

type ThemeProviderState = {
    theme: Theme;
    colorTheme?: ColorTheme
    setTheme: (theme: Theme) => void;
    setColorTheme: (colorTheme: ColorTheme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    colorTheme: "default",
    setTheme: () => null,
    setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, defaultTheme = "system", defaultColorTheme = "default", storageKey = "app-theme", ...props }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);

    const [colorTheme, setColorTheme] = useState<ColorTheme>(() => (localStorage.getItem(`${storageKey}-color`) as ColorTheme || defaultColorTheme))
    useEffect(() => {
        const root = window.document.documentElement;


        root.classList.remove("light", "dark", "theme-blue", "theme-green", "theme-red", "theme-purple", "theme-orange", "theme-rose");

        if (colorTheme !== "default") {
            root.classList.add(`theme-${colorTheme}`)
        }

        if (theme === 'system') {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme, colorTheme]);

    const value = {
        theme,
        colorTheme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme)
        },
        setColorTheme: (colorTheme: ColorTheme) => {
            localStorage.setItem(`${storageKey}-color`, colorTheme);
            setColorTheme(colorTheme)
        }
    };

    return (
        <ThemeProviderContext.Provider value={value} {...props}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}


