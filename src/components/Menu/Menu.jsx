import MenuButton from './MenuButton'

const menuOptions = [
  {
    title: 'Reemplazo de Equipos',
    description: 'Decide cuándo reemplazar maquinaria minimizando costos a lo largo del tiempo.'
  },
  {
    title: 'Árboles Binarios de Búsqueda Óptimos',
    description: 'Construye un árbol de búsqueda con costo de acceso mínimo.'
  },
  {
    title: 'Series Deportivas',
    description: 'Calcula la probabilidad de que un equipo gane una serie bajo ciertas reglas.'
  },
  {
    title: 'Multiplicación de Matrices',
    description: 'Encuentra el orden óptimo para multiplicar una cadena de matrices.'
  }
]

function Menu({ onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}
    >
      {menuOptions.map((option) => (
        <MenuButton
          key={option.title}
          title={option.title}
          description={option.description}
          onClick={() => onSelect(option.title)}
        />
      ))}
    </div>
  )
}

export default Menu