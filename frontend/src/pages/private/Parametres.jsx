import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/common/PageHeader'
import CompanyCard from '@/components/settings/CompanyCard'
import PreferencesCard from '@/components/settings/PreferencesCard'
import ProfileCard from '@/components/settings/ProfileCard'
import SecurityCard from '@/components/settings/SecurityCard'

export default function Parametres() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        title={t('settings.title')}
        description={t('settings.subtitle')}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCard />
        <PreferencesCard />
        <SecurityCard />
        <CompanyCard />
      </div>
    </motion.div>
  )
}