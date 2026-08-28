import { useNavigate } from 'react-router-dom'
import { SearchIcon } from './icons'

export default function SearchBar({ readOnly = true, defaultValue = '' }: { readOnly?: boolean; defaultValue?: string }) {
  const navigate = useNavigate()
  if (readOnly) {
    return (
      <button
        onClick={() => navigate('/search')}
        className="flex w-full items-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 text-sm text-gray-400"
      >
        <SearchIcon className="h-5 w-5" />
        جستجو در محصولات مانوش…
      </button>
    )
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const q = new FormData(e.currentTarget).get('q') as string
        navigate(`/search?q=${encodeURIComponent(q || '')}`)
      }}
      className="flex w-full items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5"
    >
      <SearchIcon className="h-5 w-5 text-gray-400" />
      <input
        name="q"
        autoFocus
        defaultValue={defaultValue}
        placeholder="نام محصول را وارد کنید…"
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
    </form>
  )
}
