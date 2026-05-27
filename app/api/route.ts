import { NextRequest } from "next/server"
import { db } from "@/lib/singletondat"

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return new Response("missing userId", { status: 400 })
  
  await db.userLocation.delete({
    where: { userId }
  })
  
  return new Response("ok")
}