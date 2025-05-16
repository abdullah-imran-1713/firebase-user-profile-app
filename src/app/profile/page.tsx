'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('JohnDoe');
  const [email] = useState('john@example.com');
  const [avatar, setAvatar] = useState('/default-avatar.jpg');

  const handleSave = () => {
    setIsEditing(false);
    // Add your save logic here (API call, etc.)
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <Button
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <label htmlFor="avatar-upload" className="relative cursor-pointer">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatar} alt="Profile picture" />
                <AvatarFallback>
                  <Skeleton className="w-24 h-24 rounded-full" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}
            </label>

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                {isEditing ? (
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700">{username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <p className="text-gray-700">{email}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          {isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mr-2"
            >
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}