'use client';

import { useState, useEffect, useCallback } from 'react';

export default function HomePage() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [size, setSize] = useState('Unitalla');
  const [isNumberTaken, setIsNumberTaken] = useState(null);
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.players);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);

  useEffect(() => {
    if (isStaffLoggedIn) {
      fetchPlayers();
    }
  }, [isStaffLoggedIn, fetchPlayers]);

  const checkNumberAvailability = useCallback(async (num) => {
    if (!num || num.length === 0) {
      setIsNumberTaken(null);
      return;
    }
    setIsCheckingNumber(true);
    try {
      const response = await fetch(`/api/players/check-number?number=${num}`);
      const data = await response.json();
      setIsNumberTaken(data.isTaken);
    } catch (error) {
      console.error("Error checking number:", error);
      setIsNumberTaken(null);
    } finally {
      setIsCheckingNumber(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      checkNumberAvailability(number);
    }, 500);

    return () => clearTimeout(handler);
  }, [number, checkNumberAvailability]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (isNumberTaken) {
      alert('Este número ya está ocupado. Por favor, elige otro.');
      return;
    }
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, number: parseInt(number), size }),
      });

      if (response.ok) {
        alert('¡Jugador registrado con éxito!');
        setName('');
        setNumber('');
        setSize('Unitalla');
        setIsNumberTaken(null);
        if (isStaffLoggedIn) fetchPlayers();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert('Ocurrió un error al registrar al jugador.');
    }
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    const user = e.target.username.value;
    const pass = e.target.password.value;
    if (user === 'staff' && pass === 'staff') {
      setIsStaffLoggedIn(true);
      setShowLoginModal(false);
    } else {
      alert('Credenciales incorrectas.');
    }
  };

  const handleCopy = (player) => {
    const textToCopy = `${player.name} - ${player.number} - ${player.size}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert(`'${textToCopy}' copiado al portapapeles.`))
      .catch(() => alert('Error al copiar.'));
  };

  const handleDelete = async (playerId) => {
    if (confirm('¿Estás seguro de que quieres eliminar a este jugador?')) {
      try {
        const response = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
        if (response.ok) {
          alert('Jugador eliminado.');
          fetchPlayers();
        } else {
          alert('Error al eliminar.');
        }
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };
  
  const openEditModal = (player) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingPlayer.name,
          number: parseInt(editingPlayer.number),
          size: editingPlayer.size
        }),
      });
      if (response.ok) {
        alert('Jugador actualizado.');
        setShowEditModal(false);
        setEditingPlayer(null);
        fetchPlayers();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar: ${errorData.error}`);
      }
    } catch (error) {
        console.error('Error updating player:', error);
    }
  };

  return (
    <>
      <main className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  

[Image of a modern soccer team logo]

                  <h1 className="h3 fw-bold">Registro de Jersey</h1>
                  <p className="text-muted">Inscribe tu nombre y número para el equipo.</p>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre Completo</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="number" className="form-label">Número de Jersey</label>
                    <input type="number" className={`form-control ${isNumberTaken === true ? 'is-invalid' : isNumberTaken === false ? 'is-valid' : ''}`} id="number" value={number} onChange={(e) => setNumber(e.target.value)} required />
                    <div className={`validation-message mt-1 ${isNumberTaken !== null ? 'visible' : ''}`}>
                        {isCheckingNumber ? <span className="text-muted">Verificando...</span> : 
                         isNumberTaken === true ? <span className="text-danger">❌ Ocupado</span> :
                         isNumberTaken === false ? <span className="text-success">✅ Disponible</span> : ''}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="size" className="form-label">Talla</label>
                    <select className="form-select" id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                      <option value="Juvenil">Juvenil</option>
                      <option value="Unitalla">Unitalla</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={isNumberTaken || isCheckingNumber}>Registrarme</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {isStaffLoggedIn && (
          <div className="mt-5">
            <hr/>
            <h2 className="text-center mb-4">Panel de Administración</h2>
            <div className="row g-4">
              {players.length > 0 ? players.map((player) => (
                <div key={player.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 player-card">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title mb-1">{player.name}</h5>
                        <span className="badge bg-primary rounded-pill fs-6">{player.number}</span>
                      </div>
                      <p className="card-subtitle mb-3 text-muted">{player.size}</p>
                      <div className="mt-auto d-flex gap-2">
                        <button onClick={() => handleCopy(player)} className="btn btn-sm btn-outline-secondary"><i className="bi bi-clipboard"></i> Copiar</button>
                        <button onClick={() => openEditModal(player)} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i> Editar</button>
                        <button onClick={() => handleDelete(player.id)} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i> Borrar</button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : <p className="text-center text-muted">No hay jugadores registrados.</p>}
            </div>
          </div>
        )}
      </main>

      {!isStaffLoggedIn && (
        <div className="staff-icon bg-dark text-white shadow" data-bs-toggle="modal" data-bs-target="#loginModal" onClick={() => setShowLoginModal(true)}>
          <i className="bi bi-person-fill-gear"></i>
        </div>
      )}

      <div className={`modal fade ${showLoginModal ? 'show d-block' : ''}`} id="loginModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Acceso Staff</h5>
              <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleStaffLogin}>
                <div className="mb-3">
                  <label className="form-label">Usuario</label>
                  <input type="text" name="username" className="form-control" defaultValue="staff" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" name="password" className="form-control" defaultValue="staff" />
                </div>
                <button type="submit" className="btn btn-primary w-100">Entrar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showLoginModal && <div className="modal-backdrop fade show"></div>}
      
      {editingPlayer && (
        <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} id="editModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Jugador</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Número</label>
                    <input type="number" className="form-control" value={editingPlayer.number} onChange={(e) => setEditingPlayer({...editingPlayer, number: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Talla</label>
                    <select className="form-select" value={editingPlayer.size} onChange={(e) => setEditingPlayer({...editingPlayer, size: e.target.value})}>
                      <option value="Juvenil">Juvenil</option>
                      <option value="Unitalla">Unitalla</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-success w-100">Guardar Cambios</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
}