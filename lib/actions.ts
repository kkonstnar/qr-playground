"use server"

import { revalidatePath } from "next/cache"
import { sql, type Font } from "./db"

export async function getFonts(): Promise<Font[]> {
  try {
    const fonts = await sql<Font[]>`
      SELECT id, name, weights, default_text, created_at FROM fonts ORDER BY id ASC
    `

    // Parse JSONB weights to JavaScript array
    return fonts.map((font) => ({
      ...font,
      weights: typeof font.weights === "string" ? JSON.parse(font.weights) : font.weights,
    }))
  } catch (error) {
    console.error("Error fetching fonts:", error)
    return []
  }
}

export async function addFont(name: string, weights: string[], defaultText = "Logo Text"): Promise<Font | null> {
  try {
    // Convert weights array to JSONB
    const weightsJson = JSON.stringify(weights)

    const result = await sql<Font[]>`
      INSERT INTO fonts (name, weights, default_text)
      VALUES (${name}, ${weightsJson}::jsonb, ${defaultText})
      RETURNING *
    `

    // Parse JSONB weights to JavaScript array
    const font = {
      ...result[0],
      weights: typeof result[0].weights === "string" ? JSON.parse(result[0].weights) : result[0].weights,
    }

    revalidatePath("/")
    return font
  } catch (error) {
    console.error("Error adding font:", error)
    return null
  }
}

export async function deleteFont(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM fonts WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return false
    }

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting font:", error)
    return false
  }
}
