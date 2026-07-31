import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import useTranslation from '../../hooks/useTranslation';
import recordsImage from '../../assets/images/tratamiento-veterinary.jpg';
import appointmentsImage from '../../assets/images/surgery.jpg';
import labImage from '../../assets/images/laboratory-image.jpg';
import aiImage from '../../assets/images/neophyte_uk-cat-10258101.jpg';
import reportsImage from '../../assets/images/reports.jpg';
import vaccinesImage from '../../assets/images/mirkosajkov-medicine-5003651.jpg';
import petCareImage from '../../assets/images/personalized-pet-care.png';

const SERVICE_KEYS = [
  {
    key: 'records',
    image: recordsImage,
    className: 'service-card-wide',
  },
  {
    key: 'appointments',
    image: appointmentsImage,
    className: 'service-card-wide',
  },
  {
    key: 'laboratory',
    image: labImage,
    className: 'service-card-wide',
  },
  {
    key: 'ai',
    image: aiImage,
    className: 'service-card-wide',
  },
  {
    key: 'reports',
    image: reportsImage,
    className: 'service-card-tall',
  },
  {
    key: 'vaccines',
    image: vaccinesImage,
    className: 'service-card-stack',
  },
  {
    key: 'personalizedCare',
    image: petCareImage,
    className: 'service-card-stack',
  },
];

export default function Services() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="services-page">
        <section className="services-header">
          <p>{t('services.eyebrow')}</p>
          <h1>{t('services.title')}</h1>
        </section>

        <section className="services-board" aria-label={t('services.title')}>
          <div className="services-left-column">
            {SERVICE_KEYS.slice(0, 4).map((service) => (
              <article className={`service-card ${service.className}`} key={service.key}>
                <div>
                  <h2>{t(`services.${service.key}.title`)}</h2>
                  <p>{t(`services.${service.key}.description`)}</p>
                </div>
                <img src={service.image} alt={t(`services.${service.key}.imageAlt`)} />
              </article>
            ))}
          </div>

          <article className="service-card service-card-tall">
            <img src={SERVICE_KEYS[4].image} alt={t('services.reports.imageAlt')} />
            <div>
              <h2>{t('services.reports.title')}</h2>
              <p>{t('services.reports.description')}</p>
            </div>
          </article>

          <div className="services-right-column">
            {SERVICE_KEYS.slice(5).map((service) => (
              <article className={`service-card ${service.className}`} key={service.key}>
                <img src={service.image} alt={t(`services.${service.key}.imageAlt`)} />
                <div>
                  <h2>{t(`services.${service.key}.title`)}</h2>
                  <p>{t(`services.${service.key}.description`)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
