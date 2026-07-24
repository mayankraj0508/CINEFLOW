import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon, LogOutIcon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {

 const [isOpen, setIsOpen] = useState(false)
 const [menuOpen, setMenuOpen] = useState(false)

 const navigate = useNavigate()

 const {favoriteMovies, user, logout} = useAppContext()

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt="" className='w-36 h-auto'/>
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>

        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/'>Home</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/movies'>Movies</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/'>Theaters</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/'>Releases</Link>
       {favoriteMovies.length > 0 && <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/favorite'>Favorites</Link>}
      </div>

    <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer'/>
        {
            !user ? (
                <button onClick={()=> navigate('/login')} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Login</button>
            ) : (
                <div className='relative'>
                    <button
                      onClick={()=> setMenuOpen(prev => !prev)}
                      className='w-9 h-9 rounded-full overflow-hidden border border-gray-500 cursor-pointer'
                    >
                      <img src={user.image} alt={user.name} className='w-full h-full object-cover' />
                    </button>
                    {menuOpen && (
                      <div className='absolute right-0 mt-2 w-44 rounded-lg bg-black/90 border border-gray-700 shadow-lg overflow-hidden z-50'>
                        <button
                          onClick={()=> { setMenuOpen(false); navigate('/my-bookings') }}
                          className='w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/20 transition text-left cursor-pointer'
                        >
                          <TicketPlus width={15}/>
                          My Bookings
                        </button>
                        <button
                          onClick={()=> { setMenuOpen(false); logout() }}
                          className='w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/20 transition text-left cursor-pointer'
                        >
                          <LogOutIcon width={15}/>
                          Logout
                        </button>
                      </div>
                    )}
                </div>
            )
        }
        
    </div>

    <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>

    </div>
  )
}

export default Navbar
