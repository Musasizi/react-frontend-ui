/**
 * components/Toast.jsx — UCU-Branded Toast Notification
 *
 * A polished Snackbar that slides up from the bottom-right corner.
 * Supports four severities: success (green), error (red), info (blue), warning (gold).
 * The UCU maroon accent bar on the left gives it a branded feel.
 *
 * PROPS:
 *   toast   – { open, message, severity, title } — from useToast()
 *   onClose – function to close the toast — pass hideToast from useToast()
 *
 * USAGE:
 *   import Toast from '../components/Toast';
 *   import { useToast } from '../hooks/useToast';
 *
 *   const { toast, showToast, hideToast } = useToast();
 *   showToast('Chapter saved!', 'success', 'Done');
 *   <Toast toast={toast} onClose={hideToast} />
 */

import { Snackbar, Alert, AlertTitle, Slide, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Animate the toast sliding up from the bottom
function SlideUp(props) {
    return <Slide {...props} direction="up" />;
}

// Map severity → icon
const ICONS = {
    success: <CheckCircleOutlineIcon fontSize="small" />,
    error: <ErrorOutlineIcon fontSize="small" />,
    info: <InfoOutlinedIcon fontSize="small" />,
    warning: <WarningAmberIcon fontSize="small" />,
};

// Map severity → left-border accent colour (UCU maroon for success, standard for rest)
const ACCENTS = {
    success: '#7B1C1C',   // UCU maroon
    error: '#D32F2F',
    info: '#0288D1',
    warning: '#C9A227',   // UCU gold
};

export default function Toast({ toast, onClose }) {
    const { open, message, severity = 'success', title } = toast;

    return (
        <Snackbar
            open={open}
            autoHideDuration={3500}
            onClose={(_, reason) => {
                // Don't close when user accidentally clicks outside
                if (reason === 'clickaway') return;
                onClose();
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            slots={{ transition: SlideUp }}
            sx={{ mb: 2, mr: 1 }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                icon={ICONS[severity]}
                variant="filled"
                sx={{
                    minWidth: 300,
                    maxWidth: 420,
                    borderRadius: 2.5,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                    borderLeft: `5px solid ${ACCENTS[severity]}`,
                    // Override filled background to be slightly softer
                    ...(severity === 'success' && {
                        bgcolor: '#1B4332',
                    }),
                    ...(severity === 'warning' && {
                        bgcolor: '#7B4F00',
                    }),
                    '& .MuiAlert-message': { width: '100%' },
                    '& .MuiAlert-icon': { alignItems: 'center' },
                }}
            >
                {title && (
                    <AlertTitle sx={{ fontWeight: 800, fontSize: 14, mb: 0.25, lineHeight: 1.2 }}>
                        {title}
                    </AlertTitle>
                )}
                <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                    {message}
                </Typography>

                {/* Subtle UCU progress bar that shrinks as the toast auto-hides */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0, left: 0,
                        height: 3,
                        bgcolor: 'rgba(255,255,255,0.35)',
                        borderRadius: '0 0 10px 10px',
                        width: '100%',
                        animation: open ? 'toastProgress 3.5s linear forwards' : 'none',
                        '@keyframes toastProgress': {
                            from: { width: '100%' },
                            to: { width: '0%' },
                        },
                    }}
                />
            </Alert>
        </Snackbar>
    );
}
