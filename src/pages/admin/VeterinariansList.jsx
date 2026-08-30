import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVeterinarians, deleteVeterinarian } from '../../services/adminService';
import useAuthStore from '../../stores/useAuthStore';

const VeterinariansList = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVeterinarians = async () => {
    try {
      setLoading(true);
      const data = await getVeterinarians();
      setVeterinarians(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar veterinarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVeterinarians();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este veterinario?')) return;
    try {
      await deleteVeterinarian(id);
      setVeterinarians(veterinarians.filter(v => v.id !== id));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando veterinarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">❌ {error}</p>
        <button
          onClick={loadVeterinarians}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          👨‍⚕️ Veterinarios
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/veterinarians/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Registrar Veterinario
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>←</span> Cerrar sesión
          </button>
        </div>
      </div>

      {veterinarians.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay veterinarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Licencia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {veterinarians.map((vet) => (
                <tr key={vet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vet.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{vet.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {vet.specialty || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {vet.license_number || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(vet.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VeterinariansList;