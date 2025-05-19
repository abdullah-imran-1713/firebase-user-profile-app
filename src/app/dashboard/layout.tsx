'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
    {
      name: 'Your Profile',
      href: '/dashboard/profile',
    },
    {
      name: 'Profiles',
      href: '/dashboard/profiles',
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <div className="hidden w-64 border-r bg-muted/40 md:flex md:flex-col">
          <div className="flex flex-col h-full p-4 gap-2">
            <div className="mb-4 px-2">
              <h2 className="text-xl font-semibold">User Profile App</h2>
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
                      'w-full justify-start cursor-pointer hover:bg-[#DDDD]',
                      pathname === item.href && 'bg-accent'
                    )}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="mt-auto px-2">
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer hover:bg-[#DDDD]"
                onClick={handleLogout}
              >
                Logout
              </Button>
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
