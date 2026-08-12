import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiBeaker,
  HiCalendar,
  HiChevronDown,
  HiClipboardList,
  HiHeart,
  HiLightBulb,
  HiPlus,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi';

import AddPetModal from '../../../components/modals/AddPetModal';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import { ROUTES } from '../../../constants/routes';
import { usePetsList } from '../../../hooks/usePets';
import useTranslation from '../../../hooks/useTranslation';
import useAuthStore from '../../../stores/useAuthStore';
import petsHeroImage from '../../../assets/images/all-pets.png';

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

export default function PetList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [isPetProfileOpen, setIsPetProfileOpen] = useState(false);
  const petProfileRef = useRef(null);
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: pets = [], isLoading, isError, error } = usePetsList();

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0],
    [pets, selectedPetId],
  );

  const displayName = user?.full_name?.split(' ')[0]
    ?? user?.name?.split(' ')[0]
    ?? t('pets.there');

  const handleSelectPet = (petId) => {
    setSelectedPetId(petId);
    setIsPetProfileOpen((isOpen) => (selectedPet?.id === petId ? !isOpen : true));
  };

  if (isLoading) return <Loader label={t('pets.loading')} />;

  return (
    <main className="pets-screen page-container">
      <section className="pets-hero" id="about">
        <div>
          <p className="pets-section-title">{t('pets.title')}</p>
          <h1>{t('pets.greeting')} {displayName},</h1>
          <p>{t('pets.heroSubtitle')}</p>
        </div>
        <img src={petsHeroImage} alt="" className="pets-hero-image" />
      </section>

      {isError && (
        <p className="status-error">
          {error?.response?.status === 403 ? t('pets.forbiddenError') : t('pets.loadError')}
        </p>
      )}

      {!isError && (
        <>
          <section className="pet-selector-bar" aria-label={t('pets.registeredPets')} ref={petProfileRef}>
            {pets.length === 0 && (
              <article className="pet-selector-card pet-selector-card-empty">
                <span>{DEFAULT_PET_ICON}</span>
                <p>{t('pets.noPets')}</p>
              </article>
            )}

            {pets.map((pet) => {
              const isSelected = selectedPet?.id === pet.id;
              return (
                <button
                  key={pet.id}
                  type="button"
                  className={isSelected ? 'pet-selector-card pet-selector-card-active' : 'pet-selector-card'}
                  onClick={() => handleSelectPet(pet.id)}
                >
                  {pet.photo_url ? (
                    <img className="pet-selector-photo" src={pet.photo_url} alt={pet.name} />
                  ) : (
                    <span className="pet-selector-icon">
                      {SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON}
                    </span>
                  )}
                  <span className="pet-selector-name">{pet.name}</span>
                  {isSelected && <HiChevronDown aria-hidden="true" />}
                </button>
              );
            })}

            {selectedPet && isPetProfileOpen && (
              <div className="pet-mini-profile" role="dialog" aria-label={`${selectedPet.name} ${t('pets.profileSummary')}`}>
                <div className="pet-mini-profile-header">
                  {selectedPet.photo_url ? (
                    <img src={selectedPet.photo_url} alt={selectedPet.name} />
                  ) : (
                    <span>{SPECIES_ICON[selectedPet.species] ?? DEFAULT_PET_ICON}</span>
                  )}
                  <div>
                    <h2>{selectedPet.name}</h2>
                    <p>{t(`petSpecies.${selectedPet.species}`)} - {t(`petSex.${selectedPet.sex}`)}</p>
                  </div>
                </div>
                <dl className="pet-mini-profile-list">
                  <div>
                    <dt>{t('pets.birthDate')}</dt>
                    <dd>{selectedPet.birth_date}</dd>
                  </div>
                  <div>
                    <dt>{t('pets.weight')}</dt>
                    <dd>{selectedPet.weight_kg} kg</dd>
                  </div>
                  <div>
                    <dt>{t('pets.primaryBreed')}</dt>
                    <dd>{selectedPet.breed_primary}</dd>
                  </div>
                  {selectedPet.breed_secondary && (
                    <div>
                      <dt>{t('pets.secondaryBreed')}</dt>
                      <dd>{selectedPet.breed_secondary}</dd>
                    </div>
                  )}
                </dl>
                <Link className="pet-mini-profile-action" to={`/client/pets/${selectedPet.id}`}>
                  {t('pets.viewFullProfile')}
                </Link>
              </div>
            )}

            {[0, 1, 2].map((slot) => (
              <button
                key={slot}
                type="button"
                className="pet-selector-add"
                onClick={() => setIsAddModalOpen(true)}
              >
                <HiPlus aria-hidden="true" />
                <span>{t('pets.addPet')}</span>
              </button>
            ))}
          </section>

          {pets.length === 0 ? (
            <div className="empty-state">
              <span className="mb-4 text-5xl">{DEFAULT_PET_ICON}</span>
              <h2 className="empty-state-title">{t('pets.noPets')}</h2>
              <p className="empty-state-description">
                {t('pets.emptyDescription')}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <HiPlus />
                {t('pets.addFirstPet')}
              </Button>
            </div>
          ) : (
            <section className="health-card-grid" id="services" aria-label={`${selectedPet.name} ${t('pets.healthSections')}`}>
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
                      <span className="health-section-action">{t('pets.details')}</span>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </>
      )}

      <section className="pets-contact-strip" id="contact">
        {t('pets.contactStrip')}
      </section>

      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </main>
  );
}
