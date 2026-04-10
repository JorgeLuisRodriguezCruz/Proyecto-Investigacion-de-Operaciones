import { createTheme } from '@mui/material/styles'
import { colors } from './colors'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.background,
      paper: colors.surface
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.titleColor
    },
    body1: {
      fontSize: '1rem'
    }
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.surface,
          color: colors.textSecondary,
          fontSize: '0.875rem',
          border: `1px solid ${colors.border}`,
          borderRadius: '4px'
        }
      }
    }
  }
})

export default theme
