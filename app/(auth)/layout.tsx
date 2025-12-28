/**
 * @file app/(auth)/layout.tsx
 * @description Auth pages layout without header/footer
 * @author Team Kenya Dev
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}