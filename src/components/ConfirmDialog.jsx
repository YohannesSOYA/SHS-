import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

/**
 * ConfirmDialog — Reusable modal confirmation dialog.
 * Props:
 *   isOpen: bool
 *   title: string
 *   message: string
 *   onConfirm: () => void
 *   onCancel: () => void
 *   confirmLabel: string (default: "Padam")
 *   confirmColor: string (default: "#dc2626")
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Sahkan Tindakan',
  message = 'Adakah anda pasti mahu meneruskan tindakan ini?',
  onConfirm,
  onCancel,
  confirmLabel = 'Ya, Padam',
  confirmColor = '#dc2626'
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '420px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.2s ease'
        }}
      >
        {/* Icon + Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: '#fef2f2', border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <AlertTriangle size={24} color="#dc2626" />
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.15rem', fontWeight: 800, color: '#111827',
          fontFamily: "'Outfit', sans-serif", marginBottom: '8px'
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '12px',
              border: '1px solid #e5e7eb', background: '#f9fafb',
              color: '#374151', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: '12px',
              border: 'none', background: confirmColor,
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: `0 4px 12px ${confirmColor}55`
            }}
          >
            <Trash2 size={15} /> {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
