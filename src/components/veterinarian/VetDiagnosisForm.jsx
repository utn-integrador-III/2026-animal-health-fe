import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheck, HiPencilAlt, HiBeaker, HiCalendar } from 'react-icons/hi';
import Swal from 'sweetalert2';
import useTranslation from '../../hooks/useTranslation';
import { ROUTES } from '../../constants/routes';

const SYSTEM_KEYS = [
  { key: 'generalState' },
  { key: 'skinCoat' },
  { key: 'eyes' },
  { key: 'ears' },
  { key: 'oralMouth' },
  { key: 'respiratory' },
  { key: 'cardiovascular' },
  { key: 'digestive' },
  { key: 'musculoskeletal' },
  { key: 'neurological' },
  { key: 'lymphNodes' },
];

export const INITIAL_FORM = {
  // 1. Información de la consulta
  consultation_date: new Date().toISOString().split('T')[0],
  consultation_time: new Date().toTimeString().slice(0, 5),
  veterinarian_name: '',
  appointment_ref: '',
  consultation_type: 'Enfermedad',

  // 2. Motivo de consulta
  reason: '',
  symptom_start_date: '',
  duration: '',
  evolution: 'Empeorando',
  severity: 'Moderada',

  // 3. Síntomas y signos — all unchecked by default
  owner_symptoms: {
    appetite_loss: false,
    vomiting: false,
    diarrhea: false,
    scratching_itching: false,
    lethargy: false,
    behavior_changes: false,
    others: '',
  },
  vet_signs: {
    skin_redness: false,
    ear_discharge: false,
    dehydration: false,
    abdominal_pain: false,
    lameness: false,
    fever: false,
    others: '',
  },

  // 4. Examen físico - Vitales — empty; placeholders show examples
  weight_kg: '',
  temperature_c: '',
  heart_rate_bpm: '',
  respiratory_rate_rpm: '',
  body_condition: '5 - Ideal',
  hydration: 'Normal',
  mucosa_color: 'Rosadas',
  capillary_refill_sec: '',

  // Examen físico - Sistemas
  systems_eval: SYSTEM_KEYS.reduce((acc, sys) => {
    acc[sys.key] = { status: 'Normal', observation: '' };
    return acc;
  }, {}),

  // 5. Evaluación clínica — empty; placeholders show examples
  presumptive_diagnosis: '',
  differential_diagnoses: '',
  diagnosis: '',
  status: 'Presuntivo',
  findings: '',

  // 6. Plan clínico — all unchecked by default
  recommended_actions: {
    prescribe_medication: false,
    lab_tests: false,
    register_allergy: false,
    vaccine: false,
    follow_up: false,
    refer_specialist: false,
  },
  treatment: '',
  clinical_plan: '',

  // 7. Indicaciones al propietario
  owner_instructions: '',
  warning_signs: '',

  // 8. Seguimiento
  requires_follow_up: false,
  follow_up_date: '',
  follow_up_reason: '',

  // 9. Observaciones clínicas
  notes: '',
};

