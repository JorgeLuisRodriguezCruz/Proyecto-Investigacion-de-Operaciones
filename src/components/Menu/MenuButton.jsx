import { Button, Tooltip } from '@mui/material'
import { colors } from '../../theme/colors'

function MenuButton({ title, description, onClick }) {
  return (
    <Tooltip title={description} placement="right">
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          backgroundColor: colors.buttonNormal,
          color: colors.textPrimary,
          borderRadius: '8px',
          padding: '1rem 2rem',
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'none',
          minWidth: '400px',
          '&:hover': {
            backgroundColor: colors.buttonHover
          }
        }}
      >
        {title}
      </Button>
    </Tooltip>
  )
}

export default MenuButton
