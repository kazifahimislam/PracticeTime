import React from 'react';
import "./Navbar.css";
import { signOut } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import { RxHamburgerMenu } from "react-icons/rx";

const Navbar = ({ onNavigate }) => {
  const [showmenu, setShowmenu] = React.useState(false);
  const { auth } = firebaseServices;

  const handleHamburger = () => {
    setShowmenu(!showmenu);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      onNavigate("login"); // Use onNavigate instead of useNavigate
      setShowmenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Function to navigate & close menu
  const handleNavigation = (page) => {
    onNavigate(page); // Use onNavigate prop
    setShowmenu(false);
  };

  return (
    <div className="wrapper">
      <nav className={showmenu ? "menu-mobile" : "menu-web"}>
        <ul>

        <li onClick={() => handleNavigation("progress")}>Progress</li>
          <li onClick={() => handleNavigation("start")}>Home Page</li>
          
          <li onClick={handleLogout}>Log out</li>
        </ul>
      </nav>

      <div className="hamburger">
        <button onClick={handleHamburger}><RxHamburgerMenu /></button>
      </div>
    </div>
  );
};

export default Navbar;