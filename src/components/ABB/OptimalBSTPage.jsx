import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { colors } from '../../theme/colors'

const SAMPLE_INPUT = `casa,15
arbol,10
perro,25`

function parseInput(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    throw new Error('Debes ingresar al menos una llave con su peso.')
  }

  const parsed = lines.map((line, index) => {
    const parts = line.split(/[;,\s]+/).filter(Boolean)

    if (parts.length < 2) {
      throw new Error(`La línea ${index + 1} no tiene el formato correcto.`)
    }

    const key = parts.slice(0, -1).join(' ')
    const weight = Number(parts[parts.length - 1])

    if (!key) {
      throw new Error(`La línea ${index + 1} no contiene una llave válida.`)
    }

    if (Number.isNaN(weight) || weight <= 0) {
      throw new Error(`El peso de la línea ${index + 1} debe ser un número mayor que 0.`)
    }

    return { key, weight }
  })

  if (parsed.length > 10) {
    throw new Error('El proyecto asume n <= 10.')
  }

  return parsed.sort((a, b) => a.key.localeCompare(b.key, 'es', { sensitivity: 'base' }))
}

function buildOptimalBST(items) {
  const n = items.length
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
  const probabilities = items.map((item) => item.weight / totalWeight)

  const A = Array.from({ length: n + 2 }, () => Array(n + 1).fill(null))
  const R = Array.from({ length: n + 2 }, () => Array(n + 1).fill(null))
  const prefix = Array(n + 1).fill(0)

  for (let i = 1; i <= n; i += 1) {
    prefix[i] = prefix[i - 1] + probabilities[i - 1]
  }

  const rangeSum = (i, j) => prefix[j] - prefix[i - 1]

  for (let i = 1; i <= n + 1; i += 1) {
    A[i][i - 1] = 0
  }

  for (let length = 1; length <= n; length += 1) {
    for (let i = 1; i <= n - length + 1; i += 1) {
      const j = i + length - 1
      let bestCost = Number.POSITIVE_INFINITY
      let bestRoot = i
      const sum = rangeSum(i, j)

      for (let k = i; k <= j; k += 1) {
        const leftCost = A[i][k - 1] ?? 0
        const rightCost = A[k + 1][j] ?? 0
        const cost = leftCost + rightCost + sum

        if (cost < bestCost) {
          bestCost = cost
          bestRoot = k
        }
      }

      A[i][j] = bestCost
      R[i][j] = bestRoot
    }
  }

  return {
    items,
    probabilities,
    A,
    R,
    totalCost: A[1][n]
  }
}

function formatNumber(value, digits = 4) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(digits)
}

