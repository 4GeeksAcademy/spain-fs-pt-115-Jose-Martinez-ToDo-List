import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import * as ics from 'ics';

const Home = () => {
    const [tareas, setTareas] = useState([]);
    const [valorInput, setValorInput] = useState("");
    const [lanzarConfeti, setLanzarConfeti] = useState(false);
    const [idTareaEditando, setIdTareaEditando] = useState(null);
    const [textoEditado, setTextoEditado] = useState("");

    useEffect(() => {
        if (lanzarConfeti) {
            const timer = setTimeout(() => setLanzarConfeti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [lanzarConfeti]);

    const agregarTarea = (e) => {
        if (e.key === "Enter" && valorInput.trim() !== "") {
            const nuevaTarea = { id: Date.now(), texto: valorInput.trim(), completada: false };
            setTareas([nuevaTarea, ...tareas]);
            setValorInput("");
        }
    };

    const borrarTarea = (id) => {
        setTareas(tareas.filter(tarea => tarea.id !== id));
    };

    const marcarComoHecha = (id) => {
        setTareas(tareas.map(tarea => {
            if (tarea.id === id) {
                if (!tarea.completada) { setLanzarConfeti(true); }
                return { ...tarea, completada: !tarea.completada };
            }
            return tarea;
        }));
    };

    const iniciarEdicion = (tarea) => {
        setIdTareaEditando(tarea.id);
        setTextoEditado(tarea.texto);
    };
    
    const guardarEdicion = (e) => {
        if (e.key === 'Enter') {
            setTareas(tareas.map(tarea => 
                tarea.id === idTareaEditando ? { ...tarea, texto: textoEditado } : tarea
            ));
            setIdTareaEditando(null);
            setTextoEditado("");
        }
    };
    
    const exportarICal = () => {
        const eventos = tareas.filter(t => !t.completada).map(t => {
            const now = new Date();
            return {
                title: t.texto,
                start: [now.getFullYear(), now.getMonth() + 1, now.getDate(), 9, 0],
                duration: { hours: 1 }
            };
        });

        if (eventos.length === 0) {
            alert("No hay tareas pendientes para exportar.");
            return;
        }

        const { error, value } = ics.createEvents(eventos);
        if (error) { console.log(error); return; }

        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tareas.ics';
        link.click();
    };

    const tareasPendientes = tareas.filter(t => !t.completada);
    const tareasCompletadas = tareas.filter(t => t.completada);

    return (
        <div className="app-container">
            {/* para el fondo animado */}
            <div className="background-animado">
                {[...Array(20)].map((_, i) => <span key={i}></span>)}
            </div>

            {lanzarConfeti && <Confetti recycle={false} numberOfPieces={400} />}
            <div className="todo-wrapper">
                <header className="todo-header">
                    <h1>Lista de Tareas</h1>
                </header>
                
                <div className="input-area">
                    <input
                        type="text"
                        className="todo-input"
                        placeholder="Añadir nueva tarea..."
                        value={valorInput}
                        onChange={(e) => setValorInput(e.target.value)}
                        onKeyUp={agregarTarea}
                    />
                </div>

                <div className="task-list">
                    <h2>Pendientes</h2>
                    {tareasPendientes.map(tarea => (
                        <div key={tarea.id} className="task-block">
                            {idTareaEditando === tarea.id ? (
                                <input type="text" value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} onKeyUp={guardarEdicion} onBlur={() => setIdTareaEditando(null)} autoFocus className="edit-input" />
                            ) : (
                                <span onClick={() => marcarComoHecha(tarea.id)} className="task-text">{tarea.texto}</span>
                            )}
                            <div className="task-actions">
                                <button onClick={() => iniciarEdicion(tarea)} className="action-btn edit-btn"></button>
                                <button onClick={() => borrarTarea(tarea.id)} className="action-btn delete-btn"></button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="task-list">
                    <h2>Completadas</h2>
                    {tareasCompletadas.map(tarea => (
                        <div key={tarea.id} className="task-block completed">
                             <span onClick={() => marcarComoHecha(tarea.id)} className="task-text">{tarea.texto}</span>
                             <div className="task-actions">
                                <button onClick={() => borrarTarea(tarea.id)} className="action-btn delete-btn"></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="export-section">
                    <p className="export-info">Exporta tus tareas pendientes a tu calendario personal.</p>
                    <button onClick={exportarICal} className="btn-export-svg">
                        <span>Exportar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;