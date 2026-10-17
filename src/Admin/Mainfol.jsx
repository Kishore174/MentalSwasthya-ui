import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import FeedbackWidget from '../components/FeedbackWidget'
import SubscriptionAlertBanner from '../components/SubscriptionAlertBanner'

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
        <SubscriptionAlertBanner />
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div
          id='main-content'
          className={`px-4 lg:px-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] lg:pl-8 lg:pr-8 pt-4 sm:pt-6 mx-auto w-full min-w-0 mb-5 flex-1 ${isDashboard ? 'pb-16 lg:pb-0' : ''}`}
        >
          <Outlet />
        </div>
        <Footer />
      </div>
      {isDashboard && <FeedbackWidget />}
    </div>
  )
}

export default Mainfol
