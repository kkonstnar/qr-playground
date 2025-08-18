import type * as React from "react"

interface NoteProps {
  children: React.ReactNode
  variant?: "default" | "warning"
}

const variants = {
  default: {
    bg: "#0A0A0A",
    text: "#A1A1A1",
    border: "#2E2E2E",
  },
  warning: {
    bg: "#341C00",
    text: "#F1A10D",
    border: "#352108",
  },
}

export const Note: React.FC<NoteProps> = ({ children, variant = "warning" }) => {
  const { bg, text, border } = variants[variant]

  return (
    <div
      className="w-full rounded-lg p-2"
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: "1px",
        borderStyle: "solid",
        color: text,
      }}
    >
      <div className="flex gap-2 items-start align-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={text}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 mt-1 md:mt-0.5 shrink-0 rotate-180"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <div className="text-[13px]" style={{ color: text }}>
          {children}
        </div>
      </div>
    </div>
  )
}
