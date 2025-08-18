import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string from environment variables
// Disable browser warnings for this demo app
export const sql = neon(process.env.DATABASE_URL!, {
  disableWarningInBrowsers: true,
})

export interface Font {
  id: number
  name: string
  weights: string[]
  default_text: string
  created_at: Date
}
