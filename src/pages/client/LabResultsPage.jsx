import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/useAuthStore';
import { ROUTES } from '../../constants/routes';

const LabResultsPage = () => {
  const [searchParams] = useSearchParams();
  const petId = searchParams.get('petId');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!petId) return;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/lab-results/pets/${petId}/lab-results`);
        setResults(response.data.results || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar resultados:', err);
        setError(err.response?.data?.detail || 'Error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [petId]);

  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  if (loading) {
    return (
      <main className="page-container">
        <Link className="pet-dashboard-back" to={backToDashboard}>
          ← Volver
        </Link>
        <section className="health-section-page">
          <p className="page-eyebrow">Animal Health</p>
          <h1 className="page-title">Resultados de laboratorio</h1>
          <p className="page-subtitle">Cargando...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <Link className="pet-dashboard-back" to={backToDashboard}>
          ← Volver
        </Link>
        <section className="health-section-page">
          <p className="page-eyebrow">Animal Health</p>
          <h1 className="page-title">Resultados de laboratorio</h1>
          <p className="text-red-600">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        ← Volver al panel de mascota
      </Link>
      <section className="health-section-page">
        <p className="page-eyebrow">Animal Health</p>
        <h1 className="page-title">Resultados de laboratorio</h1>
        <p className="page-subtitle">Laboratory results and follow-up information for the selected pet.</p>

        {results.length === 0 ? (
          <p className="text-gray-500 mt-4">No hay resultados de laboratorio para esta mascota.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {results.map((result) => (
              <div key={result.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{result.test_type}</h3>
                    <p className="text-sm text-gray-500">Fecha: {result.test_date}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    result.result_summary?.toLowerCase() === 'normal'
                      ? 'bg-green-100 text-green-800'
                      : result.result_summary?.toLowerCase() === 'abnormal'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.result_summary || 'Pendiente'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{result.clinical_observations}</p>
                {result.veterinarian_name && (
                  <p className="text-xs text-gray-400 mt-2">Veterinario: {result.veterinarian_name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default LabResultsPage;