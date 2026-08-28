import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Categories from './pages/Categories'
import CategoryPage from './pages/CategoryPage'
import Search from './pages/Search'
import ProductPage from './pages/ProductPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Account from './pages/Account'
import BottomNav from './components/BottomNav'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const hideNav = ['/checkout', '/order-success'].includes(pathname) || pathname.startsWith('/product/')

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#f4f5f7]">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!hideNav && <div className="h-16" />}
      {!hideNav && <BottomNav />}
    </div>
  )
}
