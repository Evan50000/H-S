'use server'
import { db } from '@/lib/singletondat'

export async function saveLocation(lat: number, lng: number, userId: string) {
  console.log("saveLocation called:", { lat, lng, userId, time: new Date().toISOString() })
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
    console.log("saved:", newEntry)
    return { success: true, id: newEntry.id }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false }
  }
}
export async function getLocations() {
  try {
    const locations = await db.userLocation.findMany()
    return { success: true, locations }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, locations: [] }
  }
}