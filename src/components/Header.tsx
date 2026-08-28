import { useNavigate } from 'react-router-dom'
import { ChevronBack } from './icons'

interface Props {
  title?: string
  showBack?: boolean
  right?: React.ReactNode
}

export default function Header({ title, showBack, right }: Props) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-brand text-white shadow-sm safe-top">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
        {showBack && (
          <button
            aria-label="بازگشت"
            onClick={() => navigate(-1)}
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10"
          >
            <ChevronBack className="h-6 w-6" />
          </button>
        )}
        <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
        {right}
      </div>
    </header>
  )
}
