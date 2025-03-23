import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext } from "react";
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FaBell, FaGavel, FaMoneyBillWave, FaPlus, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";

function CustomNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow p-3">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
          <FaGavel className="me-2" size={24} />
          <span className="fs-4">Auction Platform</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard"><FaGavel className="me-1" /> Auctions</Nav.Link>
                <Nav.Link as={Link} to="/notifications"><FaBell className="me-1" /> Notifications</Nav.Link>
                <Nav.Link as={Link} to="/payment"><FaMoneyBillWave className="me-1" /> Payments</Nav.Link>
                <Nav.Link as={Link} to="/profile"><FaUser className="me-1" /> Profile</Nav.Link>

                {/* 🚀 Updated "Add Item" Link to UploadProductForm.js */}
                <Nav.Link as={Link} to="/upload-product" className="text-warning">
                  <FaPlus className="me-1" /> Add Item
                </Nav.Link>

                <Nav.Link onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-1" /> Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
