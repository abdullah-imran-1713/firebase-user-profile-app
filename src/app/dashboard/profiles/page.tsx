'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  uid: string;
  username?: string;
  email?: string;
  photoURL?: string;
  age?: number;
  gender?: string;
  location?: string;
}

export default function ProfilesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const ref = collection(db, 'profiles');
        const q = query(ref, where('uid', '!=', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => {
          const d = doc.data() as Omit<Profile, 'uid'>;
          return { uid: doc.id, ...d };
        });
        setProfiles(data);
        setError('');
      } catch (e) {
        console.error(e);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
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
      {profiles.map(p => (
        <Link
          key={p.uid}
          href={`/dashboard/profiles/${p.uid}`}
          className="block hover:shadow-lg transition-shadow"
        >
          <Card>
            <CardHeader className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={p.photoURL} />
                <AvatarFallback>{p.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{p.username || 'No username'}</h3>
                <p className="text-sm text-muted-foreground truncate">{p.email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Age:</span>
                <span className="text-sm font-medium">{p.age ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Gender:</span>
                <span className="text-sm font-medium capitalize">{p.gender ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Location:</span>
                <span className="text-sm font-medium truncate">{p.location ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
