import { FaPaw } from 'react-icons/fa';

import clinicImage from '../../assets/images/tylijura-veterinarian-8859080_640.jpg';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import useTranslation from '../../hooks/useTranslation';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="about-page">
        <section className="about-hero" id="about">
          <div className="about-image-panel">
            <img src={clinicImage} alt={t('about.imageAlt')} />
          </div>

          <article className="about-copy">
            <FaPaw className="about-paw" aria-hidden="true" />
            <p className="about-eyebrow">{t('about.eyebrow')}</p>
            <h1>{t('about.title')}</h1>
            <div className="about-body">
              <p>{t('about.paragraph1')}</p>
              <p>{t('about.paragraph2')}</p>
              <p>{t('about.paragraph3')}</p>
              <p>{t('about.paragraph4')}</p>
              <p>{t('about.paragraph5')}</p>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
