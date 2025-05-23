
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Settings, Users, FileText, Home } from 'lucide-react';

export function NavigationBar() {
  const { isAdmin } = useAuth();

  return (
    <div className="w-full bg-white border-b border-gray-200 py-2 px-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Commission Tracker
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>System Settings</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {isAdmin && (
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/admin"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-blue-100 p-6 no-underline outline-none focus:shadow-md"
                        >
                          <Users className="h-6 w-6 text-blue-600" />
                          <div className="mb-2 mt-4 text-lg font-medium text-blue-900">
                            User Management
                          </div>
                          <p className="text-sm leading-tight text-blue-800">
                            Manage users, roles, and permissions across the system
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  )}

                  <ListItem href="/settings/profile" title="Profile Settings" Icon={Settings}>
                    Manage your account preferences and personal information
                  </ListItem>

                  <ListItem href="/settings/billing" title="Billing" Icon={FileText}>
                    View invoices, payment history, and manage billing settings
                  </ListItem>
                  
                  {isAdmin && (
                    <ListItem href="/settings/system" title="System Configuration" Icon={Settings}>
                      Configure global system settings and defaults
                    </ListItem>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

interface ListItemProps {
  href: string;
  title: string;
  children: React.ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
}

const ListItem = ({ href, title, children, Icon }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
