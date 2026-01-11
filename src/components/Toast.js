export const showToast = (message, type = 'success') => {
  // Remove existing toast if any
  const existingToast = document.getElementById('toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : '❌';

  toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => toast.classList.add('visible'), 10);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Add styles to document
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        background: white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 4px solid var(--primary-color);
        max-width: 400px;
    }
    
    .toast.visible {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast-success {
        border-left-color: var(--success-color);
    }
    
    .toast-error {
        border-left-color: var(--danger-color);
    }
    
    .toast-icon {
        font-size: 1.25rem;
    }
    
    .toast-message {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    @media (max-width: 768px) {
        .toast {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);
