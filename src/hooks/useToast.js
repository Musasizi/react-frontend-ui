/**
 * hooks/useToast.js — Shared toast notification hook
 *
 * Returns:
 *   toast        – current toast state { open, message, severity, title }
 *   showToast()  – trigger a toast:  showToast('message', 'success'|'error'|'info'|'warning', 'optional title')
 *   hideToast()  – close the toast (called by the Toast component's onClose)
 *
 * Usage:
 *   const { toast, showToast, hideToast } = useToast();
 *   <Toast toast={toast} onClose={hideToast} />
 *   showToast('Chapter created!', 'success');
 */

import { useState, useCallback } from 'react';

export function useToast() {
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success',   // 'success' | 'error' | 'info' | 'warning'
        title: '',
    });

    const showToast = useCallback((message, severity = 'success', title = '') => {
        setToast({ open: true, message, severity, title });
    }, []);

    const hideToast = useCallback(() => {
        setToast(t => ({ ...t, open: false }));
    }, []);

    return { toast, showToast, hideToast };
}
