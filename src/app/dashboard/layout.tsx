'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
    {
      name: 'Your Profile',
      href: '/dashboard/profile',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <div className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            <div className="mb-4 px-2">
              <h2 className="text-xl font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start',
                      pathname === item.href && 'bg-accent'
                    )}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 flex-col p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}