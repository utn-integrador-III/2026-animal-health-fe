import { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import { getApiErrorMessage } from '../../services/apiError';
import { sendContactMessage } from '../../services/contactService';
import useTranslation from '../../hooks/useTranslation';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const CONTACT_RECIPIENT_EMAIL = 'ediloma21@gmail.com';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setStatus({ type: '', message: '' });
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    const contactData = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    try {
      await sendContactMessage(contactData);
      setForm(EMPTY_FORM);
      setStatus({ type: 'success', message: t('contact.success') });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error, t('contact.error')),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="contact-page">
        <section className="contact-shell">
          <div className="contact-heading">
            <p>{t('contact.eyebrow')}</p>
            <h1>{t('contact.title')}</h1>
            <span>{t('contact.subtitle')}</span>
          </div>

          <div className="contact-grid">
            <form className="contact-form" onSubmit={handleSubmit}>
              {status.message && (
                <p className={status.type === 'success' ? 'status-success' : 'status-error'}>
                  {status.message}
                </p>
              )}

              <label>
                {t('contact.name')} *
                <input
                  required
                  minLength={2}
                  type="text"
                  value={form.name}
                  onChange={updateField('name')}
                />
              </label>

              <label>
                {t('contact.email')} *
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                />
              </label>

              <label>
                {t('contact.phone')}
                <input
                  type="tel"
                  value={form.phone}
                  onChange={updateField('phone')}
                />
              </label>

              <label>
                {t('contact.subject')} *
                <input
                  required
                  minLength={3}
                  type="text"
                  value={form.subject}
                  onChange={updateField('subject')}
                />
              </label>

              <label className="contact-message-field">
                {t('contact.message')} *
                <textarea
                  required
                  minLength={10}
                  value={form.message}
                  onChange={updateField('message')}
                />
              </label>

              <Button type="submit" className="contact-submit" isLoading={isSubmitting}>
                {t('contact.submit')}
              </Button>
            </form>

            <aside className="contact-details" aria-label={t('contact.detailsTitle')}>
              <h2>{t('contact.detailsTitle')}</h2>
              <a href="tel:+50626394270" className="contact-detail-item">
                <span><FaPhoneAlt /></span>
                <strong>+506 2639 4270 {t('contact.phoneOption')}</strong>
              </a>
              <a href={`mailto:${CONTACT_RECIPIENT_EMAIL}`} className="contact-detail-item">
                <span><FaEnvelope /></span>
                <strong>{CONTACT_RECIPIENT_EMAIL}</strong>
              </a>
              <a href="https://wa.me/50640015010" className="contact-detail-item">
                <span><FaWhatsapp /></span>
                <strong>+506 4001 5010</strong>
              </a>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
