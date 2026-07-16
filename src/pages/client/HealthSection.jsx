import { Link, useSearchParams } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import useTranslation from '../../hooks/useTranslation';

export default function HealthSection({ title, description }) {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const petId = searchParams.get('petId');
  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>
      <section className="health-section-page">
        <p className="page-eyebrow">Animal Health</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </section>
    </main>
  );
}
