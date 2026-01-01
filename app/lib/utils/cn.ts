/**
 * Class name utility for combining and merging Tailwind CSS classes
 * Replaces clsx and tailwind-merge with a lightweight implementation
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[]

/**
 * Combines class names and handles Tailwind CSS conflicts
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]): string {
  const classes = new Set<string>()
  const tailwindMap = new Map<string, string>()
  
  // Helper function to process values recursively
  const processValue = (value: ClassValue) => {
    if (!value) return
    
    if (typeof value === 'string' || typeof value === 'number') {
      const classList = String(value).trim().split(/\s+/)
      
      for (const className of classList) {
        // Handle Tailwind conflict resolution
        const prefix = getTailwindPrefix(className)
        if (prefix) {
          tailwindMap.set(prefix, className)
        } else {
          classes.add(className)
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(processValue)
    }
  }
  
  // Process all inputs
  inputs.forEach(processValue)
  
  // Add resolved Tailwind classes
  for (const className of tailwindMap.values()) {
    classes.add(className)
  }
  
  return Array.from(classes).join(' ')
}

/**
 * Get Tailwind prefix for conflict resolution
 */
function getTailwindPrefix(className: string): string | null {
  // Common Tailwind prefixes that conflict
  const patterns = [
    /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-/,
    /^(w|h|min-w|max-w|min-h|max-h)-/,
    /^(text|bg|border|ring)-/,
    /^(flex|grid|gap|space)-/,
    /^(rounded|shadow|opacity|z)-/,
    /^(top|right|bottom|left|inset)-/,
    /^(transition|duration|ease|delay)-/,
    /^(scale|rotate|translate|skew)-/,
    /^(col|row)-/,
    /^(justify|items|content|self|place)-/,
  ]
  
  for (const pattern of patterns) {
    const match = className.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}