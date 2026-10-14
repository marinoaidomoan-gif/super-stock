// src/pages/private/InventoryDetail.jsx
//
// Page /inventaire/:id : le détail d'un inventaire (validé ou en cours), avec
// un bouton Imprimer. Les classes "print:hidden" cachent les boutons à
// l'impression : seul le contenu du rapport est imprimé.
// (Pense à ajouter aussi "print:hidden" à ta sidebar et à ton en-tête.)
import { useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EcartValue from '@/components/inventory/EcartValue.jsx'
import InventoryStatusBadge from '@/components/inventory/InventoryStatusBadge.jsx'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useInventaire } from '@/hooks/useInventories.js'
import { formatDate, formatQuantite } from '@/lib/format.js'

// Petite carte de chiffre (produits, comptés, écarts).
function Chiffre({ libelle, valeur }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{libelle}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{valeur}</p>
    </div>
  )
}

export default function InventoryDetail() {
  const { t, i18n } = useTranslation()
  const langue = i18n.language
  const { id } = useParams()
  const inventaireId = Number(id)

  const { data: inventaire, isLoading, isError } = useInventaire(inventaireId)
  const [ecartsSeulement, setEcartsSeulement] = useState(false)

  const lienRetour = (
    <Button asChild variant="ghost" size="sm" className="print:hidden">
      <Link to="/inventaire">
        <ArrowLeft aria-hidden="true" />
        {t('inventory.detail.back')}
      </Link>
    </Button>
  )

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  // Identifiant invalide ("abc"), inventaire inexistant (404) ou erreur réseau.
  if (isError || !inventaire) {
    return (
      <div className="space-y-4">
        {lienRetour}
        <p className="text-muted-foreground">{t('inventory.detail.notFound')}</p>
      </div>
    )
  }

  const lignes = ecartsSeulement
    ? inventaire.lignes.filter((l) => l.ecart !== null && l.ecart !== 0)
    : inventaire.lignes

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        {lienRetour}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          {t('inventory.detail.print')}
        </Button>
      </div>

      {/* ----- En-tête du rapport ----- */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('inventory.detail.title', { id: inventaire.id })}
          </h1>
          <InventoryStatusBadge statut={inventaire.statut} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('inventory.current.startedBy', {
            nom: inventaire.user?.nom ?? '—',
            date: formatDate(inventaire.dateInventaire, langue),
          })}
        </p>
        {inventaire.dateValidation && (
          <p className="text-sm text-muted-foreground">
            {t('inventory.detail.validatedOn', {
              date: formatDate(inventaire.dateValidation, langue),
            })}
          </p>
        )}
        {inventaire.commentaire && (
          <p className="text-sm italic text-muted-foreground">« {inventaire.commentaire} »</p>
        )}

        {/* Inventaire encore en cours : on propose de reprendre le comptage. */}
        {inventaire.statut === 'EN_COURS' && (
          <Button asChild size="sm" className="print:hidden">
            <Link to="/inventaire">{t('inventory.detail.continueCounting')}</Link>
          </Button>
        )}
      </header>

      {/* ----- Chiffres clés ----- */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Chiffre libelle={t('inventory.detail.summaryProducts')} valeur={inventaire.resume.nbLignes} />
        <Chiffre libelle={t('inventory.detail.summaryCounted')} valeur={inventaire.resume.nbComptees} />
        <Chiffre libelle={t('inventory.detail.summaryDifferences')} valeur={inventaire.resume.nbEcarts} />
      </div>

      {/* ----- Filtre ----- */}
      <div className="flex gap-1 print:hidden" role="group" aria-label={t('inventory.toolbar.filters')}>
        <Button
          size="sm"
          variant={!ecartsSeulement ? 'default' : 'outline'}
          onClick={() => setEcartsSeulement(false)}
          aria-pressed={!ecartsSeulement}
        >
          {t('inventory.toolbar.all')}
        </Button>
        <Button
          size="sm"
          variant={ecartsSeulement ? 'default' : 'outline'}
          onClick={() => setEcartsSeulement(true)}
          aria-pressed={ecartsSeulement}
        >
          {t('inventory.detail.onlyDifferences')}
        </Button>
      </div>

      {/* ----- Lignes ----- */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory.table.product')}</TableHead>
              <TableHead>{t('inventory.table.unit')}</TableHead>
              <TableHead className="text-right">{t('inventory.table.theoretical')}</TableHead>
              <TableHead className="text-right">{t('inventory.table.counted')}</TableHead>
              <TableHead className="text-right">{t('inventory.table.difference')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t('inventory.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              lignes.map((ligne) => (
                <TableRow key={ligne.id}>
                  <TableCell>
                    <div className="font-medium">{ligne.product.nom}</div>
                    <div className="text-xs text-muted-foreground">{ligne.product.reference}</div>
                  </TableCell>
                  <TableCell>{t(`inventory.units.${ligne.product.unite}`)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantite(ligne.quantiteTheorique, langue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantite(ligne.quantiteReelle, langue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <EcartValue ecart={ligne.ecart} langue={langue} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}