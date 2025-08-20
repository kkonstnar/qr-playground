import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string from environment variables
// Disable browser warnings for this demo app
// Make database connection optional during build time
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder"
export const sql = neon(databaseUrl, {
  disableWarningInBrowsers: true,
})

export interface Font {
  id: number
  name: string
  weights: string[]
  default_text: string
  created_at: Date
}
