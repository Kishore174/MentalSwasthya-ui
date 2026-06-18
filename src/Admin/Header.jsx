import React from 'react';
import { MdMenu } from 'react-icons/md';
// import { useAuth } from '../context/AuthProvider';

// import adminImage from "../../Assets/admin.jpeg"; // Add your admin image here

const Header = ({isSidebarOpen, setIsSidebarOpen}) => {
  // const {user} = useAuth()
  return (
    <header className="w-full fixed mx-auto   rounded-sm">
      <div className="flex items-center justify-between p-3"> {/* Reduced padding */}
        {/* Left side: Logo */}
        <button className=' lg:hidden text-2xl' onClick={()=>{setIsSidebarOpen(!isSidebarOpen);}}><MdMenu/></button>
        {/* <img src={logo} alt="Logo" className="h-8 object-contain" /> Reduced logo height */}
   

        {/* Right side: Admin Image */}
         
      </div>
    </header>
  );
};

export default Header;
