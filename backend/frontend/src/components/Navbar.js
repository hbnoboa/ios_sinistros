import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";

const AppNavbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = "#181818";
    document.body.style.color = "#fff";
    document.body.classList.add("dark-theme");
    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, []);

  if (!token) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  //  const showAdmin = user && (user.role === "Admin" || user.role === "Manager");

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 orange-accent">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/ios-logo.png"
            alt="IOS Sinistros"
            height={50}
            style={{ display: "block" }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link> */}
            <Nav.Link as={Link} to="/attendances">
              Atendimentos
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/settingList">
              Campos
            </Nav.Link> */}
            <NavDropdown title="Cadastros" id="nav-dropdown-cadastros">
              <NavDropdown.Item as={Link} to="/brokers">
                Corretores
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/regulators">
                Reguladores
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/insureds">
                Segurados
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/insurance-companies">
                Seguradoras
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/shipping-companies">
                Transportadoras
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/risk-managers">
                Gerenciadores de Risco
              </NavDropdown.Item>
            </NavDropdown>
            {/* {showAdmin && (
              <NavDropdown title="Administração" id="nav-dropdown-admin">
                <NavDropdown.Item as={Link} to="/userPanel">
                  Usuários
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/auditLog">
                  Logs
                </NavDropdown.Item>
              </NavDropdown>
            )} */}
          </Nav>
          <Button className="btn-orange" onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
