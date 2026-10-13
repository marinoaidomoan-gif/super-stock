import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">SuperStock</h1>
        <p className="text-muted-foreground">Setup OK</p>
        <Button>Se connecter</Button>
      </div>
    </main>
  )
}