'use server'
import { db } from '@/lib/singletondat'

export async function saveLocation(lat: number, lng: number, userId: string, seeker: boolean) {
  try {
    const newEntry = await db.userLocation.upsert({
      where: { userId },
      update: { latitude: lat, longitude: lng, seeker },
      create: { userId, latitude: lat, longitude: lng, seeker },
    })
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
export async function deleteLocation(userId: string) {
  try {
    await db.userLocation.delete({
      where: { userId }
    })
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false }
  }
}