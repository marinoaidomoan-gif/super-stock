import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Pas encore de backend : on stocke localement en attendant.
const STORAGE_KEY = 'superstock-company-name'

export default function CompanyCard() {
  const { t } = useTranslation()
  const [nom, setNom] = useState(() => localStorage.getItem(STORAGE_KEY) ?? 'SuperStock')
  const [saving, setSaving] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = nom.trim()
    if (!trimmed) {
      toast.error(t('settings.company.nameRequired'))
      return
    }
    setSaving(true)
    localStorage.setItem(STORAGE_KEY, trimmed)
    setTimeout(() => {
      setSaving(false)
      toast.success(t('settings.company.success'))
    }, 300)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.company.title')}</CardTitle>
        <CardDescription>{t('settings.company.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-nom">{t('settings.company.name')}</Label>
            <Input
              id="company-nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              maxLength={150}
              disabled={saving}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button type="submit" onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {t('settings.company.save')}
        </Button>
      </CardFooter>
    </Card>
  )
}