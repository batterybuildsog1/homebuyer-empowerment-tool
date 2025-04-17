
import React from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

export function UserNav() {
  const { isLoggedIn, userName, signOut } = useUser();
  const navigate = useNavigate();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // If not logged in, show login button
  if (!isLoggedIn) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(ROUTES.auth)}
      >
        Sign In
      </Button>
    );
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.root);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userName ? 'Signed in' : 'Guest'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(ROUTES.dashboard)}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
