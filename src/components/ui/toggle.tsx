import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  size?: "sm" | "md"
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ pressed, onPressedChange, size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-ui text-sm transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pressed && "bg-muted text-foreground",
          !pressed && "text-muted-foreground",
          size === "sm" && "h-7 px-2 text-xs",
          size === "md" && "h-9 px-3",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Toggle.displayName = "Toggle"
