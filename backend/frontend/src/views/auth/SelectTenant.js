import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function SelectTenant() {
  const { tenants = [], setSelectedTenant, tenant, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user && (user.role === "Admin" || user.role === "Manager");
  const visibleTenants = tenants.filter((t) => isAdmin || t !== "IOS");

  const choose = (t) => {
    setSelectedTenant(t);
    navigate("/attendances");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const slug = (t) => String(t).toLowerCase().replace(/\s+/g, "-");

  return (
    <section
      className="dark-theme"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Container>
        {!tenant && (
          <div className="d-flex justify-content-end mb-3">
            <Button className="btn-orange" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
        <h4 className="text-center mb-4">Selecione o ambiente</h4>
        <Row className="justify-content-center g-4">
          {visibleTenants.map((t) => (
            <Col key={t} xs={10} sm={6} md={4} lg={3} xl={2}>
              <Card
                className="text-center bg-dark h-100"
                style={{ backgroundColor: "#232323", borderColor: "#444" }}
              >
                <Card.Body className="d-flex flex-column align-items-center">
                  <img
                    src={`/tenants/${slug(t)}.png`}
                    alt={t}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 100,
                      objectFit: "contain",
                      marginBottom: 12,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Card.Title className="mb-3 text-white">{t}</Card.Title>
                  <Button
                    className="btn-orange mt-auto"
                    onClick={() => choose(t)}
                  >
                    Selecionar
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {!visibleTenants.length && (
            <Col xs={12} className="text-center text-muted">
              Nenhum ambiente disponível.
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
}
