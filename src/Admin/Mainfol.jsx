import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import FeedbackWidget from '../components/FeedbackWidget'

const Mainfol = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAboutPage = location.pathname === "/app/about";
  const isDashboard = location.pathname === "/app" || location.pathname === "/app/";

  if (isAboutPage) {
    return (
      <div className='w-full min-h-screen bg-[#f7f9f4]'>
        <Outlet />
      </div>
    )
  }

  return (
    <div className='flex flex-1 min-h-screen bg-[#f6f9f3] relative'>
      <div className='lg:w-64 shrink-0'>
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>
      <div className='flex lg:flex-1 w-full flex-col min-w-0'>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className='px-4 lg:px-8 pt-6 mx-auto w-full mb-5 flex-1'>
          <Outlet />
        </div>
        <Footer />
      </div>
      {isDashboard && <FeedbackWidget />}
    </div>
  )
}

export default Mainfol
