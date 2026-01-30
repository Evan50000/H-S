import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nuh Uh' })
  }

  const { a, b } = req.body

  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ message: 'Invalid input' })
  }

  const result = a + b

  res.status(200).json({ result })
}
