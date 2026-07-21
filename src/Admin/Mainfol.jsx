import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

const Mainfol = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAboutPage = location.pathname === "/app/about";
  
  if (isAboutPage) {
    return (
      <div className='w-full min-h-screen bg-[#f7f9f4]'>
        <Outlet />
      </div>
    )
  }
  
  return (
    <div className='flex flex-1 min-h-screen bg-[#f6f9f3]'>
      <div className=' lg:w-64'>
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
      </div>
      <div className=' flex lg:flex-1 w-full flex-col'>
        <Header className='' isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
        <div className='px-5 lg:px-10 pt-20 mx-auto w-full mb-5'>
          <Outlet />
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default Mainfol
