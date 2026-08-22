import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Loader from '../../../components/common/Loader';
import { ROUTES } from '../../../constants/routes';
import { usePetCareRecommendations } from '../../../hooks/usePetCareRecommendations';
import useTranslation from '../../../hooks/useTranslation';

function formatAge(data, t) {
  return `${data.age_years} ${t('clientAi.years')}, ${data.age_months} ${t('clientAi.months')}, ${data.age_days} ${t('clientAi.days')}`;
}

function RecommendationList({ title, items, emptyText }) {
  return (
    <div className="breed-risk-section">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <ul className="breed-risk-recommendations">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PetCareRecommendations() {
  const [searchParams] = useSearchParams();
  const petId = searchParams.get('petId');
  const { language, t } = useTranslation();
  const [selectedRecommendationId, setSelectedRecommendationId] = useState('');
  const {
    data,
    isLoading,
    isError,
    refresh,
    isRefreshing,
    refreshError,
  } = usePetCareRecommendations(petId, language);

  const history = useMemo(() => data?.history ?? [], [data]);
  const activeRecommendation = useMemo(() => {
    if (!history.length) {
      return data;
    }
    return history.find((item) => item.recommendation_id === selectedRecommendationId) ?? history[0];
  }, [data, history, selectedRecommendationId]);

  useEffect(() => {
    if (history.length) {
      setSelectedRecommendationId(history[0].recommendation_id);
    }
  }, [history]);

  if (!petId) {
    return (
      <section className="health-section-page breed-risk-panel">
        <Link className="back-link" to={ROUTES.CLIENT.PETS}>
          {t('clientAi.back')}
        </Link>
        <h1>{t('clientAi.selectPetTitle')}</h1>
        <p>{t('clientAi.selectPetDescription')}</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="health-section-page breed-risk-panel">
        <h1>{t('clientAi.title')}</h1>
        <Loader label={t('clientAi.loading')} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="health-section-page breed-risk-panel">
        <h1>{t('clientAi.title')}</h1>
        <p className="status-error">{t('clientAi.error')}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="health-section-page breed-risk-panel">
        <h1>{t('clientAi.title')}</h1>
        <p>{t('clientAi.empty')}</p>
      </section>
    );
  }

  const nutrition = activeRecommendation?.nutrition_recommendations ?? [];
  const activity = activeRecommendation?.activity_recommendations ?? [];
  const preventive = activeRecommendation?.preventive_recommendations ?? [];

  return (
    <section className="health-section-page breed-risk-panel">
      <Link className="back-link" to={`${ROUTES.CLIENT.DASHBOARD}?petId=${petId}`}>
        {t('clientAi.back')}
      </Link>

      <div className="breed-risk-header">
        <div>
          <h1>{t('clientAi.title')}</h1>
          <p className="breed-risk-subtitle">{t('clientAi.subtitle')}</p>
        </div>
        <button
          type="button"
          className="breed-risk-refresh"
          onClick={() => refresh()}
          disabled={isRefreshing}
        >
          {isRefreshing ? t('clientAi.refreshing') : t('clientAi.refresh')}
        </button>
      </div>
      {refreshError && (
        <p className="status-error">{t('clientAi.refreshError')}</p>
      )}

      {history.length > 0 && (
        <div className="breed-risk-history">
          <label htmlFor="pet-care-history">{t('clientAi.historyLabel')}</label>
          <select
            id="pet-care-history"
            value={selectedRecommendationId}
            onChange={(event) => setSelectedRecommendationId(event.target.value)}
          >
            {history.map((item, index) => (
              <option key={item.recommendation_id} value={item.recommendation_id}>
                {index === 0 ? t('clientAi.historyLatest') : t('clientAi.historyPrevious')} - {item.generated_at || item.recommendation_id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="breed-risk-context">
        <h3>{t('clientAi.contextTitle')}</h3>
        <dl>
          <div><dt>{t('clientAi.pet')}</dt><dd>{data.name}</dd></div>
          <div><dt>{t('clientAi.species')}</dt><dd>{data.species}</dd></div>
          <div><dt>{t('clientAi.primaryBreed')}</dt><dd>{data.breed_primary}</dd></div>
          <div><dt>{t('clientAi.secondaryBreed')}</dt><dd>{data.breed_secondary || '--'}</dd></div>
          <div><dt>{t('clientAi.age')}</dt><dd>{formatAge(data, t)}</dd></div>
        </dl>
      </div>

      <RecommendationList
        title={t('clientAi.nutritionTitle')}
        items={nutrition}
        emptyText={t('clientAi.empty')}
      />
      <RecommendationList
        title={t('clientAi.activityTitle')}
        items={activity}
        emptyText={t('clientAi.empty')}
      />
      <RecommendationList
        title={t('clientAi.preventionTitle')}
        items={preventive}
        emptyText={t('clientAi.empty')}
      />

      <aside className="breed-risk-disclaimer">
        <strong>{t('clientAi.warningTitle')}</strong>
        <p>{activeRecommendation?.non_diagnostic_warning}</p>
      </aside>
    </section>
  );
}
