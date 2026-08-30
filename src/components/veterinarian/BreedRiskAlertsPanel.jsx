import { useEffect, useMemo, useState } from 'react';

import Loader from '../common/Loader';
import { useBreedRiskAlerts } from '../../hooks/useBreedRiskAlerts';
import useTranslation from '../../hooks/useTranslation';

function formatAge(data, t) {
  return `${data.age_years} ${t('aiRisk.years')}, ${data.age_months} ${t('aiRisk.months')}, ${data.age_days} ${t('aiRisk.days')}`;
}

export default function BreedRiskAlertsPanel({ petId, language }) {
  const { t } = useTranslation();
  const [selectedRecommendationId, setSelectedRecommendationId] = useState('');
  const {
    data,
    isLoading,
    isError,
    refresh,
    isRefreshing,
    refreshError,
  } = useBreedRiskAlerts(petId, language);

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

  if (isLoading) {
    return (
      <section className="vet-current-appointment breed-risk-panel">
        <h2>{t('aiRisk.title')}</h2>
        <Loader label={t('aiRisk.loading')} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="vet-current-appointment breed-risk-panel">
        <h2>{t('aiRisk.title')}</h2>
        <p className="status-error">{t('aiRisk.error')}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="vet-current-appointment breed-risk-panel">
        <h2>{t('aiRisk.title')}</h2>
        <p>{t('aiRisk.empty')}</p>
      </section>
    );
  }

  const alerts = activeRecommendation?.alerts ?? [];
  const recommendations = activeRecommendation?.preventive_recommendations ?? [];

  return (
    <section className="vet-current-appointment breed-risk-panel">
      <div className="breed-risk-header">
        <div>
          <h2>{t('aiRisk.title')}</h2>
          <p className="breed-risk-subtitle">{t('aiRisk.subtitle')}</p>
        </div>
        <button
          type="button"
          className="breed-risk-refresh"
          onClick={() => refresh()}
          disabled={isRefreshing}
        >
          {isRefreshing ? t('aiRisk.refreshing') : t('aiRisk.refresh')}
        </button>
      </div>
      {refreshError && (
        <p className="status-error">{t('aiRisk.refreshError')}</p>
      )}

      {history.length > 0 && (
        <div className="breed-risk-history">
          <label htmlFor="breed-risk-history">{t('aiRisk.historyLabel')}</label>
          <select
            id="breed-risk-history"
            value={selectedRecommendationId}
            onChange={(event) => setSelectedRecommendationId(event.target.value)}
          >
            {history.map((item, index) => (
              <option key={item.recommendation_id} value={item.recommendation_id}>
                {index === 0 ? t('aiRisk.historyLatest') : t('aiRisk.historyPrevious')} - {item.generated_at || item.recommendation_id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="breed-risk-context">
        <h3>{t('aiRisk.contextTitle')}</h3>
        <dl>
          <div><dt>{t('aiRisk.pet')}</dt><dd>{data.name}</dd></div>
          <div><dt>{t('aiRisk.species')}</dt><dd>{data.species}</dd></div>
          <div><dt>{t('aiRisk.primaryBreed')}</dt><dd>{data.breed_primary}</dd></div>
          <div><dt>{t('aiRisk.secondaryBreed')}</dt><dd>{data.breed_secondary || '--'}</dd></div>
          <div><dt>{t('aiRisk.age')}</dt><dd>{formatAge(data, t)}</dd></div>
        </dl>
      </div>

      <div className="breed-risk-section">
        <h3>{t('aiRisk.alertsTitle')}</h3>
        {alerts.length === 0 ? (
          <p>{t('aiRisk.empty')}</p>
        ) : (
          <div className="breed-risk-alert-list">
            {alerts.map((alert) => (
              <article className="breed-risk-alert" key={`${alert.title}-${alert.severity}`}>
                <div>
                  <h4>{alert.title}</h4>
                  <span>{alert.severity}</span>
                </div>
                <p>{alert.description}</p>
                {alert.recommendation && (
                  <p><strong>{t('aiRisk.recommendation')}:</strong> {alert.recommendation}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="breed-risk-section">
        <h3>{t('aiRisk.recommendationsTitle')}</h3>
        <ul className="breed-risk-recommendations">
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </div>

      <aside className="breed-risk-disclaimer">
        <strong>{t('aiRisk.disclaimerTitle')}</strong>
        <p>{activeRecommendation?.non_diagnostic_warning}</p>
      </aside>
    </section>
  );
}
