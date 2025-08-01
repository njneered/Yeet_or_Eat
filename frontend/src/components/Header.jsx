import React, { useState } from 'react';
import './Header.css';
import { FiMenu, FiX, FiUser} from 'react-icons/fi';
import { GiKnifeFork, GiPencil } from 'react-icons/gi';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


const clickReviewSount = new Audio('/Mayonnaise.mp3');
clickReviewSount.volume = 0.5;

const Header =() => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [reviewDropdown, setReviewDropdown] = useState(false);
    const [tableDropdown, setTableDropdown] = useState(false);
    const [settingsDropdown, setSettingsDropdown] = useState(false);


    return(


        <>

            <header className="top-bar">
                <Link to="/feed">
                    <img
                    src="/logo-red.png"
                    alt="Yeet or Eat Red Logo"
                    className="logo-in-bar"
                    />
                </Link>    


                <div className="icon-group">
                    <Link to="/submit" title="Submit a Review">
                        <GiPencil />
                    </Link>

                    <Link to="/feed" title="Feed">
                        <GiKnifeFork />
                    </Link>

                    <Link to="/profile" title="Profile">
                        <FiUser />
                    </Link>

                    <FiMenu onClick={() => setMenuOpen(true)} className="hamburger" />
                </div>


            </header>

            {menuOpen && (


                <div className = "side-menu">
                    <div className ="menu-header">
                    <FiX onClick={() => setMenuOpen(false)} className="close-icon" />
                    </div>
                    

                    <div className="menu-selection">


                        {/* Feed Link */}
                        <div className="menu-group">
                            <Link to="/feed" className="menu-title">My Feed</Link>
                        </div>  


                        {/* Review Dropdown */}
                        <div className="menu-group">
                            <div
                            className="menu-title"
                            onClick={() => setReviewDropdown(!reviewDropdown)}
                            >
                            My Reviews {reviewDropdown ? <MdExpandLess /> : <MdExpandMore />}
                            </div>

                            {reviewDropdown && (
                            <div className="submenu">
                                <Link to="/submit" className="submenu-link">Submit a Review</Link>
                                <Link to="/my-reviews" className="submenu-link">My Reviews</Link>
                            </div>
                            )}
                        </div>


                        {/* My Table Dropdown */}
                        <div className="menu-group">
                            <div
                            className="menu-title"
                            onClick={() => setTableDropdown(!tableDropdown)}
                            >
                            My Table {tableDropdown ? <MdExpandLess /> : <MdExpandMore />}
                            </div>

                            {tableDropdown && (
                            <div className="submenu">
                                <Link to="/wanna-eat" className="submenu-link">Wanna Eat</Link>
                                <Link to="/gonna-eat" className="submenu-link">Gonna Eat</Link>
                                <Link to="/already-ate" className="submenu-link">Already Ate</Link>
                            </div>
                            )}
                        </div>
                         

                        {/* My Settings Dropdown */}
                        <div className="menu-group">
                            <div
                            className = "menu-title"
                            onClick={() => setSettingsDropdown(!settingsDropdown)}
                            >
                            My Settings {settingsDropdown ? <MdExpandLess /> : <MdExpandMore />}    
                            </div>
                            {settingsDropdown && (
                                <div className="submenu">
                                    <Link to="/profile-settings" className="submenu-link">Edit Profile</Link>
                                          <div
                                                className="submenu-link"
                                                onClick={handleLogout}
                                                style={{ cursor: 'pointer', color: '#ffff' }}
                                            >
                                                Log Out
                                            </div>
                                </div>
                            )}
                        </div>       


                    </div>


                </div>


            )}


        </>


    );


};

export default Header;