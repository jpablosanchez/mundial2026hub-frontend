import React, { useEffect } from 'react';
import TeamFlag from '../TeamFlag';
import Icon from './Icon';

const MatchModal = ({ match, loggedIn, onClose, onAgenda }) => {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!match) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" size={18} />
        </button>

        <div className="match-modal-header">
          <div className="match-modal-emblem-icon">
            <Icon name="trophy" size={20} />
          </div>
          <div className="match-modal-header-text">
            <div className="match-modal-wc">FIFA World Cup 2026™</div>
            <div className="match-modal-phase-label">{match.phase}</div>
          </div>
        </div>

        <div className="match-modal-teams">
          <div className="match-modal-team">
            <div className="match-modal-flag">
              <TeamFlag iso2={match.home.iso2} size="hero" />
            </div>
            <div className="match-modal-team-name">{match.home.name}</div>
          </div>
          <div className="match-modal-vs">VS</div>
          <div className="match-modal-team">
            <div className="match-modal-flag">
              <TeamFlag iso2={match.away.iso2} size="hero" />
            </div>
            <div className="match-modal-team-name">{match.away.name}</div>
          </div>
        </div>

        <div className="match-modal-info">
          {(match.date || match.time) && (
            <div className="match-modal-info-row">
              <Icon name="cal" size={15} />
              <span>{match.date}</span>
              {match.time && (
                <>
                  <span className="match-modal-sep">·</span>
                  <span className="mono">{match.time}</span>
                </>
              )}
            </div>
          )}
          {match.venue && match.venue !== 'Por confirmar' && (
            <div className="match-modal-info-row">
              <Icon name="stadium" size={15} />
              <span>{match.venue}</span>
            </div>
          )}
          {match.city && match.city !== 'Por confirmar' && (
            <div className="match-modal-info-row">
              <Icon name="pin" size={15} />
              <span>{match.city}</span>
            </div>
          )}
        </div>

        <div className="match-modal-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { window.location.href = '/entradas'; }}
          >
            <Icon name="ticket" size={14} /> Comprar entrada
          </button>
          <button
            className="btn btn-ghost btn-lg match-modal-agenda-btn"
            onClick={() => onAgenda && onAgenda(match)}
            disabled={!loggedIn}
            title={!loggedIn ? 'Inicia sesión para agendar' : 'Agregar a mi agenda'}
          >
            <Icon name="cal" size={14} /> Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
