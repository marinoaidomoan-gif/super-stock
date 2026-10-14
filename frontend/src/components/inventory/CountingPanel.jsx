// src/components/inventory/CountingPanel.jsx
//
// Panneau de COMPTAGE d'un inventaire en cours : tableau des produits avec
// quantité théorique, champ de saisie de la quantité réelle, écart calculé
// en direct, et boutons Enregistrer / Valider / Annuler.
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Ban, CheckCheck, Save, Search, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog.jsx'
import EcartValue from '@/components/inventory/EcartValue.jsx'
import InventoryStatusBadge from '@/components/inventory/InventoryStatusBadge.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useAnnulerInventaire,
  useEnregistrerQuantites,
  useInventaire,
  useValiderInventaire,
} from '@/hooks/useInventories.js'
import { messageErreur } from '@/services/api.js'
import { arrondir3, formatDate, formatQuantite, lireQuantite } from '@/lib/format.js'
import { cn } from '@/lib/utils'

// Nombre -> texte pour le champ de saisie : 12.5 devient "12,5" en français.
const versTexte = (nombre, langue) =>
  String(nombre).replace('.', langue?.startsWith('fr') ? ',' : '.')

export default function CountingPanel({ inventaireId }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const langue = i18n.language

  const { data: inventaire, isLoading, isError, refetch } = useInventaire(inventaireId)
  const enregistrer = useEnregistrerQuantites(inventaireId)
  const valider = useValiderInventaire(inventaireId)
  const annuler = useAnnulerInventaire(inventaireId)

  // "saisies" ne contient QUE ce que l'utilisateur a tapé et pas encore
  // enregistré : { idProduit: "texte tapé" }. Pour toutes les autres lignes,
  // on affiche la valeur déjà enregistrée sur le serveur.
  const [saisies, setSaisies] = useState({})
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous') // 'tous' | 'acompter' | 'ecarts'
  const [dialogue, setDialogue] = useState(null) // 'valider' | 'annuler' | null

  const lignes = inventaire?.lignes

  // ANALYSE de chaque ligne (recalculée quand les données ou les saisies
  // changent) : texte affiché, valeur lue, validité, écart en direct.
  const analyse = useMemo(() => {
    return (lignes ?? []).map((ligne) => {
      const modifiee = Object.hasOwn(saisies, ligne.productId)
      const texte = modifiee
        ? saisies[ligne.productId]
        : ligne.quantiteReelle === null
          ? ''
          : versTexte(ligne.quantiteReelle, langue)

      const lue = texte === '' ? null : lireQuantite(texte)
      const invalide = texte !== '' && lue === null

      // Quantité réelle prise en compte : celle tapée si on a modifié la
      // ligne, sinon celle du serveur.
      const reelle = modifiee ? lue : ligne.quantiteReelle
      const ecart = reelle === null ? null : arrondir3(reelle - ligne.quantiteTheorique)

      // "change" : valeur valide ET différente de celle déjà enregistrée.
      const change = modifiee && lue !== null && lue !== ligne.quantiteReelle

      return { ligne, texte, lue, invalide, reelle, ecart, change }
    })
  }, [lignes, saisies, langue])

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !inventaire) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('inventory.loadError')}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  // ----- Chiffres affichés -----
  const total = analyse.length
  const nbComptees = analyse.filter((a) => a.reelle !== null).length
  const nbEcartsDirect = analyse.filter((a) => a.ecart !== null && a.ecart !== 0).length
  const pourcentage = total === 0 ? 0 : Math.round((nbComptees / total) * 100)

  // Lignes à envoyer au serveur, et saisies invalides.
  const aEnregistrer = analyse.filter((a) => a.change)
  const nbInvalides = analyse.filter((a) => a.invalide).length

  // On ne peut valider que si tout est enregistré ET tout est compté
  // (selon le SERVEUR : on valide ce qui est enregistré, pas ce qui est tapé).
  const toutCompteSurServeur = inventaire.resume.nbComptees === inventaire.resume.nbLignes
  const peutValider = aEnregistrer.length === 0 && nbInvalides === 0 && toutCompteSurServeur

  // Pourquoi le bouton "Valider" est bloqué (affiché sous la barre d'outils).
  const raisonBlocage =
    nbInvalides > 0
      ? t('inventory.toolbar.invalidEntries')
      : aEnregistrer.length > 0
        ? t('inventory.toolbar.savePending')
        : !toutCompteSurServeur
          ? t('inventory.toolbar.notAllCounted')
          : null

  // ----- Filtres du tableau -----
  const texteRecherche = recherche.trim().toLowerCase()
  const visibles = analyse.filter((a) => {
    const { nom, reference } = a.ligne.product
    if (
      texteRecherche &&
      !nom.toLowerCase().includes(texteRecherche) &&
      !reference.toLowerCase().includes(texteRecherche)
    ) {
      return false
    }
    if (filtre === 'acompter') return a.reelle === null
    if (filtre === 'ecarts') return a.ecart !== null && a.ecart !== 0
    return true
  })

  // ----- Actions -----
  function modifierSaisie(idProduit, texte) {
    setSaisies((actuelles) => ({ ...actuelles, [idProduit]: texte }))
  }

  // Quand on quitte un champ laissé vide, on revient à la valeur enregistrée.
  function quitterChamp(idProduit, texte) {
    if (texte !== '') return
    setSaisies((actuelles) => {
      const { [idProduit]: _retire, ...reste } = actuelles
      return reste
    })
  }

  // Entrée : passe au champ de la ligne suivante (compter à la chaîne).
  function entreePourSuivant(evenement) {
    if (evenement.key !== 'Enter') return
    evenement.preventDefault()
    evenement.currentTarget
      .closest('tr')
      ?.nextElementSibling?.querySelector('input')
      ?.focus()
  }

  function enregistrerComptage() {
    const envoyees = aEnregistrer.map((a) => ({
      productId: a.ligne.productId,
      quantiteReelle: a.lue,
    }))
    enregistrer.mutate(envoyees, {
      onSuccess: () => {
        setSaisies({}) // tout est enregistré : on repart des valeurs du serveur
        toast.success(t('inventory.toast.saved'))
      },
      onError: (erreur) => toast.error(messageErreur(erreur)),
    })
  }

  function validerInventaire() {
    valider.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('inventory.toast.validated'))
        setDialogue(null)
        // On affiche le résultat : la page de détail de cet inventaire.
        navigate(`/inventaire/${inventaireId}`)
      },
      onError: (erreur) => {
        toast.error(messageErreur(erreur))
        setDialogue(null)
      },
    })
  }

  function annulerInventaire() {
    annuler.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('inventory.toast.cancelled'))
        setDialogue(null)
      },
      onError: (erreur) => {
        toast.error(messageErreur(erreur))
        setDialogue(null)
      },
    })
  }

  const filtres = [
    { id: 'tous', libelle: t('inventory.toolbar.all') },
    { id: 'acompter', libelle: t('inventory.toolbar.toCount') },
    { id: 'ecarts', libelle: t('inventory.toolbar.differences') },
  ]

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5">
      {/* ----- En-tête ----- */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {t('inventory.current.title', { id: inventaire.id })}
            </h2>
            <InventoryStatusBadge statut={inventaire.statut} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('inventory.current.startedBy', {
              nom: inventaire.user?.nom ?? '—',
              date: formatDate(inventaire.dateInventaire, langue),
            })}
          </p>
          {inventaire.commentaire && (
            <p className="text-sm italic text-muted-foreground">« {inventaire.commentaire} »</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogue('annuler')}
            disabled={enregistrer.isPending || valider.isPending}
          >
            <Ban aria-hidden="true" />
            {t('inventory.toolbar.cancel')}
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => setDialogue('valider')}
            disabled={!peutValider || valider.isPending}
          >
            <CheckCheck aria-hidden="true" />
            {t('inventory.toolbar.validate')}
          </Button>
        </div>
      </div>

      {/* ----- Avertissement : mouvements suspendus ----- */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>{t('inventory.current.frozen')}</p>
      </div>

      {/* ----- Progression ----- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium tabular-nums">
            {t('inventory.current.progress', { done: nbComptees, total })}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {t('inventory.current.differences', { count: nbEcartsDirect })}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          {/* La barre se remplit en douceur quand le pourcentage change. */}
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={false}
            animate={{ width: `${pourcentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ----- Barre d'outils : recherche, filtres, enregistrement ----- */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t('inventory.toolbar.search')}
            className="pl-9"
            aria-label={t('inventory.toolbar.search')}
          />
        </div>

        <div className="flex gap-1" role="group" aria-label={t('inventory.toolbar.filters')}>
          {filtres.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filtre === f.id ? 'default' : 'outline'}
              onClick={() => setFiltre(f.id)}
              aria-pressed={filtre === f.id}
            >
              {f.libelle}
            </Button>
          ))}
        </div>

        <Button
          onClick={enregistrerComptage}
          disabled={aEnregistrer.length === 0 || nbInvalides > 0 || enregistrer.isPending}
          className="bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Save aria-hidden="true" />
          {enregistrer.isPending
            ? t('common.pleaseWait')
            : t('inventory.toolbar.save', { count: aEnregistrer.length })}
        </Button>
      </div>

      {raisonBlocage && <p className="text-sm text-muted-foreground">{raisonBlocage}</p>}

      {/* ----- Tableau de comptage ----- */}
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
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t('inventory.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((a) => (
                <TableRow key={a.ligne.id} className={cn(a.change && 'bg-emerald-500/5')}>
                  <TableCell>
                    <div className="font-medium">{a.ligne.product.nom}</div>
                    <div className="text-xs text-muted-foreground">{a.ligne.product.reference}</div>
                  </TableCell>
                  <TableCell>{t(`inventory.units.${a.ligne.product.unite}`)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantite(a.ligne.quantiteTheorique, langue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* type="text" + inputMode="decimal" : clavier numérique sur
                        mobile, et la virgule est acceptée (type="number"
                        refuse la virgule selon la langue du navigateur). */}
                    <Input
                      value={a.texte}
                      inputMode="decimal"
                      autoComplete="off"
                      aria-invalid={a.invalide}
                      aria-label={t('inventory.table.countedFor', { nom: a.ligne.product.nom })}
                      onChange={(e) => modifierSaisie(a.ligne.productId, e.target.value)}
                      onBlur={(e) => quitterChamp(a.ligne.productId, e.target.value)}
                      onKeyDown={entreePourSuivant}
                      className="ml-auto h-8 w-28 text-right tabular-nums"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <EcartValue ecart={a.ecart} langue={langue} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ----- Confirmations ----- */}
      <ConfirmDialog
        open={dialogue === 'valider'}
        onOpenChange={(ouvert) => !ouvert && setDialogue(null)}
        title={t('inventory.confirmValidate.title')}
        description={t('inventory.confirmValidate.text', {
          count: inventaire.resume.nbEcarts,
        })}
        confirmLabel={t('inventory.confirmValidate.confirm')}
        pending={valider.isPending}
        onConfirm={validerInventaire}
      />
      <ConfirmDialog
        open={dialogue === 'annuler'}
        onOpenChange={(ouvert) => !ouvert && setDialogue(null)}
        title={t('inventory.confirmCancel.title')}
        description={t('inventory.confirmCancel.text')}
        confirmLabel={t('inventory.confirmCancel.confirm')}
        destructive
        pending={annuler.isPending}
        onConfirm={annulerInventaire}
      />
    </div>
  )
}