import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
import AuthSplitLayout from '@/components/auth/AuthSplitLayout'
import LoginForm from '@/components/auth/LoginForm'
import PageLoader from '@/components/common/PageLoader'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'

export default function Login() {
  const { t } = useTranslation()
  const { user, isLoading, login } = useAuth()
  const location = useLocation()

  const mutation = useMutation({ mutationFn: login })

  if (isLoading) return <PageLoader />
  if (user)
    return (
      <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />
    )

  // Message d'erreur traduit à partir du code HTTP.
  const error = mutation.isError
    ? getErrorMessage(mutation.error, t, {
        401: 'auth.invalidCredentials',
        403: 'auth.accountDisabled',
      })
    : null

  return (
    <AuthSplitLayout>
      <LoginForm
        onLogin={mutation.mutate}
        isPending={mutation.isPending}
        error={error}
      />
    </AuthSplitLayout>
  )
}