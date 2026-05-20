'use server'
import { db } from '@/lib/singletondat'

export async function saveLocation(lat: number, lng: number, userId: string) {
  try {
    const newEntry = await db.userLocation.upsert({
      where: { userId },
      update: { latitude: lat, longitude: lng },
      create: {
        userId,
        latitude: lat,
        longitude: lng,
      },
    })
    console.log("works")
    return { success: true, id: newEntry.id }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false }
  }
}