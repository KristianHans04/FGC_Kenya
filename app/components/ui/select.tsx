import * as React from "react"
import { cn } from "@/app/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const Select = ({ 
  value, 
  onValueChange, 
  defaultValue, 
  children 
}: {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "")
  const [open, setOpen] = React.useState(false)

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ 
      value: selectedValue, 
      onValueChange: handleValueChange,
      open,
      setOpen
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context?.setOpen(!context.open)}
      {...props}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-50"
      >
        <path
          d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.51227 8.64867 7.61905 8.69375 7.73 8.69375C7.84095 8.69375 7.94773 8.64867 8.02821 8.56819L10.5282 6.06819C10.7039 5.89245 10.7039 5.60753 10.5282 5.43179C10.3525 5.25605 10.0676 5.25605 9.89179 5.43179L7.73 7.59351L5.56821 5.43179C5.39245 5.25605 5.10753 5.25605 4.93179 5.43179Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  return <span>{context?.value || placeholder}</span>
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  if (!context?.open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        context?.value === value && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}