/**
 * @file components/ui/dropdown-menu.tsx
 * @description Dropdown menu component with proper open/close state management
 */

'use client'

import * as React from "react"
import { cn } from "@/app/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu')
  }
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ 
  children, 
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange 
}: DropdownMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [isControlled, onOpenChange])
  
  // Close dropdown when clicking outside
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    
    // Add slight delay to avoid immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useDropdownMenu()
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setOpen(!open)
    onClick?.(e)
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { 
      ref, 
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': true,
      ...props 
    })
  }
  
  return (
    <button 
      ref={ref} 
      className={className} 
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center"
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => {
    const { open } = useDropdownMenu()
    
    if (!open) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          align === "end" && "right-0",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          className
        )}
        style={{ marginTop: sideOffset }}
        role="menu"
        aria-orientation="vertical"
        {...props}
      />
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }
>(({ className, disabled, onClick, ...props }, ref) => {
  const { setOpen } = useDropdownMenu()
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
    setOpen(false)
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    role="separator"
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}