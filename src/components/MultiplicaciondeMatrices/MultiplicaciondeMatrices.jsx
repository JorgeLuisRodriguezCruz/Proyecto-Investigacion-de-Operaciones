import { useState } from 'react'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography
} from '@mui/material'

// Modulo de Multiplicacion Optima de Matrices
function MultiplicacionMatrices({ onBack }) {

  // Para guardar la cantidad de matrices
  const [n, setN] = useState(4)

  // Para guardar las de dimensiones
  const [dims, setDims] = useState([5, 2, 3, 4, 6])

  // Para guardar el resultado final
  const [result, setResult] = useState(null)

  // Para mostrar mensajes de error
  const [error, setError] = useState('')

  // Para manejar el cambio en el número de matrices (n)
  const handleNChange = (e) => {
    const value = Number(e.target.value)

    // Si el valor es vacio o menor que 1 limpia los estados
    if (!value || value < 1) {
      setN('')
      setDims([])
      setResult(null)
      return
    }

    // Si el valor es mayor que 10 muestra error y no continua
    if (value > 10) {
      setError('El numero de matrices (n) no puede ser mayor que 10.')
      return
    }

    // Limpia errores si el valor es valido
    setError('')
    setN(value)

    // Para crear un nuevo arreglo de dimensiones de tamaño n + 1
    const newDims = Array(value + 1).fill('')

    // Para copiar las dimensiones que ya existian, si caben en el nuevo tamaño
    for (let i = 0; i < Math.min(dims.length, value + 1); i++) {
      newDims[i] = dims[i]
    }

    // Actualiza dimensiones y limpia resultado anterior
    setDims(newDims)
    setResult(null)
  }

  // Para manejar el cambio de una dimension especifica del arreglo dims
  const handleDimChange = (index, value) => {
    const newDims = [...dims]
    newDims[index] = value === '' ? '' : Number(value)
    setDims(newDims)
    setResult(null)
  }

  // ALGORITMO PARA MULTILICACION DE MATRICES
  const matrixChainOrder = (dimensions) => {
    // size = cantidad de matrices
    const size = dimensions.length - 1

    // Tabla M: guarda el costo minimo de multiplicación entre i y j
    const M = Array.from({ length: size + 1 }, () =>
      Array(size + 1).fill('')
    )

    // Tabla P: guarda el valor de k donde se debe partir el problema
    const P = Array.from({ length: size + 1 }, () =>
      Array(size + 1).fill('')
    )

    // Caso base: multiplicar una sola matriz cuesta 0
    for (let i = 1; i <= size; i++) {
      M[i][i] = 0
      P[i][i] = 0
    }

    // len representa la longitud de la cadena de matrices
    for (let len = 2; len <= size; len++) {
      // i es el inicio de la subcadena
      for (let i = 1; i <= size - len + 1; i++) {
        // j es el final de la subcadena
        const j = i + len - 1

        // Inicializa con infinito para buscar el minimo
        M[i][j] = Number.POSITIVE_INFINITY

        // Probar todas las particiones posibles entre i y j
        for (let k = i; k <= j - 1; k++) {
          // Formula del costo:
          // costo de la izquierda + costo de la derecha + costo de multiplicar ambos resultados
          const cost =
            M[i][k] +
            M[k + 1][j] +
            dimensions[i - 1] * dimensions[k] * dimensions[j]

          // Si encontramos un costo menor actualizamos M y guardamos k en P
          if (cost < M[i][j]) {
            M[i][j] = cost
            P[i][j] = k
          }
        }
      }
    }

    // Funcion recursiva para reconstruir la parentizacion optima
    const buildParenthesization = (tableP, i, j) => {
      // Si solo hay una matriz se devuelve Ai
      if (i === j) return `A${i}`

      // Obtener el punto de corte k
      const k = tableP[i][j]

      // Construir recursivamente izquierda y derecha
      return `(${buildParenthesization(tableP, i, k)} ${buildParenthesization(tableP, k + 1, j)})`
    }

    // Retornar toda la informacion calculada
    return {
      M,
      P,
      minCost: M[1][size],
      optimalOrder: buildParenthesization(P, 1, size)
    }
  }

  // Valida datos y ejecuta el algoritmo
  const handleSolve = () => {
    setError('')

    // Validar n
    if (!n || n < 1 || n > 10) {
      setError('Ingrese un número de matrices válido entre 1 y 10.')
      return
    }

    // Validar que existan exactamente n + 1 dimensiones
    if (dims.length !== n + 1) {
      setError('Debe ingresar exactamente n + 1 dimensiones.')
      return
    }

    // Validar que todas las dimensiones sean enteros positivos
    for (let i = 0; i < dims.length; i++) {
      if (dims[i] === '' || Number.isNaN(dims[i]) || dims[i] <= 0) {
        setError('Todas las dimensiones deben ser enteros positivos.')
        return
      }
    }

    // Si todo esta bien, calcula el resultado
    setResult(matrixChainOrder(dims))
  }

  // Para guardar la informacion del problema y los resultados en un archivo .txt
  const handleSaveFile = () => {
    // No se puede guardar si todavía no se ha resuelto
    if (!result) {
      setError('Primero debes resolver el problema antes de guardar el archivo.')
      return
    }

    // Formatea una tabla (M o P) para que se vea bonita en el .txt
    const formatTable = (table, title) => {
      const size = table.length - 1

      // Convertir la tabla en texto reemplazando espacios vacíos por '-'
      const matrixData = []
      for (let i = 1; i <= size; i++) {
        const row = []
        for (let j = 1; j <= size; j++) {
          row.push(j < i || table[i][j] === '' ? '-' : String(table[i][j]))
        }
        matrixData.push(row)
      }

      // Ancho del encabezado de filas
      const rowHeaderWidth = Math.max(String(size).length, 3)

      // Calcular el ancho maximo de cada columna
      const colWidths = []

      for (let j = 0; j < size; j++) {
        let maxWidth = String(j + 1).length
        for (let i = 0; i < size; i++) {
          maxWidth = Math.max(maxWidth, matrixData[i][j].length)
        }
        colWidths.push(maxWidth)
      }

      // Centra un texto dentro de un ancho dado
      const padCenter = (text, width) => {
        const str = String(text)
        const total = width - str.length
        const left = Math.floor(total / 2)
        const right = total - left
        return ' '.repeat(left) + str + ' '.repeat(right)
      }

      // Construye la linea de borde superior/inferior
      const makeBorder = () => {
        let line = '+'
        line += '-'.repeat(rowHeaderWidth + 2) + '+'
        for (let j = 0; j < size; j++) {
          line += '-'.repeat(colWidths[j] + 2) + '+'
        }
        return line
      }

      let output = `${title}\n`
      const border = makeBorder()

      output += border + '\n'

      // Encabezado
      output += `| ${padCenter('i/j', rowHeaderWidth)} |`
      for (let j = 0; j < size; j++) {
        output += ` ${padCenter(j + 1, colWidths[j])} |`
      }
      output += '\n'

      output += border + '\n'

      // Filas de la tabla
      for (let i = 0; i < size; i++) {
        output += `| ${padCenter(i + 1, rowHeaderWidth)} |`
        for (let j = 0; j < size; j++) {
          output += ` ${padCenter(matrixData[i][j], colWidths[j])} |`
        }
        output += '\n'
      }

      output += border
      return output
    }

    // Lo que se imprime siempre en el archivo .txt
    const contenido =
`Numero de matrices = ${n}
-----------------------------------------------
Dimensiones = ${dims.join(',')}
-----------------------------------------------
Costo Mínimo = ${result.minCost}
-----------------------------------------------
Como multiplicarlo = ${result.optimalOrder}
-----------------------------------------------

${formatTable(result.M, 'Tabla M')}
-----------------------------------------------

${formatTable(result.P, 'Tabla P')}`

    // Para crear un blob de texto plano
    const blob = new Blob([contenido], {
      type: 'text/plain'
    })

    // Para crear un URL temporal y descargar el archivo
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Ejemplo Multiplicacion de Matrices.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Para cargar un archivo en formato .txt y extraer el numero de matrices y dimensiones
  const handleLoadFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').map((line) => line.trim())

        let newN = null
        let newDims = null

        // Para buscar las lineas clave dentro del archivo
        for (const line of lines) {
          if (line.startsWith('Numero de matrices =')) {
            newN = Number(line.split('=')[1].trim())
          }

          if (line.startsWith('Dimensiones =')) {
            newDims = line
              .split('=')[1]
              .split(',')
              .map((x) => Number(x.trim()))
          }
        }

        // Para validar que el archivo tenga la informacion correcta
        if (
          !newN ||
          !Array.isArray(newDims) ||
          newDims.length !== newN + 1 ||
          newDims.some((x) => Number.isNaN(x) || x <= 0)
        ) {
          setError('Archivo inválido, le faltan dimensiones o tiene dimensiones demas.')
          return
        }

        // Para cargar datos del archivo al estado
        setN(newN)
        setDims(newDims)
        setResult(null)
        setError('')
      } catch {
        setError('No se pudo leer el archivo.')
      }
    }

    reader.readAsText(file)
  }

  // Para renderizar la tabla HTML para mostrar las tablas M y P en la pantalla
  const renderTable = (table, title) => {
    if (!table) return null

    const size = table.length - 1

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              backgroundColor: 'white'
            }}
          >
            <tbody>
              <tr>
                <th style={cellStyle}>i\j</th>
                {Array.from({ length: size }, (_, idx) => (
                  <th key={idx + 1} style={cellStyle}>
                    {idx + 1}
                  </th>
                ))}
              </tr>

              {Array.from({ length: size }, (_, rowIdx) => {
                const i = rowIdx + 1
                return (
                  <tr key={i}>
                    <th style={cellStyle}>{i}</th>
                    {Array.from({ length: size }, (_, colIdx) => {
                      const j = colIdx + 1
                      const value =
                        j < i || table[i][j] === '' ? '-' : table[i][j]

                      return (
                        <td key={j} style={cellStyle}>
                          {value}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    )
  }

  // Interfaz grafica del MdM
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto'
      }}
    >
      {/* Boton para volver al menu principal */}
      <Button variant="outlined" onClick={onBack} sx={{ mb: 3 }}>
        Volver al menú
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Multiplicación Óptima de Matrices
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Ingrese el número de matrices y luego las dimensiones d0...dn
        </Typography>

        {/* Campo para ingresar el numero de matrices */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Número de matrices (n)"
            type="number"
            inputProps={{ min: 1, max: 10 }}
            value={n}
            onChange={handleNChange}
            sx={{
              width: '206px'
            }}
          />
        </Box>

        {/* Campos para ingresar las dimensiones */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dimensiones
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3
          }}
        >
          {Array.from({ length: Number(n) + 1 || 0 }, (_, idx) => (
            <TextField
              key={idx}
              label={`d${idx}`}
              type="number"
              inputProps={{ min: 1 }}
              value={dims[idx] ?? ''}
              onChange={(e) => handleDimChange(idx, e.target.value)}
            />
          ))}
        </Box>

        {/* Botones principales del menu */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button variant="contained" onClick={handleSolve}>
            Resolver
          </Button>

          <Button variant="contained" color="success" onClick={handleSaveFile}>
            Guardar archivo
          </Button>

          <Button variant="contained" component="label" color="secondary">
            Cargar archivo
            <input
              type="file"
              accept=".txt"
              hidden
              onChange={handleLoadFile}
            />
          </Button>
        </Box>

        {error && (
          <Typography sx={{ color: 'error.main', fontWeight: 'bold', mb: 2 }}>
            {error}
          </Typography>
        )}

        {result && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#eef6ff', color: 'black' }}>
            <Typography variant="h6">
              Costo mínimo: {result.minCost}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Como multiplicarlo: {result.optimalOrder}
            </Typography>
          </Paper>
        )}

        {result && renderTable(result.M, 'Tabla M')}
        {result && renderTable(result.P, 'Tabla P')}
      </Paper>
    </Box>
  )
}

// Estilo para las celdas de las tablas M y P
const cellStyle = {
  border: '1px solid #999',
  padding: '10px',
  textAlign: 'center',
  minWidth: '50px',
  color: 'black'
}

export default MultiplicacionMatrices