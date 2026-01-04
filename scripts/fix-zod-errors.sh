#!/bin/bash

# Fix ZodError type issues in all API routes
files=(
  "app/api/profile/[slug]/route.ts"
  "app/api/resources/[id]/route.ts"
  "app/api/tasks/[id]/route.ts"
  "app/api/calendar/events/[id]/rsvp/route.ts"
  "app/api/calendar/events/[id]/route.ts"
  "app/api/resources/route.ts"
  "app/api/tasks/route.ts"
  "app/api/calendar/events/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace error.errors with error.flatten()
    sed -i 's/{ error: '\''Invalid data'\'', details: error\.errors }/{ error: '\''Invalid data'\'', details: error.flatten() }/g' "$file"
  fi
done

echo "Done fixing ZodError issues!"