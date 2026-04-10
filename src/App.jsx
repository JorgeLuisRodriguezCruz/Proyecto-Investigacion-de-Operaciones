import { Box, Typography } from '@mui/material'
import Menu from './components/Menu/Menu'
import { colors } from './theme/colors'

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: '2rem'
      }}
    >
      <Typography
        variant="h1"
        sx={{
          marginBottom: '5rem',
          textAlign: 'center'
        }}
      >
        Algoritmos de Programación Dinámica
      </Typography>

      <Menu />

      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: '1rem',
          color: colors.footerText,
          fontSize: '0.875rem'
        }}
      >
        2026 - Programación Dinámica
      </Box>
    </Box>
  )
}

export default App
