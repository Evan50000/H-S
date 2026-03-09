
'use server' // Mark this as a backend-only file

import { db } from '@/lib/singletondat' // Your Prisma client instance

export async function saveLocationToDb(lat: number, lng: number) {
  try {
    const newEntry = await db.userLocation.create({
      data: {
        latitude: lat,
        longitude: lng,
      },
    })
    return { success: true, id: newEntry.id }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false }
  }
}