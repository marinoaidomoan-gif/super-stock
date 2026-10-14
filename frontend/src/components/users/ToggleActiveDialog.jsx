import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useToggleUserActive } from '@/hooks/useUsers'
import { getErrorMessage } from '@/lib/errors'

export default function ToggleActiveDialog({ open, onOpenChange, user }) {
  const { t } = useTranslation()
  const mutation = useToggleUserActive()

  const handleConfirm = () => {
    if (!user) return
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(
          t(user.actif ? 'users.toast.deactivated' : 'users.toast.reactivated'),
        )
        onOpenChange(false)
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    })
  }

  if (!user) return null

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(user.actif ? 'users.deactivate.title' : 'users.deactivate.reactivateTitle')}
      description={t(
        user.actif ? 'users.deactivate.description' : 'users.deactivate.reactivateDescription',
        { name: user.nom },
      )}
      confirmLabel={t(user.actif ? 'users.deactivate.confirm' : 'users.deactivate.reactivateConfirm')}
      onConfirm={handleConfirm}
      isPending={mutation.isPending}
    />
  )
}