'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
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
    const fetchProfiles = async () => {
      try {
        if (!user) return;

        const profilesRef = collection(db, 'profiles');
        // Exclude current user's profile
        const q = query(profilesRef, where('uid', '!=', user.uid));
        const querySnapshot = await getDocs(q);

        const profilesData: Profile[] = [];
        querySnapshot.forEach((doc) => {
          profilesData.push(doc.data() as Profile);
        });

        setProfiles(profilesData);
        setError('');
      } catch (err) {
        console.error('Error fetching profiles:', err);
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
        {[1, 2, 3].map((i) => (
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
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {profiles.map((profile) => (
        <Card key={profile.uid} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>
                {profile.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{profile.username || 'No username'}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Age:</span>
              <span className="text-sm font-medium">
                {profile.age || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Gender:</span>
              <span className="text-sm font-medium capitalize">
                {profile.gender || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Location:</span>
              <span className="text-sm font-medium truncate">
                {profile.location || 'Not specified'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}