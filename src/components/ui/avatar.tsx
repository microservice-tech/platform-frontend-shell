import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const avatarVariants = cva(
  "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
  {
    variants: {
      size: {
        sm: "w-6 h-6 text-xs",
        md: "w-9 h-9 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
      },
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
}

function Avatar({ className, size, variant, src, alt, fallback, children, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={cn(avatarVariants({ size, variant }), className)}
        {...props}
      />
    )
  }

  return (
    <div className={cn(avatarVariants({ size, variant }), className)} {...props}>
      {children || fallback || "?"}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Avatar, avatarVariants }