function MatrixTable({ title, n, values, formatter }) {
  const cols = Array.from({ length: n + 1 }, (_, idx) => idx)
  const rows = Array.from({ length: n + 1 }, (_, idx) => idx + 1)

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1.5, color: colors.titleColor }}>
        {title}
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: colors.surface }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: colors.textPrimary, fontWeight: 700 }}>i \ j</TableCell>
              {cols.map((col) => (
                <TableCell key={col} align="center" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row}>
                <TableCell sx={{ color: colors.textPrimary, fontWeight: 700 }}>{row}</TableCell>
                {cols.map((col) => {
                  const value = row <= n + 1 && col <= n ? values[row]?.[col] : null
                  return (
                    <TableCell key={`${row}-${col}`} align="center" sx={{ color: colors.textSecondary }}>
                      {value === null ? '-' : formatter(value)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

function buildTreeStructure(result, i, j) {
  if (i > j) return null

  const rootIndex = result.R[i][j]
  if (!rootIndex) return null

  const item = result.items[rootIndex - 1]

  return {
    id: `${i}-${j}-${rootIndex}`,
    key: item.key,
    weight: item.weight,
    probability: result.probabilities[rootIndex - 1],
    left: buildTreeStructure(result, i, rootIndex - 1),
    right: buildTreeStructure(result, rootIndex + 1, j)
  }
}

function layoutTree(root) {
  if (!root) return null

  let nextColumn = 0
  let maxDepth = 0
  const positionedNodes = []
  const positionedMap = new Map()

  const visit = (node, depth) => {
    if (!node) return

    visit(node.left, depth + 1)

    const positionedNode = {
      ...node,
      column: nextColumn,
      depth
    }

    positionedNodes.push(positionedNode)
    positionedMap.set(node.id, positionedNode)
    nextColumn += 1
    maxDepth = Math.max(maxDepth, depth)

    visit(node.right, depth + 1)
  }

  const edges = []
  const collectEdges = (node) => {
    if (!node) return

    if (node.left) {
      edges.push([node.id, node.left.id])
      collectEdges(node.left)
    }

    if (node.right) {
      edges.push([node.id, node.right.id])
      collectEdges(node.right)
    }
  }

  visit(root, 0)
  collectEdges(root)

  return {
    nodes: positionedNodes,
    nodeMap: positionedMap,
    edges,
    depth: maxDepth,
    columns: nextColumn
  }
}

function TreeDiagram({ tree }) {
  if (!tree) return null

  const layout = layoutTree(tree)
  if (!layout) return null

  const horizontalGap = 170
  const verticalGap = 118
  const nodeWidth = 118
  const nodeHeight = 58
  const paddingX = 70
  const paddingY = 38
  const width = Math.max(layout.columns * horizontalGap + paddingX * 2, 320)
  const height = Math.max((layout.depth + 1) * verticalGap + paddingY * 2, 180)

  const getNodeX = (node) => paddingX + node.column * horizontalGap
  const getNodeY = (node) => paddingY + node.depth * verticalGap

  return (
    <Box
      sx={{
        overflowX: 'auto',
        borderRadius: 3,
        border: `1px solid ${colors.primary}22`,
        background:
          'radial-gradient(circle at top, rgba(76, 175, 80, 0.12), transparent 45%), rgba(255, 255, 255, 0.02)',
        p: 2
      }}
    >
      <svg width={width} height={height} role="img" aria-label="Visualización del árbol binario óptimo">
        {layout.edges.map(([fromId, toId]) => {
          const from = layout.nodeMap.get(fromId)
          const to = layout.nodeMap.get(toId)

          return (
            <line
              key={`${fromId}-${toId}`}
              x1={getNodeX(from)}
              y1={getNodeY(from) + nodeHeight / 2}
              x2={getNodeX(to)}
              y2={getNodeY(to) - nodeHeight / 2}
              stroke="#4caf50"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
          )
        })}

        {layout.nodes.map((node) => {
          const x = getNodeX(node)
          const y = getNodeY(node)

          return (
            <g key={node.id}>
              <rect
                x={x - nodeWidth / 2}
                y={y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx="18"
                fill={colors.surface}
                stroke={colors.primary}
                strokeWidth="2.5"
              />
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fill={colors.titleColor}
              >
                {node.key}
              </text>
              <text x={x} y={y + 14} textAnchor="middle" fontSize="12" fill={colors.textSecondary}>
                p={formatNumber(node.probability, 3)}
              </text>
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

function downloadTxt(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function OptimalBSTPage({ onBack }) {
  const [rawInput, setRawInput] = useState(SAMPLE_INPUT)
  const [error, setError] = useState('')
  const [result, setResult] = useState(() => {
    try {
      const items = parseInput(SAMPLE_INPUT)
      return buildOptimalBST(items)
    } catch {
      return null
    }
  })

  const treeData = useMemo(() => {
    if (!result) return null
    return buildTreeStructure(result, 1, result.items.length)
  }, [result])

  const handleCalculate = () => {
    try {
      const items = parseInput(rawInput)
      const calculated = buildOptimalBST(items)
      setResult(calculated)
      setError('')
    } catch (err) {
      setError(err.message)
      setResult(null)
    }
  }

  const handleLoadFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setRawInput(text)
  }

  const handleSaveFile = () => {
    downloadTxt(rawInput, 'arbol-binario-busqueda-optimo.txt')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: colors.titleColor, mb: 1 }}>
            Árboles Binarios de Búsqueda Óptimos
          </Typography>
          <Typography sx={{ color: colors.textSecondary }}>
            Formato por línea: llave,peso o llave peso. Ejemplo: "casa,15" o "casa 15" 
            <br />
            Si desea ingresar decimales debe usar punto como separador. Ejemplo: "casa,15.5" o "casa 15.5"
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: 'nowrap',      
            overflowX: 'auto',      
            whiteSpace: 'nowrap',    
            gap: '12px'
          }}
        >
          <Button variant="outlined" onClick={onBack}>
            Volver al menú
          </Button>
          <Button variant="contained" color="secondary" component="label">
            Cargar .txt
            <input hidden type="file" accept=".txt" onChange={handleLoadFile} />
          </Button>
          <Button variant="contained" color="success" onClick={handleSaveFile}>
            Guardar .txt
          </Button>
          <Button variant="contained" color="primary" onClick={handleCalculate}>
            Calcular
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Paper sx={{ flex: 1, backgroundColor: colors.surface, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.titleColor }}>
            Datos de entrada
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={12}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={SAMPLE_INPUT}
          />
        </Paper>

        <Paper sx={{ width: { xs: '100%', lg: '360px' }, backgroundColor: colors.surface, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.titleColor }}>
            Resumen
          </Typography>

          {result && (
            <Stack spacing={1.2}>
              <Typography sx={{ color: colors.textSecondary }}>
                Número de llaves: <strong>{result.items.length}</strong>
              </Typography>
              <Typography sx={{ color: colors.textSecondary }}>
                Costo óptimo: <strong>{formatNumber(result.totalCost)}</strong>
              </Typography>
              <Typography sx={{ color: colors.textSecondary }}>
                Llaves ordenadas:
              </Typography>
              {result.items.map((item, index) => (
                <Typography key={item.key} sx={{ color: colors.textSecondary, fontSize: '0.95rem' }}>
                  {index + 1}. {item.key} | p = {formatNumber(result.probabilities[index])}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {result && (
        <Stack spacing={3}>
          <Paper sx={{ backgroundColor: colors.surface, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.titleColor }}>
            Formula utilizada
          </Typography>
          <Typography sx={{ color: colors.textSecondary }}>
              A[i][j] = min(A[i][k-1] + A[k+1][j] + pi + ... + pk + ... + pj) para i ≤ k ≤ j
              </Typography>
          </Paper>
          <MatrixTable
            title="Tabla A (costos mínimos)"
            n={result.items.length}
            values={result.A}
            formatter={(value) => formatNumber(value)}
          />

          <MatrixTable
            title="Tabla R (raíces óptimas)"
            n={result.items.length}
            values={result.R}
            formatter={(value) => value}
          />

          <Paper sx={{ backgroundColor: colors.surface, p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5, color: colors.titleColor }}>
              Visualización del árbol
            </Typography>
            <Typography sx={{ mb: 2, color: colors.textSecondary }}>
              Cada nodo muestra la llave y su peso asociado dentro del ABB óptimo.
            </Typography>
            <TreeDiagram tree={treeData} />
          </Paper>
        </Stack>
      )}
    </Box>
  )
}

export default OptimalBSTPage
