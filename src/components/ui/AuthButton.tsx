
import { useUser } from "@/context/UserContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AuthButton = () => {
  const { isLoggedIn, userName, logout } = useUser();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  
  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuLabel>{userName || 'User'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/mortgage-planning">Mortgage Planning</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/financial-goals">Financial Goals</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button asChild size="sm" className="flex items-center gap-1 bg-primary hover:bg-primary/90">
      <Link to="/auth">
        <LogIn className="h-4 w-4" />
        Login
      </Link>
    </Button>
  );
};

export default AuthButton;
