import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function PreferencesCard() {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'
  const currentLang = i18n.resolvedLanguage ?? 'fr'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.preferences.title')}</CardTitle>
        <CardDescription>{t('settings.preferences.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Langue */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="pref-lang">{t('settings.preferences.language')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('settings.preferences.languageHint')}
            </p>
          </div>
          <Select
            value={currentLang}
            onValueChange={(value) => i18n.changeLanguage(value)}
          >
            <SelectTrigger id="pref-lang" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mode sombre */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="pref-theme">{t('settings.preferences.darkMode')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('settings.preferences.darkModeHint')}
            </p>
          </div>
          <Switch
            id="pref-theme"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          {t('settings.preferences.autoSave')}
        </div>
      </CardContent>
    </Card>
  )
}