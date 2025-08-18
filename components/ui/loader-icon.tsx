"use client"

export const LoaderIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <div className="vercel-spinner" style={{ width: size, height: size }}>
      <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
        <g clipPath="url(#clip0_2393_1490)">
          <path
            className="spinner-line spinner-line-0"
            d="M8 0V4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-1"
            d="M3.29773 1.52783L5.64887 4.7639"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-2"
            d="M0.391602 5.52783L4.19583 6.7639"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-3"
            d="M0.391602 10.472L4.19583 9.23598"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-4"
            d="M3.29773 14.472L5.64887 11.236"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-5"
            d="M8 16V12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-6"
            d="M12.7023 14.472L10.3511 11.236"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-7"
            d="M15.6085 10.4722L11.8043 9.2361"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-8"
            d="M15.6085 5.52783L11.8043 6.7639"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="spinner-line spinner-line-9"
            d="M12.7023 1.52783L10.3511 4.7639"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_2393_1490">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <style jsx>{`
        .vercel-spinner {
          display: inline-block;
        }
        
        .spinner-line {
          opacity: 0.1;
          animation: vercel-spin 1.2s linear infinite;
        }
        
        .spinner-line-0 { animation-delay: 0s; }
        .spinner-line-1 { animation-delay: -0.12s; }
        .spinner-line-2 { animation-delay: -0.24s; }
        .spinner-line-3 { animation-delay: -0.36s; }
        .spinner-line-4 { animation-delay: -0.48s; }
        .spinner-line-5 { animation-delay: -0.6s; }
        .spinner-line-6 { animation-delay: -0.72s; }
        .spinner-line-7 { animation-delay: -0.84s; }
        .spinner-line-8 { animation-delay: -0.96s; }
        .spinner-line-9 { animation-delay: -1.08s; }
        
        @keyframes vercel-spin {
          0%, 90% {
            opacity: 0.1;
          }
          10% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
