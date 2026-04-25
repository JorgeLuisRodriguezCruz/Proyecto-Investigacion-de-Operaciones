import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import Menu from './components/Menu/Menu'
import MultiplicacionMatrices from './components/MultiplicaciondeMatrices/MultiplicaciondeMatrices.jsx'
import ReemplazoEquipos from './components/ReemplazoEquipos/ReemplazoEquipos.jsx'
import { colors } from './theme/colors'

function App() {
  const [selectedModule, setSelectedModule] = useState(null)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: selectedModule ? 'flex-start' : 'center',
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

      {selectedModule === 'Multiplicación de Matrices' ? (
        <MultiplicacionMatrices onBack={() => setSelectedModule(null)} />
      ) : selectedModule === 'Reemplazo de Equipos' ? (
        <ReemplazoEquipos onBack={() => setSelectedModule(null)} />
      ) : (
        <Menu onSelect={setSelectedModule} />
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