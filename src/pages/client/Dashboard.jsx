import { Link, useSearchParams } from 'react-router-dom';
import {
  HiBeaker,
  HiCalendar,
  HiClipboardList,
  HiHeart,
  HiLightBulb,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi';

import Loader from '../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import { ROUTES } from '../../constants/routes';
import { usePetsList } from '../../hooks/usePets';
import useTranslation from '../../hooks/useTranslation';

function withPetId(route, petId) {
  return petId ? `${route}?petId=${encodeURIComponent(petId)}` : route;
}

const HEALTH_SECTIONS = [
  {
    titleKey: 'pets.section.appointments.title',
    descriptionKey: 'pets.section.appointments.description',
    route: ROUTES.CLIENT.APPOINTMENTS,
    icon: HiCalendar,
  },
  {
    titleKey: 'pets.section.vaccines.title',
    descriptionKey: 'pets.section.vaccines.description',
    route: ROUTES.CLIENT.VACCINES,
    icon: HiShieldCheck,
  },
  {
    titleKey: 'pets.section.medications.title',
    descriptionKey: 'pets.section.medications.description',
    route: ROUTES.CLIENT.MEDICATIONS,
    icon: HiSparkles,
  },
  {
    titleKey: 'pets.section.diagnostics.title',
    descriptionKey: 'pets.section.diagnostics.description',
    route: ROUTES.CLIENT.DIAGNOSTICS,
    icon: HiClipboardList,
  },
  {
    titleKey: 'pets.section.allergies.title',
    descriptionKey: 'pets.section.allergies.description',
    route: ROUTES.CLIENT.ALLERGIES,
    icon: HiHeart,
  },
  {
    titleKey: 'pets.section.labResults.title',
    descriptionKey: 'pets.section.labResults.description',
    route: ROUTES.CLIENT.LAB_RESULTS,
    icon: HiBeaker,
  },
  {
    titleKey: 'pets.section.recommendations.title',
    descriptionKey: 'pets.section.recommendations.description',
    route: ROUTES.CLIENT.RECOMMENDATIONS,
    icon: HiLightBulb,
  },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { data: pets = [], isLoading, isError } = usePetsList();
  const selectedPetId = searchParams.get('petId');
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];

  return (
    <main className="pet-dashboard page-container">
      {isLoading && <Loader label={t('clientDashboard.loading')} />}

      {!isLoading && isError && (
        <p className="status-error">
          {t('clientDashboard.error')}
        </p>
      )}

      {!isLoading && !isError && !selectedPet && (
        <section className="empty-state">
          <span className="mb-4 text-5xl">{DEFAULT_PET_ICON}</span>
          <h1 className="empty-state-title">{t('clientDashboard.noPet')}</h1>
          <p className="empty-state-description">
            {t('clientDashboard.noPetDescription')}
          </p>
          <Link className="dashboard-detail-button" to={ROUTES.CLIENT.PETS}>
            {t('clientDashboard.openPets')}
          </Link>
        </section>
      )}

      {!isLoading && !isError && selectedPet && (
        <>
          <header className="pet-dashboard-header">
            <Link className="pet-dashboard-back" to={ROUTES.CLIENT.PETS}>
              {t('clientDashboard.back')}
            </Link>
            <div className="pet-dashboard-identity">
              <span>{SPECIES_ICON[selectedPet.species] ?? DEFAULT_PET_ICON}</span>
              <div>
                <p className="page-eyebrow">{t('clientDashboard.eyebrow')}</p>
                <h1>{selectedPet.name}</h1>
                <p>
                  {t(`petSpecies.${selectedPet.species}`)} - {t(`petSex.${selectedPet.sex}`)} - {selectedPet.weight_kg} kg
                </p>
              </div>
            </div>
          </header>

          <section className="health-card-grid" aria-label={`${selectedPet.name} health sections`}>
            {HEALTH_SECTIONS.map((section) => {
              const Icon = section.icon;
              const title = t(section.titleKey);
              return (
                <Link
                  key={section.titleKey}
                  className="health-section-card"
                  to={withPetId(section.route, selectedPet.id)}
                >
                  <span className="health-section-image">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <h2>{title}</h2>
                    <p>{t(section.descriptionKey)}</p>
                    <span className="health-section-action">{t('clientDashboard.details')}</span>
                  </div>
                </Link>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
