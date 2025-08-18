import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/db"

// DELETE /api/fonts/:id - Delete a font
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Font ID is required" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM fonts WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 })
    }

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("Error deleting font:", error)
    return NextResponse.json({ error: "Failed to delete font" }, { status: 500 })
  }
}
