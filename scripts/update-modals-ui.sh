#!/bin/bash

# Script to update all modals with Kenyan flag colors and improved UI

echo "Updating all modals with vibrant Kenyan flag colors..."

# Find all TSX files with modal patterns
find app -name "*.tsx" -type f | while read file; do
  if grep -q "fixed inset-0.*z-50\|fixed inset-0.*bg-black/50" "$file"; then
    echo "Processing: $file"
    
    # Backup original file
    cp "$file" "$file.backup"
    
    # Update modal headers with Kenyan colors
    sed -i 's/<div className="flex justify-between items-center mb-4">/<div className="relative overflow-hidden">\n          <div className="absolute inset-0 bg-black\/5"><\/div>\n          <div className="relative flex items-center justify-between p-4 border-b-2 border-red-600\/20">/g' "$file"
    
    # Update buttons with proper styling
    sed -i 's/className="w-full px-3 py-2 border rounded-lg bg-background"/className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600\/30 focus:border-green-600"/g' "$file"
    
    # Update submit buttons to use green
    sed -i 's/bg-primary/bg-green-600/g' "$file"
    sed -i 's/hover:bg-primary\/90/hover:bg-green-700/g' "$file"
    
    # Update cancel buttons
    sed -i 's/bg-secondary/bg-muted/g' "$file"
    sed -i 's/hover:bg-secondary\/80/hover:bg-muted\/80/g' "$file"
    
    # Add border styling to modal containers
    sed -i 's/bg-card rounded-lg/bg-card rounded-lg border-2 border-border/g' "$file"
    
    echo "Updated: $file"
  fi
done

echo "Modal UI update complete!"