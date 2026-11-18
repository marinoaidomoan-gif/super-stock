// src/components/pwa/InstallButton.jsx
//
// Bouton "Installer l'application". Il n'apparaît QUE si l'installation est
// possible : il disparaît tout seul une fois l'application installée, ou dans
// un navigateur qui ne sait pas installer (Firefox sur ordinateur, par exemple).
import { useState } from 'react'
import { Download, Share } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useInstallPrompt } from '@/hooks/useInstallPrompt.js'

export default function InstallButton({ className, variant = 'outline', size = 'sm' }) {
  const { t } = useTranslation()
  const { peutInstaller, aideIOS, installer } = useInstallPrompt()
  const [aideOuverte, setAideOuverte] = useState(false)

  // Rien à proposer : on n'affiche rien.
  // (Les hooks ci-dessus sont appelés AVANT ce "return", comme React l'exige.)
  if (!peutInstaller && !aideIOS) return null

  async function cliquer() {
    if (peutInstaller) {
      // Chrome, Edge, Android : fenêtre d'installation du navigateur.
      const resultat = await installer()
      if (resultat === 'accepted') toast.success(t('pwa.installed'))
      return
    }
    // iPhone / iPad : on explique la manipulation à faire dans Safari.
    setAideOuverte(true)
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={cliquer}>
        <Download aria-hidden="true" />
        {t('pwa.install')}
      </Button>

      {aideIOS && (
        <Dialog open={aideOuverte} onOpenChange={setAideOuverte}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('pwa.iosTitle')}</DialogTitle>
              <DialogDescription>{t('pwa.iosIntro')}</DialogDescription>
            </DialogHeader>

            <ol className="list-decimal space-y-3 pl-5 text-sm">
              <li>
                {t('pwa.iosStep1')}{' '}
                <Share className="inline size-4 align-text-bottom" aria-hidden="true" />
              </li>
              <li>{t('pwa.iosStep2')}</li>
              <li>{t('pwa.iosStep3')}</li>
            </ol>

            <DialogFooter>
              <Button onClick={() => setAideOuverte(false)}>{t('pwa.close')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}