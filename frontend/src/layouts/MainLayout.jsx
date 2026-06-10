import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CookieBanner from '../components/CookieBanner'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
