'use server'

import { db } from '@/lib/singletondat'

export async function saveLocation(lat: number, lng: number) {
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