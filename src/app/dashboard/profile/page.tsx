'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,} from '@/components/ui/select';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      const fetchProfile = async () => {
        const ref = doc(db, 'profiles', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setAge(data.age != null ? String(data.age) : '');
          setGender(data.gender || '');
          setLocation(data.location || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    setError('');
    if (!age || !gender || !location) {
      setError('Please fill out age, gender, and location.');
      return;
    }
    setLoading(true);
    try {
      if (!user) throw new Error('No user');

      await updateProfile(user, { displayName, photoURL });
      await user.reload();

      const ref = doc(db, 'profiles', user.uid);
      await updateDoc(ref, {
        username: displayName,
        age: parseInt(age, 10),
        gender,
        location,
        photoURL: photoURL || null,
        updatedAt: serverTimestamp(),
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url = data.url;
      await updateProfile(user!, { photoURL: url });
      await user!.reload();
      setPhotoURL(url);
      const ref = doc(db, 'profiles', user!.uid);
      await updateDoc(ref, { photoURL: url, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-md z-10">
          <CardHeader className="flex items-center justify-between pb-4">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <Button
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={loading || uploading}
              className='cursor-pointer'
            >
              {loading
                ? 'Saving...'
                : uploading
                ? 'Uploading...'
                : isEditing
                ? 'Save Changes'
                : 'Edit Profile'}
            </Button>
          </CardHeader>

          {error && <p className="text-red-500 text-center mb-2">{error}</p>}

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label htmlFor="avatar-upload" className="relative">
                <Avatar
                  className="w-24 h-24 cursor-pointer"
                  onClick={() => !isEditing && setIsModalOpen(true)}
                >
                  <AvatarImage src={photoURL} alt="Profile picture" className="object-cover w-full h-full rounded-full" />
                  <AvatarFallback>
                    {uploading ? (
                      <Skeleton className="w-24 h-24 rounded-full" />
                    ) : (
                      user.email?.[0].toUpperCase()
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
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={uploading}
                    />
                  ) : (
                    <p className="text-gray-700">{displayName || 'No username set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-gray-700 break-all">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min={13}
                      max={120}
                    />
                  ) : (
                    <p className="text-gray-700">{age || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-700">{gender || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            {isEditing && (
              <Button
                variant="outline"
                className='cursor-pointer'
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                }}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Modal with blurred background and close button */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative bg-opacity-90 p-4 rounded-xl w-64"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photoURL}
                alt="Profile view"
                className="w-40 h-40 object-cover rounded-full mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
