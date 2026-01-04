#!/bin/bash

# Fix all calendar pages that have type issues with selectedEvent
files=(
  "app/(dashboard)/(student)/student/calendar/page.tsx"
  "app/(dashboard)/(user)/dashboard/calendar/page.tsx"
  "app/(dashboard)/(alumni)/alumni/calendar/page.tsx"
  "app/(dashboard)/(mentor)/mentor/calendar/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace useState(null) with useState<any>(null)
    sed -i 's/const \[selectedEvent, setSelectedEvent\] = useState(null)/const [selectedEvent, setSelectedEvent] = useState<any>(null)/g' "$file"
    sed -i 's/const \[events, setEvents\] = useState(\[\])/const [events, setEvents] = useState<any[]>([])/g' "$file"
  fi
done

echo "Done fixing calendar types!"