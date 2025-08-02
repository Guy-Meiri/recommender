import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, User, Sun, Moon } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';

interface AppBarProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

export function AppBar({ user, onSignOut }: AppBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!user) return null;

  return (
    <>
      {/* App Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Batata Time" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-xl">Batata Time</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              My Lists
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark
                </>
              )}
            </Button>
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden ml-auto"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 space-y-4">
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Lists
                </Link>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="gap-2 w-full justify-start"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Switch to Dark Mode
                    </>
                  )}
                </Button>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="gap-2 w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
