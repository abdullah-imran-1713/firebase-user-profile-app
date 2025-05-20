'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ApiUser {
  uid: string;
  username?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  age?: number;
  gender?: string;
  location?: string;
}

export default function ProfilesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
  setLoading(true);
  try {
    const res = await fetch('/api/profiles');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const { profiles } = await res.json();  
    // Exclude current user
    const filtered = profiles.filter((p: ApiUser) => p.uid !== user?.uid);
    setUsers(filtered);
    setError('');
  } catch (e: unknown) {
    console.error('Failed to load profiles', e);
    setError('Failed to load profiles');
  } finally {
    setLoading(false);
  }
}


    if (user) fetchUsers();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {users.map(u => (
        <Link
          key={u.uid}
          href={`/dashboard/profiles/${u.uid}`}
          className="block hover:shadow-lg transition-shadow"
        >
          <Card>
            <CardHeader className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {u.photoURL ? (
                  <AvatarImage src={u.photoURL} alt={u.displayName || u.email} />
                ) : (
                  <AvatarFallback>{u.email[0].toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold">{u.username ?? u.displayName ?? 'No Name'}</h3>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Age:</span>
                <span className="text-sm font-medium">{u.age ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Gender:</span>
                <span className="text-sm font-medium capitalize">{u.gender ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Location:</span>
                <span className="text-sm font-medium truncate">{u.location ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
