import React, { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../App.css';

// Solo letras (incluyendo tildes, ñ) y espacios
const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùñÑüÜ\s]*$/;

const generarCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, resultado: a + b };
};

const calcularFortaleza = (clave) => {
    if (!clave) return null;
    let puntos = 0;
    if (clave.length >= 8) puntos++;
    if (/[A-Z]/.test(clave)) puntos++;
    if (/[0-9]/.test(clave)) puntos++;
    if (/[^a-zA-Z0-9]/.test(clave)) puntos++;
    if (puntos <= 1) return { nivel: 1, label: 'Débil', color: '#e74c3c', ancho: '33%' };
    if (puntos <= 2) return { nivel: 2, label: 'Media', color: '#f39c12', ancho: '66%' };
    return { nivel: 3, label: 'Fuerte', color: '#27ae60', ancho: '100%' };
};

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correoUsuario: '',
        claveUsuario: '',
        confirmarClave: ''
    });
    const [errores, setErrores] = useState({});
    const [exito, setExito] = useState('');
    const [loading, setLoading] = useState(false);
    const [captcha, setCaptcha] = useState(generarCaptcha);
    const [captchaInput, setCaptchaInput] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [mostrarTerminos, setMostrarTerminos] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const fortaleza = calcularFortaleza(formData.claveUsuario);

    const validarCampo = (nombre, valor, datos = formData) => {
        if (nombre === 'nombres' || nombre === 'apellidos') {
            if (valor.trim().length < 2) return 'Mínimo 2 letras.';
        }
        if (nombre === 'claveUsuario') {
            if (valor.length < 8) return 'Mínimo 8 caracteres.';
        }
        if (nombre === 'confirmarClave') {
            if (valor !== datos.claveUsuario) return 'Las contraseñas no coinciden.';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Bloquear caracteres inválidos en nombres y apellidos
        if ((name === 'nombres' || name === 'apellidos') && !SOLO_LETRAS.test(value)) return;

        const nuevosDatos = { ...formData, [name]: value };
        setFormData(nuevosDatos);

        const err = validarCampo(name, value, nuevosDatos);
        setErrores(prev => ({ ...prev, [name]: err }));

        // Revalidar "confirmar" si el usuario cambia la clave original
        if (name === 'claveUsuario' && formData.confirmarClave) {
            const errConfirm = value !== formData.confirmarClave ? 'Las contraseñas no coinciden.' : '';
            setErrores(prev => ({ ...prev, confirmarClave: errConfirm }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nuevosErrores = {};

        ['nombres', 'apellidos', 'claveUsuario', 'confirmarClave'].forEach(campo => {
            const err = validarCampo(campo, formData[campo]);
            if (err) nuevosErrores[campo] = err;
        });

        //if (parseInt(captchaInput) !== captcha.resultado) {
        //    nuevosErrores.captcha = 'Respuesta incorrecta. Intenta de nuevo.';
        //    setCaptcha(generarCaptcha());
        //    setCaptchaInput('');
        //}

        if (!aceptaTerminos) {
            nuevosErrores.terminos = 'Debes aceptar los términos y condiciones.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        setLoading(true);
        setErrores({});
        try {
            const { confirmarClave, ...datosRegistro } = formData;
            await registrarUsuario(datosRegistro);
            setExito('¡Registro exitoso! Te enviamos un correo de verificación a ' + formData.correoUsuario + '. Revisa tu bandeja de entrada para activar tu cuenta.');
        } catch (err) {
            setErrores({ general: err.response?.data?.mensaje || 'Error al registrarse.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mundial-bg"></div>
            <div className="mundial-content">
                <div className="auth-page">
                    {/* Left — Form */}
                    <div className="auth-left">
                        <div className="auth-form-container animate-in">
                            <div className="auth-logo">
                                <span className="auth-logo-icon">⚽</span>
                                <span className="auth-logo-text">Mundial 2026 Hub</span>
                            </div>

                            <h2 className="auth-title">Crea tu cuenta</h2>
                            <p className="auth-subtitle">Únete a la comunidad del Mundial 2026</p>

                            {errores.general && <div className="alert-mundial alert-danger">{errores.general}</div>}
                            {exito && <div className="alert-mundial alert-success">{exito}</div>}

                            {!exito && (
                                <form onSubmit={handleSubmit} noValidate>
                                    {/* Nombres y Apellidos */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div className="input-group-mundial">
                                            <label>Nombres</label>
                                            <input
                                                type="text"
                                                className={`input-mundial${errores.nombres ? ' input-error' : ''}`}
                                                name="nombres"
                                                value={formData.nombres}
                                                onChange={handleChange}
                                                placeholder="Tu nombre"
                                                required
                                            />
                                            {errores.nombres && <span className="field-error">{errores.nombres}</span>}
                                        </div>
                                        <div className="input-group-mundial">
                                            <label>Apellidos</label>
                                            <input
                                                type="text"
                                                className={`input-mundial${errores.apellidos ? ' input-error' : ''}`}
                                                name="apellidos"
                                                value={formData.apellidos}
                                                onChange={handleChange}
                                                placeholder="Tus apellidos"
                                                required
                                            />
                                            {errores.apellidos && <span className="field-error">{errores.apellidos}</span>}
                                        </div>
                                    </div>

                                    {/* Correo */}
                                    <div className="input-group-mundial">
                                        <label>Correo electrónico</label>
                                        <input
                                            type="email"
                                            className="input-mundial"
                                            name="correoUsuario"
                                            value={formData.correoUsuario}
                                            onChange={handleChange}
                                            placeholder="tu@correo.com"
                                            required
                                        />
                                    </div>

                                    {/* Contraseña con toggle visibilidad */}
                                    <div className="input-group-mundial">
                                        <label>Contraseña</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={mostrarClave ? 'text' : 'password'}
                                                className={`input-mundial${errores.claveUsuario ? ' input-error' : ''}`}
                                                name="claveUsuario"
                                                value={formData.claveUsuario}
                                                onChange={handleChange}
                                                placeholder="Mínimo 8 caracteres"
                                                required
                                                style={{ paddingRight: '2.5rem' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMostrarClave(v => !v)}
                                                style={{
                                                    position: 'absolute', right: '0.75rem', top: '50%',
                                                    transform: 'translateY(-50%)', background: 'none',
                                                    border: 'none', cursor: 'pointer', fontSize: '1rem',
                                                    color: 'var(--text-muted)', padding: 0
                                                }}
                                                title={mostrarClave ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {mostrarClave ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errores.claveUsuario && <span className="field-error">{errores.claveUsuario}</span>}

                                        {/* Indicador de fortaleza */}
                                        {formData.claveUsuario && (
                                            <div style={{ marginTop: '0.4rem' }}>
                                                <div style={{
                                                    height: '4px', background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '2px', overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%', width: fortaleza.ancho,
                                                        background: fortaleza.color,
                                                        transition: 'width 0.3s, background 0.3s'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: fortaleza.color }}>
                                                    Contraseña {fortaleza.label}
                                                    {fortaleza.nivel < 3 && ' — agrega mayúsculas, números o símbolos'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmar contraseña */}
                                    <div className="input-group-mundial">
                                        <label>Confirmar contraseña</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={mostrarConfirmar ? 'text' : 'password'}
                                                className={`input-mundial${errores.confirmarClave ? ' input-error' : ''}`}
                                                name="confirmarClave"
                                                value={formData.confirmarClave}
                                                onChange={handleChange}
                                                placeholder="Repite tu contraseña"
                                                required
                                                style={{ paddingRight: '2.5rem' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMostrarConfirmar(v => !v)}
                                                style={{
                                                    position: 'absolute', right: '0.75rem', top: '50%',
                                                    transform: 'translateY(-50%)', background: 'none',
                                                    border: 'none', cursor: 'pointer', fontSize: '1rem',
                                                    color: 'var(--text-muted)', padding: 0
                                                }}
                                                title={mostrarConfirmar ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {mostrarClave ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errores.confirmarClave && <span className="field-error">{errores.confirmarClave}</span>}
                                        {!errores.confirmarClave && formData.confirmarClave && formData.confirmarClave === formData.claveUsuario && (
                                            <span style={{ fontSize: '0.75rem', color: '#27ae60' }}>Las contraseñas coinciden</span>
                                        )}
                                    </div>

                                    {/* CAPTCHA matemático */}
                                    {/*
                                    <div className="input-group-mundial">
                                        <label>Verificación de seguridad</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: '8px', padding: '0.5rem 1rem',
                                                color: 'var(--text-primary)', fontSize: '1rem',
                                                fontWeight: 600, letterSpacing: '0.05em',
                                                userSelect: 'none', flexShrink: 0
                                            }}>
                                                ¿Cuánto es {captcha.a} + {captcha.b}?
                                            </div>
                                            <input
                                                type="number"
                                                className={`input-mundial${errores.captcha ? ' input-error' : ''}`}
                                                value={captchaInput}
                                                onChange={e => {
                                                    setCaptchaInput(e.target.value);
                                                    setErrores(prev => ({ ...prev, captcha: '' }));
                                                }}
                                                placeholder="Resultado"
                                                style={{ width: '100px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setCaptcha(generarCaptcha()); setCaptchaInput(''); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    fontSize: '1.1rem', color: 'var(--text-muted)', padding: 0
                                                }}
                                                title="Nueva pregunta"
                                            >
                                                🔄
                                            </button>
                                        </div>
                                        {errores.captcha && <span className="field-error">{errores.captcha}</span>}
                                    </div>
                                    */}
                                    {/* Términos y condiciones */}
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <label style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                                            cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={aceptaTerminos}
                                                onChange={e => {
                                                    setAceptaTerminos(e.target.checked);
                                                    setErrores(prev => ({ ...prev, terminos: '' }));
                                                }}
                                                style={{ marginTop: '2px', accentColor: 'var(--verde-campo)' }}
                                            />
                                            <span>
                                                Acepto los{' '}
                                                <button
                                                    type="button"
                                                    className="auth-link"
                                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.85rem' }}
                                                    onClick={() => setMostrarTerminos(v => !v)}
                                                >
                                                    términos y condiciones
                                                </button>
                                                {' '}del servicio
                                            </span>
                                        </label>
                                        {errores.terminos && <span className="field-error">{errores.terminos}</span>}

                                        {/* Términos expandibles */}
                                        {mostrarTerminos && (
                                            <div style={{
                                                marginTop: '0.6rem', background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                                padding: '0.75rem 1rem', fontSize: '0.78rem',
                                                color: 'var(--text-muted)', maxHeight: '150px',
                                                overflowY: 'auto', lineHeight: 1.6
                                            }}>
                                                <strong style={{ color: 'var(--text-primary)' }}>Términos y Condiciones — Mundial 2026 Hub</strong>
                                                <p style={{ marginTop: '0.4rem' }}>
                                                    Al registrarte aceptas que tus datos (nombre, correo y preferencias) serán usados
                                                    exclusivamente para personalizar tu experiencia en la aplicación. No compartimos
                                                    tu información con terceros. Puedes eliminar tu cuenta en cualquier momento desde
                                                    la configuración de tu perfil. El uso indebido de la plataforma puede resultar en
                                                    la suspensión de la cuenta. Esta aplicación es un proyecto universitario desarrollado
                                                    por estudiantes de la Universidad El Bosque para el Mundial FIFA 2026.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-gold"
                                        disabled={loading}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                                    </button>
                                </form>
                            )}

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'center' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="auth-link">Inicia sesión</Link>
                            </p>
                        </div>
                    </div>

                    {/* Right — Branding with Cristiano background */}
                    <div className="auth-right" style={{
                        backgroundImage: 'url(/images/cristiano.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}>
                        <div className="auth-right-overlay"></div>
                        <div className="auth-right-content animate-fade">
                            <span className="auth-right-icon">🌎</span>
                            <h2>3 Países, 1 Pasión</h2>
                            <p>Estados Unidos, México y Canadá se unen para la Copa del Mundo más grande jamás organizada.</p>
                            <ul className="feature-list">
                                <li><span className="feature-dot"></span>48 selecciones nacionales</li>
                                <li><span className="feature-dot"></span>16 ciudades sede</li>
                                <li><span className="feature-dot"></span>104 partidos en total</li>
                                <li><span className="feature-dot"></span>Tu experiencia personalizada</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registro;
