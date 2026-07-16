import useTranslation from '../../../hooks/useTranslation';

export default function PetMedicalHistory() {
  const { t } = useTranslation();

  return (
    <main className="page-container">
      <h1 className="page-title">{t('pets.section.diagnostics.title')}</h1>
      <p className="page-subtitle">
        {t('healthSection.releaseNote')}
      </p>
    </main>
  );
}
