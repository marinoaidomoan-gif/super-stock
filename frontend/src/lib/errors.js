const STATUS_KEYS = {
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  409: 'errors.conflict',
  429: 'errors.tooManyRequests',
}

// overrides : permet à une page de remplacer le message d'un code précis,
// ex. getErrorMessage(error, t, { 401: 'auth.invalidCredentials' })
export function getErrorMessage(error, t, overrides = {}) {
  if (!error?.response) return t('errors.network')

  const { status, data } = error.response

  if (overrides[status]) return t(overrides[status])

  if (status === 400) {
    // NestJS renvoie "message" sous forme de tableau pour les erreurs de validation.
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message
    return message || t('errors.validation')
  }

  return t(STATUS_KEYS[status] ?? 'errors.server')
}