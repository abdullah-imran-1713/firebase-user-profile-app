import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Fetch all profiles from Firestore
    const snap = await adminDb.collection('profiles').get();
    const profiles = snap.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        username: data.username,
        email:    data.email,
        photoURL: data.photoURL,
        age:      data.age,
        gender:   data.gender,
        location: data.location,
      };
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('[API ERROR]', error);
    return NextResponse.json(
      { error: 'Unable to fetch user profiles' },
      { status: 500 }
    );
  }
}
