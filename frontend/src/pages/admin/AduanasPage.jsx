// src/pages/admin/AduanasPage.jsx
import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { useToast } from '../../hooks/useToast';
import { getAduanas, crearAduana, actualizarAduana, eliminarAduana } from '../../api/aduanasApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AduanasPage.css';

export default function AduanasPage() {
  const [aduanas, setAduanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentAduana, setCurrentAduana] = useState({
    id: '',
    nombre: '',
    pais_origen: '',
    pais_destino: '',
    latitud: '',
    longitud: ''
  });

  const isEdit = !!currentAduana.id;

  useEffect(() => {
    loadAduanas();
  }, []);

  const loadAduanas = async () => {
    try {
      setLoading(true);
      const data = await getAduanas();
      setAduanas(data);
    } catch (e) {
      showError('Error al cargar aduanas');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (aduana = null) => {
    setCurrentAduana(
      aduana || {
        id: '',
        nombre: '',
        pais_origen: '',
        pais_destino: '',
        latitud: '',
        longitud: ''
      }
    );
    setDialogVisible(true);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await actualizarAduana(currentAduana.id, currentAduana);
      } else {
        await crearAduana(currentAduana);
      }
      showSuccess('Aduana guardada');
      setDialogVisible(false);
      loadAduanas();
    } catch (e) {
      showError('Error al guardar la aduana');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar aduana?')) return;
    try {
      await eliminarAduana(id);
      showSuccess('Aduana eliminada');
      loadAduanas();
    } catch (e) {
      showError('Error al eliminar la aduana');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="aduanas-page p-4">
      <div className="page-header flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Aduanas</h1>
        <Button label="Nueva Aduana" icon="pi pi-plus" onClick={() => openDialog()} />
      </div>
      <div className="grid">
        {aduanas.map((aduana) => (
          <Card key={aduana.id} className="col-12 md:col-6 lg:col-4 mb-3">
            <div className="aduana-card-header flex justify-content-between align-items-center">
              <h3>{aduana.nombre}</h3>
              <div>
                <Button icon="pi pi-pencil" className="p-button-text" onClick={() => openDialog(aduana)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleDelete(aduana.id)} />
              </div>
            </div>
            <p><strong>Origen:</strong> {aduana.pais_origen}</p>
            <p><strong>Destino:</strong> {aduana.pais_destino}</p>
            <p><strong>Coordenadas:</strong> {aduana.latitud}, {aduana.longitud}</p>
          </Card>
        ))}
      </div>

      <Dialog header={isEdit ? 'Editar Aduana' : 'Nueva Aduana'} visible={dialogVisible} style={{ width: '90vw', maxWidth: '500px' }} onHide={() => setDialogVisible(false)}>
        <div className="p-fluid">
          <div className="p-field"><label>Nombre</label><InputText value={currentAduana.nombre} onChange={e => setCurrentAduana({ ...currentAduana, nombre: e.target.value })} /></div>
          <div className="p-field"><label>Pais Origen</label><InputText value={currentAduana.pais_origen} onChange={e => setCurrentAduana({ ...currentAduana, pais_origen: e.target.value })} /></div>
          <div className="p-field"><label>Pais Destino</label><InputText value={currentAduana.pais_destino} onChange={e => setCurrentAduana({ ...currentAduana, pais_destino: e.target.value })} /></div>
          <div className="p-field"><label>Latitud</label><InputText value={currentAduana.latitud} onChange={e => setCurrentAduana({ ...currentAduana, latitud: e.target.value })} /></div>
          <div className="p-field"><label>Longitud</label><InputText value={currentAduana.longitud} onChange={e => setCurrentAduana({ ...currentAduana, longitud: e.target.value })} /></div>
          <Button label="Guardar" icon="pi pi-save" onClick={handleSave} className="mt-2" />
        </div>
      </Dialog>
    </div>
  );
}
