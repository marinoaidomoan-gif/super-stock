import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProducts } from '@/hooks/useProducts'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

// value : produit sélectionné (objet) ou null. onChange reçoit le produit (ou null si allowClear).
export default function ProductCombobox({
  id,
  value,
  onChange,
  placeholder,
  allowClear = false,
  clearLabel,
  invalid = false,
  describedBy,
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const search = useDebouncedValue(searchText, 250).trim()

  // Produits actifs seulement (le serveur refuse les mouvements sur un produit désactivé).
  // Chargé uniquement quand la liste est ouverte.
  const { data, isFetching } = useProducts(
    { page: 1, limit: 20, actif: true, recherche: search || undefined },
    { enabled: open },
  )
  const products = data?.data ?? []

  const select = (product) => {
    onChange(product)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground')}
        >
          <span className="truncate">{value ? `${value.nom} (${value.reference})` : placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        {/* shouldFilter=false : le filtrage est fait par le serveur (recherche). */}
        <Command shouldFilter={false}>
          <CommandInput
            value={searchText}
            onValueChange={setSearchText}
            placeholder={t('movements.form.productSearch')}
          />
          <CommandList>
            <CommandEmpty>{isFetching ? t('common.loading') : t('movements.form.productEmpty')}</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem value="all" onSelect={() => select(null)}>
                  <Check className={cn('size-4', value ? 'opacity-0' : 'opacity-100')} aria-hidden="true" />
                  {clearLabel}
                </CommandItem>
              )}
              {products.map((product) => (
                <CommandItem key={product.id} value={String(product.id)} onSelect={() => select(product)}>
                  <Check
                    className={cn('size-4', value?.id === product.id ? 'opacity-100' : 'opacity-0')}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{product.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.reference} · {formatNumber(product.quantiteStock, locale)}{' '}
                      {t(`units.${product.unite}`)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}