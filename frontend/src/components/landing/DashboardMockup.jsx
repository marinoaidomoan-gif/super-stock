// src/components/landing/DashboardMockup.jsx
//
// Fausse "capture" du tableau de bord, dessinée avec de simples <div>
// (pas d'image à charger). Elle est purement décorative : aria-hidden la
// cache aux lecteurs d'écran. Aucun chiffre n'y est affiché.
const BARRES = [40, 62, 50, 78, 58, 90, 70] // hauteurs en %

export default function DashboardMockup() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border bg-card p-4 shadow-2xl shadow-emerald-500/10"
    >
      {/* Barre de fenêtre : 3 pastilles */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
      </div>

      <div className="grid grid-cols-[48px_1fr] gap-3">
        {/* Menu latéral */}
        <div className="space-y-2">
          <div className="h-8 rounded-md bg-emerald-500/80" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-md bg-muted" />
          ))}
        </div>

        <div className="space-y-3">
          {/* Trois cartes de chiffres clés */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 rounded-lg border p-2.5">
                <div className="h-1.5 w-8 rounded bg-muted-foreground/30" />
                <div className="h-4 w-12 rounded bg-foreground/80" />
                {/* La dernière carte a un point rouge : une alerte de stock bas. */}
                {i === 2 && <div className="size-2 rounded-full bg-red-500" />}
              </div>
            ))}
          </div>

          {/* Graphique en barres */}
          <div className="rounded-lg border p-3">
            <div className="mb-3 h-1.5 w-20 rounded bg-muted-foreground/30" />
            <div className="flex h-24 items-end gap-2">
              {BARRES.map((hauteur, i) => (
                <div
                  key={i}
                  style={{ height: `${hauteur}%` }}
                  className="flex-1 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400"
                />
              ))}
            </div>
          </div>

          {/* Deux lignes de tableau */}
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border p-2">
                <div className="size-5 rounded bg-muted" />
                <div className="h-1.5 flex-1 rounded bg-muted-foreground/30" />
                <div className="h-4 w-10 rounded-full bg-emerald-500/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}