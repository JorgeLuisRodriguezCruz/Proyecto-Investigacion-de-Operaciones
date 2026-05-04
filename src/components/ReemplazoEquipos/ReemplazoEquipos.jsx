import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material'

function ReemplazoEquipos({ onBack }) {
  const [costoInicial, setCostoInicial] = useState(10000)
  const [plazoProyecto, setPlazoProyecto] = useState(10)
  const [vidaUtil, setVidaUtil] = useState(5)
  const [usarInflacion, setUsarInflacion] = useState(false)
  const [indiceInflacion, setIndiceInflacion] = useState(5)
  const [tablaDatos, setTablaDatos] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ejemplosAbierto, setEjemplosAbierto] = useState(false)
  const [indicePlanActual, setIndicePlanActual] = useState(0) 

  const [modoCarga, setModoCarga] = useState(false)  

  const ejemplosPrueba = [
    { nombre: 'Ejemplo hecho en clase', datos: { costoInicial: 500, plazoProyecto: 5, vidaUtil: 3, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 400, costoMantenimiento: 30 }, { tiempo: 2, precioRescate: 300, costoMantenimiento: 40 }, { tiempo: 3, precioRescate: 250, costoMantenimiento: 60 }] } },
    { nombre: 'Caso Básico Simple', datos: { costoInicial: 10000, plazoProyecto: 6, vidaUtil: 3, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 7000, costoMantenimiento: 1500 }, { tiempo: 2, precioRescate: 5000, costoMantenimiento: 1800 }, { tiempo: 3, precioRescate: 3500, costoMantenimiento: 2200 }] } },
    { nombre: 'Caso con Inflación', datos: { costoInicial: 10000, plazoProyecto: 8, vidaUtil: 4, usarInflacion: true, indiceInflacion: 5, tablaDatos: [{ tiempo: 1, precioRescate: 7000, costoMantenimiento: 1500 }, { tiempo: 2, precioRescate: 5000, costoMantenimiento: 1800 }, { tiempo: 3, precioRescate: 3500, costoMantenimiento: 2200 }, { tiempo: 4, precioRescate: 2500, costoMantenimiento: 2800 }] } },
    { nombre: 'Plazo Largo - Vida Corta', datos: { costoInicial: 15000, plazoProyecto: 12, vidaUtil: 3, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 10000, costoMantenimiento: 2000 }, { tiempo: 2, precioRescate: 7000, costoMantenimiento: 2500 }, { tiempo: 3, precioRescate: 4500, costoMantenimiento: 3200 }] } },
    { nombre: 'Alta Inflación', datos: { costoInicial: 20000, plazoProyecto: 10, vidaUtil: 5, usarInflacion: true, indiceInflacion: 10, tablaDatos: [{ tiempo: 1, precioRescate: 15000, costoMantenimiento: 2500 }, { tiempo: 2, precioRescate: 11000, costoMantenimiento: 3000 }, { tiempo: 3, precioRescate: 8000, costoMantenimiento: 3600 }, { tiempo: 4, precioRescate: 5500, costoMantenimiento: 4300 }, { tiempo: 5, precioRescate: 3500, costoMantenimiento: 5200 }] } },
    { nombre: 'Costo Inicial Bajo', datos: { costoInicial: 5000, plazoProyecto: 5, vidaUtil: 2, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 3500, costoMantenimiento: 800 }, { tiempo: 2, precioRescate: 2500, costoMantenimiento: 1000 }] } },
    { nombre: 'Equipo Durable', datos: { costoInicial: 25000, plazoProyecto: 15, vidaUtil: 7, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 18000, costoMantenimiento: 3000 }, { tiempo: 2, precioRescate: 13000, costoMantenimiento: 3500 }, { tiempo: 3, precioRescate: 9500, costoMantenimiento: 4100 }, { tiempo: 4, precioRescate: 7000, costoMantenimiento: 4800 }, { tiempo: 5, precioRescate: 5000, costoMantenimiento: 5600 }, { tiempo: 6, precioRescate: 3500, costoMantenimiento: 6500 }, { tiempo: 7, precioRescate: 2000, costoMantenimiento: 7500 }] } },
    { nombre: 'Multiples Reemplazos', datos: { costoInicial: 8000, plazoProyecto: 14, vidaUtil: 3, usarInflacion: true, indiceInflacion: 3, tablaDatos: [{ tiempo: 1, precioRescate: 5500, costoMantenimiento: 1200 }, { tiempo: 2, precioRescate: 3800, costoMantenimiento: 1500 }, { tiempo: 3, precioRescate: 2500, costoMantenimiento: 1900 }] } },
    { nombre: 'Caso Optimista', datos: { costoInicial: 12000, plazoProyecto: 8, vidaUtil: 4, usarInflacion: false, indiceInflacion: 0, tablaDatos: [{ tiempo: 1, precioRescate: 9000, costoMantenimiento: 1000 }, { tiempo: 2, precioRescate: 7000, costoMantenimiento: 1200 }, { tiempo: 3, precioRescate: 5000, costoMantenimiento: 1500 }, { tiempo: 4, precioRescate: 3500, costoMantenimiento: 1800 }] } }
  ]

  useEffect(() => { 
    if (!modoCarga) { 
      inicializarTabla()
    }
  }, [vidaUtil])

  const inicializarTabla = () => {
    const nuevaTabla = []
    for (let i = 1; i <= vidaUtil; i++) {
      nuevaTabla.push({
        tiempo: i,
        precioRescate: Math.round(costoInicial * (1 - i * 0.15)),
        costoMantenimiento: Math.round(costoInicial * 0.15 * i)
      })
    }
    setTablaDatos(nuevaTabla)
  }

  useEffect(() => {   
    if (!modoCarga && usarInflacion && indiceInflacion > 0) {
      const nuevaTabla = []
      for (let i = 1; i <= vidaUtil; i++) {
        const factorInfla = Math.pow(1 + indiceInflacion / 100, i - 1)
        nuevaTabla.push({
          tiempo: i,
          precioRescate: Math.round(costoInicial * (1 - i * 0.15) * factorInfla),
          costoMantenimiento: Math.round(costoInicial * 0.15 * i * factorInfla)
        })
      }
      setTablaDatos(nuevaTabla)
    }
  }, [vidaUtil, usarInflacion, indiceInflacion])

  const handleCostoChange = (e) => {
    const value = Number(e.target.value)
    if (value > 0) {
      setCostoInicial(value)
      setResult(null)
    }
  }

  const handlePlazoChange = (e, value) => {
    setPlazoProyecto(value)
    setResult(null)
  }

  const handleVidaUtilChange = (e, value) => {
    if (value > 0 && value <= plazoProyecto) {
      setVidaUtil(value)
      setResult(null)
    }
  }

  const handleTableChange = (index, campo, value) => {
    const nuevaTabla = [...tablaDatos]
    nuevaTabla[index][campo] = value === '' ? 0 : Number(value)
    setTablaDatos(nuevaTabla)
    setResult(null)
  }

  const calcularCtx = useCallback((t, x, datos) => {
    const { costoInicial, tablaDatos, usarInflacion, indiceInflacion } = datos
    const duracion = x - t
    const inflactor = usarInflacion ? indiceInflacion / 100 : 0

    let mantenimientoAcumulado = 0
    for (let i = 1; i <= duracion; i++) {
      const factorInfla = Math.pow(1 + inflactor, t + i - 1)
      const costoMant = tablaDatos[i - 1]?.costoMantenimiento || 0
      mantenimientoAcumulado += costoMant * factorInfla
    }

    const factorInflaRescate = Math.pow(1 + inflactor, x - 1)
    const precioRescate = tablaDatos[duracion - 1]?.precioRescate || 0
    const precioRescateAjustado = precioRescate * factorInflaRescate

    const factorInflaCompra = Math.pow(1 + inflactor, t)
    const costoInicialAjustado = costoInicial * factorInflaCompra

    return costoInicialAjustado + mantenimientoAcumulado - precioRescateAjustado
  }, [])

  const algoritmoReemplazo = useCallback((datos) => {
    const { costoInicial, plazoProyecto: N, vidaUtil: V, tablaDatos, usarInflacion, indiceInflacion } = datos
    const N_num = Number(N)
    const V_num = Number(V)

    const G = Array(N_num + 1).fill(0).map(() => ({ costo: Number.POSITIVE_INFINITY, proxys: [] }))
    G[N_num] = { costo: 0, proxys: [N_num] }

    for (let t = N_num - 1; t >= 0; t--) {
      let menorCosto = Number.POSITIVE_INFINITY
      const proxysOptimos = []

      const maxX = Math.min(t + V_num, N_num)

      for (let x = t + 1; x <= maxX; x++) {
        const costoCtx = calcularCtx(t, x, datos)
        const costoTotal = costoCtx + G[x].costo

        if (costoTotal < menorCosto - 0.01) {
          menorCosto = costoTotal
          proxysOptimos.length = 0
          proxysOptimos.push(x)
        } else if (Math.abs(costoTotal - menorCosto) < 0.01) {
          proxysOptimos.push(x)
        }
      }

      G[t] = { costo: menorCosto, proxys: proxysOptimos }
    }

    const reconstruirPlanes = (t, caminoActual, planes) => {
      if (t === N_num) {
        planes.push([...caminoActual])
        return
      }

      const proxys = G[t].proxys
      for (const prox of proxys) {
        caminoActual.push(prox)
        reconstruirPlanes(prox, caminoActual, planes)
        caminoActual.pop()
      }
    }

    const planesOptimos = []
    reconstruirPlanes(0, [0], planesOptimos)

    const analisisPorPeriodo = []
    for (let t = 0; t <= N_num; t++) {
      analisisPorPeriodo.push({
        periodo: t,
        valorG: G[t].costo,
        proximosReemplazos: G[t].proxys
      })
    }

    return {
      costoMinimo: G[0].costo,
      tablaG: G,
      planesOptimos,
      analisisPorPeriodo
    }
  }, [calcularCtx])

  const handleSolve = () => {
    setError('')
    setLoading(true)

    if (!costoInicial || costoInicial <= 0) {
      setError('El costo inicial debe ser un número positivo.')
      setLoading(false)
      return
    }

    if (!plazoProyecto || plazoProyecto < 1 || plazoProyecto > 30) {
      setError('El plazo del proyecto debe estar entre 1 y 30 períodos.')
      setLoading(false)
      return
    }

    if (!vidaUtil || vidaUtil < 1 || vidaUtil > 10) {
      setError('La vida útil debe estar entre 1 y 10 períodos.')
      setLoading(false)
      return
    }

    if (vidaUtil > plazoProyecto) {
      setError('La vida útil no puede ser mayor que el plazo del proyecto.')
      setLoading(false)
      return
    }

    if (tablaDatos.length === 0) {
      setError('Debe completar la tabla de datos.')
      setLoading(false)
      return
    }

    for (let i = 0; i < tablaDatos.length; i++) {
      if (tablaDatos[i].precioRescate < 0 || tablaDatos[i].costoMantenimiento < 0) {
        setError('Los valores de precio de reventa y costo de mantenimiento deben ser positivos o cero.')
        setLoading(false)
        return
      }
    }

    if (usarInflacion && (indiceInflacion < 0 || indiceInflacion > 100)) {
      setError('El índice de inflación debe estar entre 0% y 100%.')
      setLoading(false)
      return
    }

    setTimeout(() => {
      const datos = {
        costoInicial,
        plazoProyecto,
        vidaUtil,
        usarInflacion,
        indiceInflacion,
        tablaDatos
      }

      const resultado = algoritmoReemplazo(datos)
      setResult(resultado)
      setIndicePlanActual(0)
      setLoading(false)
    }, 500)
  }

  const handleGuardarCaso = async () => {
    if (!result) {
      setError('Primero debe resolver el problema antes de guardar.')
      return
    }

    const contenido = `Tipo de Problema = Reemplazo de Equipos
-----------------------------------------------
Costo Inicial = ${costoInicial}
Plazo del Proyecto = ${plazoProyecto}
Vida Util = ${vidaUtil}
Usar Inflacion = ${usarInflacion ? 'Si' : 'No'}
Indice de Inflacion = ${indiceInflacion}%
-----------------------------------------------

Tabla de Datos:
Tiempo | Costo Mantenimiento | Precio de Venta
${tablaDatos.map(fila => `  ${fila.tiempo}    |       ${fila.costoMantenimiento}      |     ${fila.precioRescate}`).join('\n')}

-----------------------------------------------
RESULTADOS
-----------------------------------------------
Costo Minimo Total = ${result.costoMinimo.toFixed(2)}

Tabla G(t):
t | G(t) | Proximo Reemplazo
${result.analisisPorPeriodo.map(fila => `  ${fila.periodo}  | ${fila.valorG.toFixed(2)}  | ${fila.proximosReemplazos.join(', ')}`).join('\n')}

-----------------------------------------------
Planes Optimos de Reemplazo:
${result.planesOptimos.map((plan, idx) => `Plan ${idx + 1}: ${plan.join(' -> ')} (Costo: ${result.costoMinimo.toFixed(2)})`).join('\n')}`

    const blob = new Blob([contenido], { type: 'text/plain' })

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'Caso Reemplazo de Equipos.txt',
          types: [{
            description: 'Archivos de texto',
            accept: { 'text/plain': ['.txt'] }
          }]
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al guardar:', err)
        }
      }
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Caso Reemplazo de Equipos.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleCargarArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').map((line) => line.trim())

        let nuevoCosto = null
        let nuevoPlazo = null
        let nuevaVidaUtil = null
        let nuevaInflacion = false
        let nuevoIndiceInflacion = 0
        let nuevaTabla = []
        let nuevaTablaG = []
        let nuevosPlanes = []
        let nuevoCostoMinimo = null

        let seccionActual = 'header' // header | tabla_datos | resultados | tabla_g | planes

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]

          // Detectar cambios de sección
          if (line.startsWith('Tabla de Datos:')) {
            seccionActual = 'tabla_datos'
            continue
          }
          if (line.startsWith('RESULTADOS')) {
            seccionActual = 'resultados'
            continue
          }
          if (line.startsWith('Tabla G(t):')) {
            seccionActual = 'tabla_g'
            continue
          }
          if (line.startsWith('Planes Optimos')) {
            seccionActual = 'planes'
            continue
          }
          if (line.startsWith('---') || line === '') {
            continue
          }

          // Parsear datos del header
          if (seccionActual === 'header') {
            if (line.startsWith('Costo Inicial =')) {
              nuevoCosto = Number(line.split('=')[1].trim())
            }
            if (line.startsWith('Plazo del Proyecto =')) {
              nuevoPlazo = Number(line.split('=')[1].trim())
            }
            if (line.startsWith('Vida Util =')) {
              nuevaVidaUtil = Number(line.split('=')[1].trim())
            }
            if (line.startsWith('Usar Inflacion =')) {
              nuevaInflacion = line.split('=')[1].trim().toLowerCase() === 'si'
            }
            if (line.startsWith('Indice de Inflacion =')) {
              nuevoIndiceInflacion = Number(line.split('=')[1].trim().replace('%', ''))
            }
            if (line.startsWith('Costo Minimo Total =')) {
              nuevoCostoMinimo = Number(line.split('=')[1].trim())
            }
            continue
          }

          // Parsear tabla de datos (input del usuario)
          if (seccionActual === 'tabla_datos') {
            // Saltar línea de encabezado de columnas
            if (line.includes('Tiempo') && line.includes('Mantenimiento')) {
              continue
            }
            const parts = line.split('|').map(p => p.trim()).filter(p => p !== '')
            if (parts.length >= 3) {
              const tiempo = Number(parts[0])
              const costoMant = Number(parts[1])
              const precioRescate = Number(parts[2])
              if (!isNaN(tiempo) && !isNaN(costoMant) && !isNaN(precioRescate) && tiempo > 0) {
                nuevaTabla.push({
                  tiempo: tiempo,
                  costoMantenimiento: costoMant,
                  precioRescate: precioRescate
                })
              }
            }
            continue
          }

          // Parsear tabla G(t) (resultados)
          if (seccionActual === 'tabla_g') {
            // Saltar línea de encabezado
            if (line.includes('t') && line.includes('G(t)')) {
              continue
            }
            const parts = line.split('|').map(p => p.trim()).filter(p => p !== '')
            if (parts.length >= 3) {
              const periodo = Number(parts[0])
              const valorG = Number(parts[1])
              const proximosStr = parts[2]
              // Parsear "1, 3" o "6" en array de números
              const proximosReemplazos = proximosStr
                .split(',')
                .map(s => Number(s.trim()))
                .filter(n => !isNaN(n))
              
              if (!isNaN(periodo) && !isNaN(valorG)) {
                nuevaTablaG.push({
                  periodo: periodo,
                  valorG: valorG,
                  proximosReemplazos: proximosReemplazos
                })
              }
            }
            continue
          }

          // Parsear planes óptimos
          if (seccionActual === 'planes') {
            // Formato: "Plan 1: 0 -> 1 -> 2 -> 5 (Costo: 640.00)"
            const match = line.match(/Plan\s+\d+:\s+(.+?)\s+\(Costo:/)
            if (match) {
              const planStr = match[1].trim()
              const plan = planStr.split('->').map(s => Number(s.trim())).filter(n => !isNaN(n))
              if (plan.length > 0) {
                nuevosPlanes.push(plan)
              }
            }
            continue
          }
        }

        if (!nuevoCosto || !nuevoPlazo || !nuevaVidaUtil) {
          setError('Archivo inválido, le faltan datos.')
          return
        }

        // ACTIVAR MODO CARGA
        setModoCarga(true)
        
        setCostoInicial(nuevoCosto)
        setPlazoProyecto(nuevoPlazo)
        setVidaUtil(nuevaVidaUtil)
        setUsarInflacion(nuevaInflacion)
        setIndiceInflacion(nuevoIndiceInflacion)
        
        if (nuevaTabla.length > 0) {
          setTablaDatos(nuevaTabla)
        } else {
          const tablaVacia = []
          for (let i = 1; i <= nuevaVidaUtil; i++) {
            tablaVacia.push({ tiempo: i, precioRescate: 0, costoMantenimiento: 0 })
          }
          setTablaDatos(tablaVacia)
        }
        
        // Si hay resultados parseados, reconstruir el objeto result
        if (nuevaTablaG.length > 0 && nuevosPlanes.length > 0 && nuevoCostoMinimo !== null) {
          
          const tablaGArray = []
          nuevaTablaG.forEach(fila => {
            tablaGArray[fila.periodo] = {
              costo: fila.valorG,
              proxys: fila.proximosReemplazos
            }
          })
          
          setResult({
            costoMinimo: nuevoCostoMinimo,
            tablaG: tablaGArray,
            planesOptimos: nuevosPlanes,
            analisisPorPeriodo: nuevaTablaG
          })
          setIndicePlanActual(0)
        } else {
          setResult(null)
        }
        
        setError('')
        
        setTimeout(() => setModoCarga(false), 200)
        
      } catch (err) {
        console.error('Error al cargar archivo:', err)
        setError('No se pudo leer el archivo.')
        setModoCarga(false)
      }
    }

    reader.onerror = () => {
      setError('Error al leer el archivo.')
      setModoCarga(false)
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCargarEjemplo = (ejemplo) => { 
    const datos = ejemplo.datos
    setModoCarga(true)
    setCostoInicial(datos.costoInicial)
    setPlazoProyecto(datos.plazoProyecto)
    setVidaUtil(datos.vidaUtil)
    setUsarInflacion(datos.usarInflacion)
    setIndiceInflacion(datos.indiceInflacion)
    setTablaDatos(datos.tablaDatos)
    setResult(null)
    setError('')
    
    setTimeout(() => setModoCarga(false), 100)

  }

  const handleCambiarPlan = (direction) => {
    if (!result || !result.planesOptimos) return

    const nuevoIndice = indicePlanActual + direction
    if (nuevoIndice >= 0 && nuevoIndice < result.planesOptimos.length) {
      setIndicePlanActual(nuevoIndice)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      <Button variant="outlined" onClick={onBack} sx={{ mb: 3 }}>
        Volver al menú
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Reemplazo de Equipos
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Determine cuándo reemplazar equipos para minimizar costos a lo largo del proyecto.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <TextField
              label="Costo Inicial del Equipo"
              type="number"
              value={costoInicial}
              onChange={handleCostoChange}
              sx={{ minWidth: '220px' }}
              inputProps={{ min: 1 }}
            />

            <Box sx={{ minWidth: '220px' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Plazo del Proyecto: {plazoProyecto} períodos
              </Typography>
              <Slider
                value={plazoProyecto}
                onChange={handlePlazoChange}
                min={1}
                max={30}
                valueLabelDisplay="auto"
                sx={{ width: '200px' }}
              />
            </Box>

            <Box sx={{ minWidth: '220px' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Vida Útil: {vidaUtil} períodos
              </Typography>
              <Slider
                value={vidaUtil}
                onChange={handleVidaUtilChange}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                sx={{ width: '200px' }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={usarInflacion}
                  onChange={(e) => setUsarInflacion(e.target.checked)}
                />
              }
              label="Aplicar Inflación"
            />
            {usarInflacion && (
              <TextField
                label="Índice de Inflación (%)"
                type="number"
                value={indiceInflacion}
                onChange={(e) => setIndiceInflacion(Number(e.target.value))}
                sx={{ width: '180px' }}
                inputProps={{ min: 0, max: 100 }}
              />
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Tabla de Datos por Tiempo de Uso
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2c2c2c' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tiempo de Uso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Costo de Mantenimiento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio de Venta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tablaDatos.map((fila, index) => (
                  <TableRow key={fila.tiempo}>
                    <TableCell>{fila.tiempo}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={fila.costoMantenimiento}
                        onChange={(e) => handleTableChange(index, 'costoMantenimiento', e.target.value)}
                        size="small"
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={fila.precioRescate}
                        onChange={(e) => handleTableChange(index, 'precioRescate', e.target.value)}
                        size="small"
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button variant="contained" onClick={handleSolve} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Resolver'}
          </Button>

          <Button variant="contained" color="success" onClick={handleGuardarCaso}>
            Guardar Caso
          </Button>

          <Button variant="contained" component="label" color="secondary">
            Cargar Caso
            <input
              type="file"
              accept=".txt"
              hidden
              onChange={handleCargarArchivo}
            />
          </Button>

          <Button variant="outlined" onClick={() => setEjemplosAbierto(!ejemplosAbierto)}>
            {ejemplosAbierto ? 'Ocultar' : 'Ver'} Ejemplos
          </Button>
        </Box>

        <Collapse in={ejemplosAbierto}>
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#252525' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Archivos de Prueba
            </Typography>
            <List>
              {ejemplosPrueba.map((ejemplo, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleCargarEjemplo(ejemplo)}>
                    <ListItemText primary={ejemplo.nombre} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Collapse>

        {error && (
          <Typography sx={{ color: 'error.main', fontWeight: 'bold', mb: 2 }}>
            {error}
          </Typography>
        )}

        {result && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#eef6ff', color: 'black' }}>
              <Typography variant="h6">
                Costo Mínimo Total: ${result.costoMinimo.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total de Planes Óptimos: {result.planesOptimos.length}
              </Typography>
            </Paper>

            <Typography variant="h5" sx={{ mb: 2 }}>
              Tabla G(t)
            </Typography>

            <TableContainer sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#2c2c2c' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>t</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>G(t)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Próximo Reemplazo(s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.analisisPorPeriodo.map((fila) => (
                    <TableRow key={fila.periodo}>
                      <TableCell>{fila.periodo}</TableCell>
                      <TableCell>${fila.valorG === Number.POSITIVE_INFINITY ? '∞' : fila.valorG.toFixed(2)}</TableCell>
                      <TableCell>
                        {fila.proximosReemplazos.map(p => `t=${p}`).join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h5" sx={{ mb: 2 }}>
              Planes Óptimos de Reemplazo
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleCambiarPlan(-1)}
                disabled={indicePlanActual === 0}
              >
                Plan Anterior
              </Button>
              <Typography>
                Plan {indicePlanActual + 1} de {result.planesOptimos.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleCambiarPlan(1)}
                disabled={indicePlanActual === result.planesOptimos.length - 1}
              >
                Siguiente Plan
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {result.planesOptimos.map((plan, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    minWidth: '180px',
                    backgroundColor: index === indicePlanActual ? '#4caf50' : '#2c2c2c',
                    color: index === indicePlanActual ? 'white' : 'white',
                    border: index === indicePlanActual ? '2px solid #81c784' : '1px solid #404040'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Plan {index + 1}
                  </Typography>
                  <Typography variant="body2">
                    {plan.join(' → ')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Costo: ${result.costoMinimo.toFixed(2)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ReemplazoEquipos