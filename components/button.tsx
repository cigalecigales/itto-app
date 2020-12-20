
import styled from 'styled-components'

type Props = {
  name: string
  disabled?: boolean
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void)
  onSubmit?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void)
}

function Button({ name, onClick, onSubmit }: Props) {
  return (
    <div className="grid grid-cols-1">
      <div
        className="place-self-center bg-pink-500 text-white font-bold py-3 px-10 rounded-md shadow-md hover:bg-indigo-700 hover:text-white cursor-pointer"
        onClick={onClick}
        onSubmit={onSubmit}
      >
        { name }
      </div>
    </div>
  )
}

export default Button
