import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { colors } from './theme/colors'
import Menu from './components/Menu/Menu'
import MultiplicacionMatrices from './components/MultiplicaciondeMatrices/MultiplicaciondeMatrices.jsx'
import OptimalBSTPage from './components/ABB/OptimalBSTPage'
import SeriesDeportivas from './components/MenuSeriesDeportivas/SeriesDeportivas.jsx'
import ReemplazoEquipos from './components/ReemplazoEquipos/ReemplazoEquipos.jsx'

const SCREEN = {
  MENU: 'menu',
  OBST: 'obst',
  MATRICES: 'matrices',
  REEMPLAZO: 'reemplazo'
}

function App() {
  const [screen, setScreen] = useState(SCREEN.MENU)

  const handleMenuSelect = (title) => {
    if (title === 'Reemplazo de Equipos') {
      setScreen(SCREEN.REEMPLAZO)
      return
    }

    if (title === 'Árboles Binarios de Búsqueda Óptimos') {
      setScreen(SCREEN.OBST)
      return
    }

    if (title === 'Multiplicación de Matrices') {
      setScreen(SCREEN.MATRICES)
      return
    }

    if (title === 'Series Deportivas') {
      setScreen(SCREEN.SERIES)
      return
    }

    window.alert('Esta opción del menú aún no está implementada.')
  }

  const handleBack = () => {
    setScreen(SCREEN.MENU)
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
        padding: '2rem',
        paddingBottom: '5rem'
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

      {screen === SCREEN.MENU && (
        <Menu onSelect={handleMenuSelect} />
      )}

      {screen === SCREEN.REEMPLAZO && (
        <ReemplazoEquipos onBack={handleBack} />
      )}

      {screen === SCREEN.OBST && (
        <OptimalBSTPage onBack={handleBack} />
      )}

      {screen === SCREEN.SERIES && (
        <SeriesDeportivas onBack={handleBack} />
      )}

      {screen === SCREEN.MATRICES && (
        <MultiplicacionMatrices onBack={handleBack} />
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