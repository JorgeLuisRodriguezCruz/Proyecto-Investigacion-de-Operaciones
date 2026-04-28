import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { colors } from '../../theme/colors'

// Solo se permiten valores impares para n (un número par de juegos puede terminar en empate)
const OPCIONES_N = [1, 3, 5, 7, 9, 11]

/* ============================================================
   MÓDULO: Series Deportivas
   Calcula Tabla[i][j] = P(A gana la serie | A necesita i vic., B necesita j vic.)
   Fórmula: Tabla[i][j] = p * Tabla[i-1][j] + q * Tabla[i][j-1]
     p = prob. de que A gane el juego actual (ph si A es local, pr si A es visita)
     q = 1 - p = prob. de que B gane el juego actual
   Casos base:
     Tabla[0][j] = 1  para j >= 1  (A ya ganó la serie)
     Tabla[i][0] = 0  para i >= 1  (B ya ganó la serie)
     Tabla[0][0] = indefinido / sin sentido
   ============================================================ */
function SeriesDeportivas({ onBack }) {

  // Número máximo de juegos de la serie
  const [n, setN] = useState(7)

  // Modo de cálculo si considerar o no la diferencia entre jugar en casa y de visita (usa ph y pr)
  const [usarLocalVisita, setUsarLocalVisita] = useState(true)

  // Probabilidad de que el equipo A gane cuando juega en casa
  const [ph, setPh] = useState('0.60')

  // Probabilidad de que el equipo A gane cuando juega de visita
  const [pr, setPr] = useState('0.40')

  // Probabilidad única de que A gane cualquier juego (modo sin diferencia casa/visita)
  const [p, setP] = useState('0.60')

  // Formato de la serie: formato[k] = true  → A es LOCAL en el juego k+1
  //                      formato[k] = false → A es VISITA en el juego k+1
  const [formato, setFormato] = useState(Array(7).fill(true))

  // Resultado del cálculo almacenado tras ejecutar el algoritmo
  const [resultado, setResultado] = useState(null)

  // Mensaje de error para mostrar al usuario
  const [error, setError] = useState('')

  // Victorias necesarias para ganar la serie: m = ⌊n/2⌋ + 1
  const m = Math.floor(n / 2) + 1

  /* =======================================================
     Actualiza n y redimensiona el arreglo de formato,
     conservando las posiciones que ya existían
     ======================================================= */
  const handleNChange = (e) => {
    const nuevoN = Number(e.target.value)
    setN(nuevoN)

    const nuevoM = Math.floor(nuevoN / 2) + 1

    const nuevoFormato = Array(nuevoN).fill(true)
    for (let k = 0; k < Math.min(formato.length, nuevoN); k++) {
      nuevoFormato[k] = formato[k]
    }

    setFormato(nuevoFormato)
    setResultado(null)
    setError('')
  }

  // Alterna si el juego k es local (true) o visita (false) para el equipo A
  const toggleJuego = (k) => {
    const nuevoFormato = [...formato]
    nuevoFormato[k] = !nuevoFormato[k]
    setFormato(nuevoFormato)
    setResultado(null)
  }

  /* ============================================================
     Algoritmo: Cálculo de probabilidades de la serie
    
     El número de juego en el estado (i, j) es determinístico:
       numJuego = 2m - i - j + 1
     Esto permite saber si A es local o visita en ese juego
     consultando formato[numJuego - 1].
     ============================================================ */
  const calcularSerie = () => {
    setError('')

    // Validar las probabilidades según el modo activo
    if (usarLocalVisita) {
      const phNum = Number(ph)
      const prNum = Number(pr)

      if (isNaN(phNum) || phNum < 0 || phNum > 1) {
        setError('La probabilidad ph debe ser un número entre 0 y 1.')
        return
      }
      if (isNaN(prNum) || prNum < 0 || prNum > 1) {
        setError('La probabilidad pr debe ser un número entre 0 y 1.')
        return
      }
    } else {
      const pNum = Number(p)
      if (isNaN(pNum) || pNum < 0 || pNum > 1) {
        setError('La probabilidad p debe ser un número entre 0 y 1.')
        return
      }
    }

    // Inicializar Tabla como matriz (m+1) x (m+1) con null
    const Tabla = Array.from({ length: m + 1 }, () => Array(m + 1).fill(null)) // map()

    // Caso base: A ya ganó la serie (i = 0) → probabilidad = 1
    for (let j = 1; j <= m; j++) Tabla[0][j] = 1

    // Caso base: B ya ganó la serie (j = 0) → probabilidad = 0
    for (let i = 1; i <= m; i++) Tabla[i][0] = 0

    const q = usarLocalVisita ? null : 1 - Number(p) // B, sin diferencia de localía
    const qh = usarLocalVisita ? 1 - Number(pr) : null // B gana en casa
    const qr = usarLocalVisita ? 1 - Number(ph) : null // B gana de visita

    // Llenar la tabla usando la recurrencia (de i=1 a m, de j=1 a m)
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= m; j++) {
        // Recurrencia: Tabla[i][j] = p * Tabla[i-1][j] + q * Tabla[i][j-1]
        let pJuego, qJuego
        if (q === null) {
          const esLocal = formato[2*m-i-j] // ver si A es local o visita en este juego
          pJuego = esLocal ? Number(ph) : Number(pr) // true = A juega en casa
          qJuego = esLocal ? qr : qh
        } else {
          pJuego = Number(p)
          qJuego = q
        }
        Tabla[i][j] = pJuego * Tabla[i - 1][j] + qJuego * Tabla[i][j - 1]
      }
    }

    // La respuesta es Tabla[m][m]: probabilidad de que A gane la serie desde el inicio
    setResultado({ Tabla, m, n, probGanar: Tabla[m][m] })
  }

  /* ============================================================
     Guardar Archivo .txt
     ============================================================ */
  const handleGuardarArchivo = () => {
    if (!resultado) {
      setError('Primero debes resolver el problema antes de guardar el archivo.')
      return
    }

    const formatearTabla = (Tabla, mVal) => {
      const datos = []
      for (let i = 0; i <= mVal; i++) {
        const fila = []
        for (let j = 0; j <= mVal; j++) {
          if (i === 0 && j === 0) fila.push('-')
          else fila.push(Tabla[i][j].toFixed(4))
        }
        datos.push(fila)
      }

      const anchoFila = 3
      const anchosCols = 6

      const centrar = (texto, ancho) => {
        const str = String(texto)
        const total = ancho - str.length
        const izq = Math.floor(total / 2)
        return ' '.repeat(izq) + str + ' '.repeat(total - izq)
      }

      // Líneas de la tabla
      const borde = '+' + '-'.repeat(anchoFila + 2) + '+' + Array(mVal + 1).fill('-'.repeat(anchosCols + 2) + '+').join('')
      let salida = 'Tabla[i][j] - Probabilidad de que A gane la serie\n' + borde + '\n'
      salida += `| ${centrar('i/j', anchoFila)} |`
      for (let j = 0; j <= mVal; j++) salida += ` ${centrar(j, anchosCols)} |`
      salida += '\n' + borde + '\n'

      // Líneas de datos
      for (let i = 0; i <= mVal; i++) {
        salida += `| ${centrar(i, anchoFila)} |`
        for (let j = 0; j <= mVal; j++) salida += ` ${centrar(datos[i][j], anchosCols)} |`
        salida += '\n'
      }

      return salida + borde // devuelve el formato listo y termina de cerrar la tabla
    }

    let contenido = `Número máximo de juegos = ${n}\n-----------------------------------------------\n`
    contenido += `Modo = ${usarLocalVisita ? 'con diferencia casa/visita' : 'sin diferencia casa/visita'}\n-----------------------------------------------\n`

    if (usarLocalVisita) {
      contenido += `Probabilidad A en casa (ph) = ${ph}\n-----------------------------------------------\n`
      contenido += `Probabilidad A de visita (pr) = ${pr}\n-----------------------------------------------\n`
      contenido += `Formato (1=local, 0=visita) = ${formato.map(e => e ? '1' : '0').join(',')}\n-----------------------------------------------\n`
    } else {
      contenido += `Probabilidad p = ${p}\n-----------------------------------------------\n`
    }

    contenido += `Victorias necesarias = ${resultado.m}\n-----------------------------------------------\n`
    contenido += `Probabilidad de que A gane la serie = ${resultado.probGanar.toFixed(4)}\n-----------------------------------------------\n\n`
    contenido += formatearTabla(resultado.Tabla, resultado.m)

    // Crear un Blob de texto plano, generar URL temporal y crear la descarga
    const blob = new Blob([contenido], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Ejemplo Series Deportivas.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ============================================================
  // Cargar Archivo .txt
  // ============================================================
  const handleCargarArchivo = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    const lector = new FileReader()
    lector.onload = (evento) => {
      try {
        const lineas = evento.target.result.split('\n').map(l => l.trim())

        // Variables para almacenar los valores encontrados en el archivo
        let nuevoN = null, nuevoModo = null, nuevoPh = null, nuevoPr = null, nuevoP = null, nuevoFormato = null

        // Buscar cada valor para las variables identificando su línea
        for (const linea of lineas) {
          if (linea.startsWith('Número máximo de juegos ='))
            nuevoN = Number(linea.split('=')[1].trim())
          if (linea.startsWith('Modo ='))
            nuevoModo = linea.split('=')[1].trim().includes('sin') ? 'sin' : 'con'
          if (linea.startsWith('Probabilidad A en casa (ph) ='))
            nuevoPh = Number(linea.split('=')[1].trim())
          if (linea.startsWith('Probabilidad A de visita (pr) ='))
            nuevoPr = Number(linea.split('=')[1].trim())
          if (linea.startsWith('Probabilidad p ='))
            nuevoP = Number(linea.split('=')[1].trim())
          if (linea.startsWith('Formato (1=local, 0=visita) =')) {
            const valor = linea.substring('Formato (1=local, 0=visita) ='.length).trim()
            nuevoFormato = valor.split(',').map(x => x.trim() === '1')
          }
        }

        if (nuevoN === null || isNaN(nuevoN) || nuevoN < 1 || nuevoN > 11 || nuevoN % 2 === 0) {
          setError('Archivo inválido: n debe ser un entero impar entre 1 y 11.')
          return
        }

        if (nuevoModo === null) {
          setError('Archivo inválido: no se encontró el modo de cálculo (con o sin diferencia casa/visita).')
          return
        }

        // Si hay diferencia casa/visita, validar ph, pr y formato. Si no, validar p
        if (nuevoModo === 'con') {
          if (nuevoPh === null || isNaN(nuevoPh) || nuevoPh < 0 || nuevoPh > 1) {
            setError('Archivo inválido: ph faltante o fuera de rango.'); return
          }
          if (nuevoPr === null || isNaN(nuevoPr) || nuevoPr < 0 || nuevoPr > 1) {
            setError('Archivo inválido: pr faltante o fuera de rango.'); return
          }
          if (!Array.isArray(nuevoFormato) || nuevoFormato.length !== nuevoN) {
            setError(`Archivo inválido: el formato debe tener ${nuevoN} entradas.`); return
          }
          setN(nuevoN); setPh(String(nuevoPh)); setPr(String(nuevoPr))
          setFormato(nuevoFormato); setUsarLocalVisita(true)
        } else {
          if (nuevoP === null || isNaN(nuevoP) || nuevoP < 0 || nuevoP > 1) {
            setError('Archivo inválido: p faltante o fuera de rango.'); return
          }
          setN(nuevoN); setP(String(nuevoP))
          setFormato(Array(nuevoN).fill(true)); setUsarLocalVisita(false)
        }

        setResultado(null); setError('')
      } catch {
        setError('No se pudo leer el archivo.')
      }
    }
    lector.readAsText(archivo) // Limpiar el input para permitir cargar el mismo archivo nuevamente si se desea
  }

  // ============================================================
  // Renderizar la tabla de probabilidades
  // ============================================================
  const renderTabla = (Tabla, mVal) => {
    if (!Tabla) return null
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Tabla[i][j]</Typography>
        <Typography sx={{ mb: 2, color: colors.textSecondary, fontSize: '0.875rem' }}>
          i = victorias que le faltan a A &nbsp;·&nbsp; j = victorias que le faltan a B
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <tbody>
              <tr>
                <th style={estiloEncabezado}>i \ j</th>
                {Array.from({ length: mVal + 1 }, (_, j) => (
                  <th key={j} style={estiloEncabezado}>{j}</th>
                ))}
              </tr>
              {Array.from({ length: mVal + 1 }, (_, i) => (
                <tr key={i}>
                  <th style={estiloEncabezado}>{i}</th>
                  {Array.from({ length: mVal + 1 }, (_, j) => {
                    const sinSentido  = i === 0 && j === 0
                    const casoBase    = (i === 0 && j > 0) || (i > 0 && j === 0)
                    const esRespuesta = i === mVal && j === mVal
                    let contenido, bgColor, fontWeight, colorTexto
                    if (sinSentido) {
                      contenido = '-'; bgColor = '#e0e0e0'; fontWeight = 'normal'; colorTexto = '#999'
                    } else if (casoBase) {
                      contenido = Tabla[i][j].toFixed(4); bgColor = '#f5f5f5'; fontWeight = '600'; colorTexto = '#555'
                    } else if (esRespuesta) {
                      contenido = Tabla[i][j].toFixed(4); bgColor = '#fff9c4'; fontWeight = 'bold'; colorTexto = 'black'
                    } else {
                      contenido = Tabla[i][j].toFixed(4); bgColor = 'white'; fontWeight = 'normal'; colorTexto = 'black'
                    }
                    return (
                      <td key={j} style={{ ...estiloCelda, backgroundColor: bgColor, fontWeight, color: colorTexto }}>
                        {contenido}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      <Button variant="outlined" onClick={onBack} sx={{ mb: 3 }}>
        Volver al menú
      </Button>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Series Deportivas</Typography>
        <Typography sx={{ mb: 3 }}>
          Calcula la probabilidad de que el equipo A gane una serie deportiva usando
          programación dinámica. La serie se gana al alcanzar m = ⌊n/2⌋ + 1 victorias.
        </Typography>

        {/* Número máximo de juegos */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ width: '260px' }}>
            <InputLabel>Número máximo de juegos (n)</InputLabel>
            <Select value={n} label="Número máximo de juegos (n)" onChange={handleNChange}>
              {OPCIONES_N.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography sx={{ mt: 1, color: colors.textSecondary, fontSize: '0.875rem' }}>
            Victorias necesarias: <strong style={{ color: colors.textPrimary }}>{m}</strong>
          </Typography>
        </Box>

        {/* Toggle modo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Typography sx={{ color: usarLocalVisita ? colors.textSecondary : colors.textPrimary }}>
            Probabilidad única (p)
          </Typography>
          <Switch checked={usarLocalVisita} onChange={(e) => { setUsarLocalVisita(e.target.checked); setResultado(null) }} />
          <Typography sx={{ color: usarLocalVisita ? colors.textPrimary : colors.textSecondary }}>
            Diferencia casa / visita (ph, pr)
          </Typography>
        </Box>

        {/* Probabilidades */}
        {usarLocalVisita ? (
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Box>
              <TextField label="Prob. A en casa — ph" type="number" inputProps={{ min: 0, max: 1, step: 0.01 }}
                value={ph} onChange={(e) => { setPh(e.target.value); setResultado(null) }} sx={{ width: '220px' }} />
              {ph !== '' && !isNaN(Number(ph)) && Number(ph) >= 0 && Number(ph) <= 1 && (
                <Typography sx={{ mt: 0.5, color: colors.textSecondary, fontSize: '0.8rem' }}>
                  qr (B de visita) = {(1 - Number(ph)).toFixed(2)}
                </Typography>
              )}
            </Box>
            <Box>
              <TextField label="Prob. A de visita — pr" type="number" inputProps={{ min: 0, max: 1, step: 0.01 }}
                value={pr} onChange={(e) => { setPr(e.target.value); setResultado(null) }} sx={{ width: '220px' }} />
              {pr !== '' && !isNaN(Number(pr)) && Number(pr) >= 0 && Number(pr) <= 1 && (
                <Typography sx={{ mt: 0.5, color: colors.textSecondary, fontSize: '0.8rem' }}>
                  qh (B en casa) = {(1 - Number(pr)).toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <TextField label="Probabilidad de que A gane — p" type="number" inputProps={{ min: 0, max: 1, step: 0.01 }}
              value={p} onChange={(e) => { setP(e.target.value); setResultado(null) }} sx={{ width: '260px' }} />
            {p !== '' && !isNaN(Number(p)) && Number(p) >= 0 && Number(p) <= 1 && (
              <Typography sx={{ mt: 0.5, color: colors.textSecondary, fontSize: '0.8rem' }}>
                q (complemento) = {(1 - Number(p)).toFixed(2)}
              </Typography>
            )}
          </Box>
        )}

        {/* Formato de la serie */}
        {usarLocalVisita && n > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Formato de la serie</Typography>
            <Typography sx={{ mb: 2, color: colors.textSecondary, fontSize: '0.875rem' }}>
              Clic en cada juego para indicar si el Equipo A es{' '}
              <strong style={{ color: '#2e7d32' }}>L</strong>ocal o{' '}
              <strong style={{ color: '#c62828' }}>V</strong>isitante
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formato.map((esLocal, k) => (
                <Box key={k} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>J{k + 1}</Typography>
                  <Button onClick={() => toggleJuego(k)} sx={{
                    width: '44px', height: '44px', minWidth: '44px',
                    fontWeight: 'bold', fontSize: '0.875rem',
                    backgroundColor: esLocal ? '#2e7d32' : '#c62828',
                    color: '#ffffff', border: 'none',
                    '&:hover': { backgroundColor: esLocal ? '#388e3c' : '#d32f2f' }
                  }}>
                    {esLocal ? 'L' : 'V'}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button variant="contained" onClick={calcularSerie}>Resolver</Button>
          <Button variant="contained" color="success" onClick={handleGuardarArchivo}>Guardar archivo</Button>
          <Button variant="contained" component="label" color="secondary">
            Cargar archivo
            <input type="file" accept=".txt" hidden onChange={handleCargarArchivo} />
          </Button>
        </Box>

        {error && (
          <Typography sx={{ color: 'error.main', fontWeight: 'bold', mb: 2 }}>{error}</Typography>
        )}

        {resultado && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#eef6ff', color: 'black' }}>
            <Typography variant="h6">Victorias necesarias para ganar la serie: {resultado.m}</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Probabilidad de que A gane la serie: {(resultado.probGanar * 100).toFixed(2)}%
            </Typography>
          </Paper>
        )}

        {resultado && renderTabla(resultado.Tabla, resultado.m)}
      </Paper>
    </Box>
  )
}

const estiloCelda = {
  border: '1px solid #999', padding: '10px', textAlign: 'center', minWidth: '70px'
}

const estiloEncabezado = {
  border: '1px solid #999', padding: '10px', textAlign: 'center',
  minWidth: '50px', backgroundColor: '#e8e8e8', color: 'black', fontWeight: 'bold'
}

export default SeriesDeportivas