import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import Menu from './components/Menu/Menu'
import OptimalBSTPage from './components/ABB/OptimalBSTPage'
import { colors } from './theme/colors'

const SCREEN = {
  MENU: 'menu',
  OBST: 'obst'
}

function App() {
  const [screen, setScreen] = useState(SCREEN.MENU)

  const handleMenuSelect = (title) => {
    if (title === 'Árboles Binarios de Búsqueda Óptimos') {
      setScreen(SCREEN.OBST)
      return
    }

    window.alert('Esta opción del menú aún no está implementada.')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: screen === SCREEN.MENU ? 'center' : 'flex-start',
        backgroundColor: colors.background,
        padding: '2rem'
      }}
    >
      <Typography
        variant="h1"
        sx={{
          marginBottom: screen === SCREEN.MENU ? '5rem' : '2rem',
          textAlign: 'center'
        }}
      >
        Algoritmos de Programación Dinámica
      </Typography>

      {screen === SCREEN.MENU ? (
        <Menu onSelect={handleMenuSelect} />
      ) : (
        <OptimalBSTPage onBack={() => setScreen(SCREEN.MENU)} />
      )}

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