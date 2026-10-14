import { useTranslation } from 'react-i18next'
import StockBadge from '@/components/common/StockBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDateTime, formatNumber } from '@/lib/format'

function Item({ label, children }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </>
  )
}

export default function ProductDetailsDialog({ open, onOpenChange, product }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('products.details.title')}</DialogTitle>
          <DialogDescription>{product?.nom}</DialogDescription>
        </DialogHeader>

        {product && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <Item label={t('products.details.reference')}>
              <span className="font-mono">{product.reference}</span>
            </Item>
            <Item label={t('products.details.category')}>{product.category?.nom}</Item>
            <Item label={t('products.details.unit')}>{t(`units.${product.unite}`)}</Item>
            <Item label={t('products.details.quantity')}>
              <span className="tabular-nums">{formatNumber(product.quantiteStock, locale)}</span>
            </Item>
            <Item label={t('products.details.threshold')}>
              <span className="tabular-nums">{formatNumber(product.seuilAlerte, locale)}</span>
            </Item>
            <Item label={t('products.details.status')}>
              <StockBadge product={product} />
            </Item>
            <Item label={t('products.details.description')}>
              <span className="whitespace-pre-wrap font-normal">
                {product.description || t('products.details.noDescription')}
              </span>
            </Item>
            <Item label={t('products.details.createdAt')}>
              {formatDateTime(product.createdAt, locale)}
            </Item>
            <Item label={t('products.details.updatedAt')}>
              {formatDateTime(product.updatedAt, locale)}
            </Item>
          </dl>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('products.details.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}