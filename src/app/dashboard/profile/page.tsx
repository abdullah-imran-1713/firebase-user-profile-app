'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName, 
          photoURL 
        });
        await auth.currentUser.reload();
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update Firebase profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: data.url
        });
        await auth.currentUser.reload();
        setPhotoURL(data.url); // Update local state
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between pb-4">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={loading || uploading}
              >
                {loading ? 'Saving...' : 
                 uploading ? 'Uploading...' :
                 isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label htmlFor="avatar-upload" className="relative cursor-pointer">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={photoURL} alt="Profile picture" />
                  <AvatarFallback>
                    {uploading ? (
                      <Skeleton className="w-24 h-24 rounded-full" />
                    ) : (
                      user?.email?.[0].toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                )}
              </label>

              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  {isEditing ? (
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={uploading}
                    />
                  ) : (
                    <p className="text-gray-700">
                      {displayName || "No username set"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-700 break-all">{user?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}