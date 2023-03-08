import './globals.css'

export const metadata = {
  title: 'IOT PROJECT SMART BIN',
  description: 'create by KonSod Group',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
