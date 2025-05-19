'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-start justify-start">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome, {user?.displayName || user?.email?.split('@')[0] || 'User'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        This is your personal dashboard
      </p>
    </div>
  );
}