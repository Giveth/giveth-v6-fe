"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
    type ThemePreference,
    usePreferencesStore,
} from "@/store/preferences";

const order: ThemePreference[] = ["system", "light", "dark"];

function getIcon(theme: ThemePreference) {
    if (theme === "light") return <SunIcon />;
    if (theme === "dark") return <MoonIcon />;
    return <DesktopIcon />;
}

export function ThemeToggle() {
    const theme = usePreferencesStore((state) => state.theme);
    const setTheme = usePreferencesStore((state) => state.setTheme);

    const handleToggle = () => {
        const currentIndex = order.indexOf(theme);
        const nextTheme = order[(currentIndex + 1) % order.length];
        setTheme(nextTheme);
    };

    return (
        <Button
            aria-label={`Switch theme (current: ${theme})`}
            variant="ghost"
            size="icon"
            onClick={handleToggle}
        >
            {getIcon(theme)}
        </Button>
    );
}

