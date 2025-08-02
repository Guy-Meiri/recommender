import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Home, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AppBarProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

export function AppBar({ user, onSignOut }: AppBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) return null;

  return (
    <>
      {/* App Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="font-bold text-lg">Batata Time</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              My Lists
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
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
