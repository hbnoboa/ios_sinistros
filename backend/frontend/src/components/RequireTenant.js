import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireTenant = ({ children }) => {
  const { token, tenant } = useAuth();
  if (token && !tenant) {
    return <Navigate to="/select-tenant" replace />;
  }
  return children;
};

export default RequireTenant;
