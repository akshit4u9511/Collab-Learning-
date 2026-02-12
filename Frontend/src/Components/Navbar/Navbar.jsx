import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Dropdown } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css"; // Your CSS file

const UserProfileDropdown = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUser(null);
    try {
      await axios.get("/auth/logout");
      navigate("/login");
    } catch (error) {
      console.log(error);
      navigate("/login"); // Go to login even if logout fails
    }
  };

  // This is a "safe" component that checks if user exists
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      href=""
      ref={ref}
      onClick={(e) => onClick(e)}
      style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      className="nav-link-custom" // Use class from CSS
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          overflow: "hidden",
          marginRight: "10px",
        }}
      >
        <img
          src={user?.picture} // Use optional chaining
          alt="User Avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {children}
      &#x25bc;
    </div>
  ));

  const CustomMenu = React.forwardRef(({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    const [value, setValue] = useState("");
    return (
      <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) => !value || child.props.children.toLowerCase().startsWith(value)
          )}
        </ul>
      </div>
    );
  });

  // --- THIS IS THE FIX ---
  // We must check if 'user' exists before trying to read its properties
  if (!user) {
    return null; // Don't render the dropdown if user is somehow null
  }

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />
      <Dropdown.Menu as={CustomMenu}>
        <Dropdown.Item
          onClick={() => {
            const profileId = user.username || user._id;
            navigate(`/profile/${profileId}`);
          }}
        >
          Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate('/dashboard/student')}>
          Student Dashboard
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate('/dashboard/mentor')}>
          Mentor Dashboard
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// --- (Header Component is mostly unchanged) ---
const Header = () => {
  const { user } = useAuth();
  const [discover, setDiscover] = useState(false);

  useEffect(() => {
    const handleUrlChange = () => { };
    window.addEventListener("popstate", handleUrlChange);
    const temp = window.location.href.split("/");
    const url = temp.pop() || "";
    setDiscover(url.startsWith("discover"));
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [window.location.href, user]);

  return (
    <>
      <Navbar key="md" expand="md" className="navbar-custom">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
            SKILL SWAP
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-md`}
            aria-labelledby={`offcanvasNavbarLabel-expand-md`}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-md`}>
                SKILL SWAP
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" className="nav-link-custom">
                  Home
                </Nav.Link>
                {user !== null ? (
                  <>
                    <Nav.Link as={Link} to="/discover" className="nav-link-custom">
                      Discover
                    </Nav.Link>
                    <Nav.Link as={Link} to="/chats" className="nav-link-custom">
                      Your Chats
                    </Nav.Link>
                    <Nav.Link as={Link} to="/sessions" className="nav-link-custom">
                      Sessions
                    </Nav.Link>
                    {/* ... (mobile links) ... */}
                    <Nav.Link as={Dropdown} className="nav-link-custom">
                      <UserProfileDropdown />
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/about_us" className="nav-link-custom">
                      About Us
                    </Nav.Link>
                    <Nav.Link as={Link} to="/#why-skill-swap" className="nav-link-custom">
                      Why SkillSwap
                    </Nav.Link>
                    <Nav.Link as={Link} to="/login" className="nav-link-custom">
                      Login/Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;