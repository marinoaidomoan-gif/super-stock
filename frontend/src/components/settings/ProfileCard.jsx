import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import UserAvatar from '@/components/common/UserAvatar'
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
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { getErrorMessage } from '@/lib/errors'

export default function ProfileCard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const mutation = useUpdateProfile()
  const [nom, setNom] = useState(user?.nom ?? '')

  // Si l'utilisateur change (login), on synchronise le champ.
  useEffect(() => {
    setNom(user?.nom ?? '')
  }, [user?.nom])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = nom.trim()
    if (!trimmed) {
      toast.error(t('settings.profile.nameRequired'))
      return
    }
    if (trimmed === user.nom) {
      toast.info(t('settings.profile.noChange'))
      return
    }
    mutation.mutate(
      { nom: trimmed },
      {
        onSuccess: () => toast.success(t('settings.profile.success')),
        onError: (error) => toast.error(getErrorMessage(error, t)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.profile.title')}</CardTitle>
        <CardDescription>{t('settings.profile.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + nom + rôle */}
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.nom ?? user?.email ?? ''} className="size-12 text-base" />
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.nom ?? user?.email}</p>
              <p className="text-xs text-muted-foreground">{t(`roles.${user?.role}`)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-nom">{t('settings.profile.name')}</Label>
            <Input
              id="profile-nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              maxLength={150}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">{t('settings.profile.email')}</Label>
            <Input id="profile-email" value={user?.email ?? ''} disabled />
            <p className="text-xs text-muted-foreground">
              {t('settings.profile.emailHint')}
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {t('settings.profile.save')}
        </Button>
      </CardFooter>
    </Card>
  )
}