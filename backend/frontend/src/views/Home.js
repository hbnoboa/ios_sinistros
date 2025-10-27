import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SelectTenant from "./auth/SelectTenant";

const Home = () => {
  const { tenants, tenant } = useAuth();

  // Se o usuário tem múltiplos tenants e ainda não escolheu, mostra o seletor
  if (Array.isArray(tenants) && tenants.length > 1 && !tenant) {
    return <SelectTenant />;
  }

  return (
    <div>
      {Array.isArray(tenants) && tenants.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <SelectTenant />
        </div>
      )}
    </div>
  );
};

export default Home;