export default function VetDiagnosisForm({ pet, veterinarian, onSubmit, isPending, onCancel, onNavigateToSection, diagnosisForm, setDiagnosisForm }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [internalForm, setInternalForm] = useState({
    ...INITIAL_FORM,
    veterinarian_name: veterinarian?.full_name || 'Dra. Mariana López',
    weight_kg: pet?.weight_kg || pet?.weight || '',
  });

  const form = diagnosisForm ?? internalForm;
  
  const setForm = (updater) => {
    if (setDiagnosisForm) {
      setDiagnosisForm((prev) => {
        const currentState = prev || internalForm;
        return typeof updater === 'function' ? updater(currentState) : updater;
      });
    }
    setInternalForm(updater);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (category, field, value) => {
    setForm((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSystemChange = (systemKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      systems_eval: {
        ...prev.systems_eval,
        [systemKey]: {
          ...prev.systems_eval[systemKey],
          [field]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      veterinarian_name: veterinarian?.full_name || 'Dra. Mariana López',
      weight_kg: pet?.weight_kg || pet?.weight || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      Swal.fire({
        icon: 'warning',
        title: t('diagnoses.diagnosisRequired'),
        confirmButtonColor: '#0f766e',
      });
      return;
    }

    const physicalExamSummary = `Signos vitales: Peso ${form.weight_kg}kg, Temp ${form.temperature_c}°C, FC ${form.heart_rate_bpm}bpm, FR ${form.respiratory_rate_rpm}rpm. Evaluación: ${Object.entries(
      form.systems_eval
    )
      .map(([k, v]) => `${t(`diagnoses.system.${k}`)}: ${t(`diagnoses.systemStatus.${v.status}`)} (${v.observation || 'Sin anomalías'})`)
      .join('; ')}`;

    const payload = {
      pet_id: pet?.id,
      diagnosis: form.diagnosis,
      presumptive_diagnosis: form.presumptive_diagnosis,
      differential_diagnoses: form.differential_diagnoses,
      status: form.status,
      treatment: form.treatment,
      notes: form.notes,
      consultation_date: form.consultation_date,
      reason: form.reason,
      symptoms: Object.keys(form.owner_symptoms)
        .filter((k) => form.owner_symptoms[k] === true)
        .map((k) => t(`diagnoses.symptom.${k}`))
        .join(', '),
      physical_exam: physicalExamSummary,
      clinical_plan: form.clinical_plan,
      owner_instructions: form.owner_instructions,
      follow_up: form.requires_follow_up
        ? `Fecha: ${form.follow_up_date}. Motivo: ${form.follow_up_reason}`
        : 'No requiere',
      weight_kg: form.weight_kg ? String(form.weight_kg) : '',
      temperature_c: form.temperature_c ? String(form.temperature_c) : '',
      heart_rate_bpm: form.heart_rate_bpm ? String(form.heart_rate_bpm) : '',
      respiratory_rate_rpm: form.respiratory_rate_rpm ? String(form.respiratory_rate_rpm) : '',
      systems_eval: form.systems_eval,
      follow_up_date: form.requires_follow_up ? form.follow_up_date : '',
      follow_up_reason: form.requires_follow_up ? form.follow_up_reason : '',
    };

    if (onSubmit) {
      await onSubmit(payload);
      resetForm();
    }
  };

  const handleNavPrescribe = () => {
    if (onNavigateToSection) {
      onNavigateToSection('medications');
    } else {
      const target = pet?.id ? `${ROUTES.CLIENT.MEDICATIONS}?petId=${encodeURIComponent(pet.id)}` : ROUTES.CLIENT.MEDICATIONS;
      navigate(target);
    }
  };

  const handleNavAllergies = () => {
    if (onNavigateToSection) {
      onNavigateToSection('allergies');
    } else {
      const target = pet?.id ? `${ROUTES.CLIENT.ALLERGIES}?petId=${encodeURIComponent(pet.id)}` : ROUTES.CLIENT.ALLERGIES;
      navigate(target);
    }
  };

  const handleNavFollowUp = () => {
    if (onNavigateToSection) {
      onNavigateToSection('appointments');
    } else {
      const target = pet?.id ? `${ROUTES.CLIENT.APPOINTMENTS}?petId=${encodeURIComponent(pet.id)}` : ROUTES.CLIENT.APPOINTMENTS;
      navigate(target);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{t('diagnoses.addTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Información de la consulta */}
        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            {t('diagnoses.section.consulta')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
              {t('diagnoses.consultationDate')}
              <input
                type="date"
                value={form.consultation_date}
                onChange={(e) => handleChange('consultation_date', e.target.value)}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
              {t('diagnoses.time')}
              <input
                type="time"
                value={form.consultation_time}
                onChange={(e) => handleChange('consultation_time', e.target.value)}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
              {t('diagnoses.veterinarian')}
              <select
                value={form.veterinarian_name}
                onChange={(e) => handleChange('veterinarian_name', e.target.value)}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value={form.veterinarian_name}>{form.veterinarian_name}</option>
              </select>
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
              {t('diagnoses.appointmentRef')}
              <input
                type="text"
                value={form.appointment_ref}
                onChange={(e) => handleChange('appointment_ref', e.target.value)}
                placeholder="APT-1005"
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
              {t('diagnoses.consultationType')}
              <select
                value={form.consultation_type}
                onChange={(e) => handleChange('consultation_type', e.target.value)}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="Enfermedad">Enfermedad</option>
                <option value="Control">Control</option>
                <option value="Urgencia">Urgencia</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Vacunación">Vacunación</option>
              </select>
            </label>
          </div>
        </section>

        {/* 2 & 3 Grid: Motivo de consulta y Síntomas y signos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* 2. Motivo de consulta */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.motivo')}
            </h3>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.75rem' }}>
              {t('diagnoses.mainReason')}
              <textarea
                rows="3"
                value={form.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                placeholder={t('diagnoses.placeholder.reason')}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                {t('diagnoses.symptomStart')}
                <input
                  type="date"
                  value={form.symptom_start_date}
                  onChange={(e) => handleChange('symptom_start_date', e.target.value)}
                  style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                />
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                {t('diagnoses.duration')}
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder={t('diagnoses.placeholder.duration')}
                  style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                />
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                {t('diagnoses.evolution')}
                <select
                  value={form.evolution}
                  onChange={(e) => handleChange('evolution', e.target.value)}
                  style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                >
                  <option value="Empeorando">Empeorando</option>
                  <option value="Estable">Estable</option>
                  <option value="Mejorando">Mejorando</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#374151' }}>{t('diagnoses.ownerSeverity')}</span>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                {['Leve', 'Moderada', 'Severa'].map((g) => (
                  <label key={g} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="severity"
                      value={g}
                      checked={form.severity === g}
                      onChange={(e) => handleChange('severity', e.target.value)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Síntomas y signos */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.sintomas')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: '600', color: '#15803d', marginBottom: '0.5rem' }}>
                  {t('diagnoses.ownerSymptomsTitle')}
                </h4>
                {[
                  'appetite_loss',
                  'vomiting',
                  'diarrhea',
                  'scratching_itching',
                  'lethargy',
                  'behavior_changes',
                ].map((key) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.owner_symptoms[key]}
                      onChange={(e) => handleNestedChange('owner_symptoms', key, e.target.checked)}
                    />
                    {t(`diagnoses.symptom.${key}`)}
                  </label>
                ))}
              </div>

              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: '600', color: '#15803d', marginBottom: '0.5rem' }}>
                  {t('diagnoses.vetSignsTitle')}
                </h4>
                {[
                  'skin_redness',
                  'ear_discharge',
                  'dehydration',
                  'abdominal_pain',
                  'lameness',
                  'fever',
                ].map((key) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.vet_signs[key]}
                      onChange={(e) => handleNestedChange('vet_signs', key, e.target.checked)}
                    />
                    {t(`diagnoses.sign.${key}`)}
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 4. Examen físico */}
        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            {t('diagnoses.section.examen')}
          </h3>
          {/* Signos vitales grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.weight')}
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => handleChange('weight_kg', e.target.value)}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.temperature')}
              <input
                type="text"
                value={form.temperature_c}
                onChange={(e) => handleChange('temperature_c', e.target.value)}
                placeholder={t('diagnoses.placeholder.temperature_c')}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.heartRate')}
              <input
                type="text"
                value={form.heart_rate_bpm}
                onChange={(e) => handleChange('heart_rate_bpm', e.target.value)}
                placeholder={t('diagnoses.placeholder.heart_rate_bpm')}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.respiratoryRate')}
              <input
                type="text"
                value={form.respiratory_rate_rpm}
                onChange={(e) => handleChange('respiratory_rate_rpm', e.target.value)}
                placeholder={t('diagnoses.placeholder.respiratory_rate_rpm')}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.bodyCondition')}
              <select
                value={form.body_condition}
                onChange={(e) => handleChange('body_condition', e.target.value)}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              >
                <option value="5 - Ideal">5 - Ideal</option>
                <option value="1 - Caquéctico">1 - Caquéctico</option>
                <option value="3 - Delgado">3 - Delgado</option>
                <option value="7 - Sobrepeso">7 - Sobrepeso</option>
                <option value="9 - Obeso">9 - Obeso</option>
              </select>
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {t('diagnoses.hydration')}
              <select
                value={form.hydration}
                onChange={(e) => handleChange('hydration', e.target.value)}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              >
                <option value="Normal">Normal</option>
                <option value="Deshidratado < 5%">Deshidratado &lt; 5%</option>
                <option value="Deshidratado 5-8%">Deshidratado 5-8%</option>
              </select>
            </label>
          </div>

          {/* Evaluation by systems */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
            {t('diagnoses.systemEvaluation')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SYSTEM_KEYS.map((sys) => {
              const current = form.systems_eval[sys.key];
              return (
                <div key={sys.key} style={{ display: 'grid', gridTemplateColumns: '200px 140px 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#4b5563' }}>
                    {t(`diagnoses.system.${sys.key}`)}
                  </span>
                  <select
                    value={current.status}
                    onChange={(e) => handleSystemChange(sys.key, 'status', e.target.value)}
                    style={{
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.8rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #d1d5db',
                      color: current.status === 'Anormal' ? '#dc2626' : current.status === 'Normal' ? '#16a34a' : '#6b7280',
                      fontWeight: '600',
                    }}
                  >
                    <option value="Normal">{t('diagnoses.systemStatus.Normal')}</option>
                    <option value="Anormal">{t('diagnoses.systemStatus.Anormal')}</option>
                    <option value="No evaluado">{t('diagnoses.systemStatus.NoEvaluado')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Sin anomalías / Observación"
                    value={current.observation}
                    onChange={(e) => handleSystemChange(sys.key, 'observation', e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 & 6 Grid: Evaluación clínica y Plan clínico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* 5. Evaluación clínica */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.evaluacion')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                {t('diagnoses.diagnosisLabel')} *
                <input
                  required
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => handleChange('diagnosis', e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </label>

              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                {t('diagnoses.presumptiveLabel')}
                <input
                  type="text"
                  value={form.presumptive_diagnosis}
                  onChange={(e) => handleChange('presumptive_diagnosis', e.target.value)}
                  placeholder={t('diagnoses.placeholder.presumptive_diagnosis')}
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </label>

              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                {t('diagnoses.differentialLabel')}
                <input
                  type="text"
                  value={form.differential_diagnoses}
                  onChange={(e) => handleChange('differential_diagnoses', e.target.value)}
                  placeholder={t('diagnoses.placeholder.differential_diagnoses')}
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </label>

              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                {t('diagnoses.statusLabel')}
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                >
                  <option value="Presuntivo">{t('diagnoses.status.Presuntivo')}</option>
                  <option value="Pendiente de confirmación">{t('diagnoses.status.PendienteDeConfirmacion')}</option>
                  <option value="Confirmado">{t('diagnoses.status.Confirmado')}</option>
                  <option value="Resuelto">{t('diagnoses.status.Resuelto')}</option>
                </select>
              </label>
            </div>
          </section>

          {/* 6. Plan clínico */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.plan')}
            </h3>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
              {t('diagnoses.recommendedActions')}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
              {[
                ['prescribe_medication', 'Prescribir medicamento'],
                ['lab_tests', 'Solicitar exámenes de laboratorio'],
                ['register_allergy', 'Registrar nueva alergia'],
                ['vaccine', 'Aplicar / Agendar vacuna'],
                ['follow_up', 'Programar seguimiento'],
                ['refer_specialist', 'Referir a especialista'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.recommended_actions[key]}
                    onChange={(e) => handleNestedChange('recommended_actions', key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '1rem' }}>
              {t('diagnoses.treatmentSummary')}
              <textarea
                rows="3"
                value={form.treatment}
                onChange={(e) => handleChange('treatment', e.target.value)}
                placeholder={t('diagnoses.placeholder.treatment')}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>

            {/* Action Buttons for Prescribe Medication, Assign Allergies, Schedule Follow-up */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                id="btn-prescribe-medication"
                onClick={handleNavPrescribe}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#0f766e',
                  border: '1px solid #0f766e',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                }}
              >
                <HiPencilAlt aria-hidden="true" />
                {t('diagnoses.actions.prescribeMedication')}
              </button>

              <button
                type="button"
                id="btn-assign-allergies"
                onClick={handleNavAllergies}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#0f766e',
                  border: '1px solid #0f766e',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                }}
              >
                <HiBeaker aria-hidden="true" />
                {t('diagnoses.actions.assignAllergies')}
              </button>

              <button
                type="button"
                id="btn-schedule-followup"
                onClick={handleNavFollowUp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#0f766e',
                  border: '1px solid #0f766e',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                }}
              >
                <HiCalendar aria-hidden="true" />
                {t('diagnoses.actions.scheduleFollowUp')}
              </button>
            </div>
          </section>
        </div>

        {/* 7, 8 & 9 Grid: Indicaciones, Seguimiento, Observaciones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* 7. Indicaciones al propietario */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.indicaciones')}
            </h3>
            <label style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block', marginBottom: '0.75rem' }}>
              {t('diagnoses.instructions')}
              <textarea
                rows="2"
                value={form.owner_instructions}
                onChange={(e) => handleChange('owner_instructions', e.target.value)}
                placeholder={t('diagnoses.placeholder.owner_instructions')}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block' }}>
              {t('diagnoses.warningSigns')}
              <textarea
                rows="2"
                value={form.warning_signs}
                onChange={(e) => handleChange('warning_signs', e.target.value)}
                placeholder={t('diagnoses.placeholder.warning_signs')}
                style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </label>
          </section>

          {/* 8. Seguimiento */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.seguimiento')}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{t('diagnoses.requiresFollowUp')}</span>
              <button
                type="button"
                onClick={() => handleChange('requires_follow_up', !form.requires_follow_up)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: form.requires_follow_up ? '#0f766e' : '#9ca3af',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {form.requires_follow_up ? 'Sí' : 'No'}
              </button>
            </div>
            {form.requires_follow_up && (
              <>
                <label style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  {t('diagnoses.followUpDate')}
                  <input
                    type="date"
                    value={form.follow_up_date}
                    onChange={(e) => handleChange('follow_up_date', e.target.value)}
                    style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                  />
                </label>
                <label style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block' }}>
                  {t('diagnoses.followUpReason')}
                  <textarea
                    rows="2"
                    value={form.follow_up_reason}
                    onChange={(e) => handleChange('follow_up_reason', e.target.value)}
                    style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                  />
                </label>
              </>
            )}
          </section>

          {/* 9. Observaciones clínicas */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              {t('diagnoses.section.observaciones')}
            </h3>
            <label style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block' }}>
              {t('diagnoses.clinicalObservations')}
              <textarea
                rows="5"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('diagnoses.placeholder.notes')}
                style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </label>
          </section>
        </div>

        {/* Bottom Bar Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer' }}
            >
              {t('diagnoses.cancel')}
            </button>
          )}
          <button
            id="save-vet-diagnosis-btn"
            type="submit"
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              fontWeight: '600',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            <HiCheck aria-hidden="true" />
            {isPending ? '...' : t('diagnoses.completeConsultation')}
          </button>
        </div>
      </form>
    </div>
  );
}
