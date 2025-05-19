'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Profile {
  uid: string;
  username?: string;
  email?: string;
  photoURL?: string;
  age?: number;
  gender?: string;
  location?: string;
}

export default function OtherProfilePage() {
  const { uid } = useParams() as { uid: string };
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const snap = await getDoc(doc(db, 'profiles', uid));
      if (snap.exists()) {
        const data = snap.data() as Omit<Profile, 'uid'>;
        setProfile({ uid: snap.id, ...data });
      }
      setLoading(false);
    })();
  }, [uid]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!profile) return <p className="p-4 text-red-500">Profile not found</p>;

  return (
    <>
      {/* Back button */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 max-w-xl">
        <div className="flex items-start gap-6">
          {/* Avatar (clickable) */}
          <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profile.photoURL}
                alt="Profile picture"
                className="object-cover w-full h-full rounded-full"
              />
              <AvatarFallback>
                {profile.username?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>

            <div>
              <Label>Email</Label>
              <p className="mt-1">{profile.email}</p>
            </div>

            <div>
              <Label>Age</Label>
              <p className="mt-1">{profile.age ?? 'Not specified'}</p>
            </div>

            <div>
              <Label>Gender</Label>
              <p className="mt-1 capitalize">{profile.gender ?? 'Not specified'}</p>
            </div>

            <div>
              <Label>Location</Label>
              <p className="mt-1">{profile.location ?? 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for full-size avatar */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-opacity-90 p-6 rounded-xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={profile.photoURL!}
              alt="Profile full view"
              className="w-48 h-48 object-cover rounded-full mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
