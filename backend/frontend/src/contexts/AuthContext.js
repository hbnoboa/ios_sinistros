import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  // lista de tenants disponível ao usuário
  const [tenants, setTenants] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tenants") || "[]");
    } catch {
      return [];
    }
  });
  // tenant selecionado
  const [tenant, setTenant] = useState(
    () => localStorage.getItem("tenant") || null
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": "IOS",
      };
      fetch("/api/users/me", { headers })
        .then(async (res) => {
          let body = null;
          try {
            body = await res.json();
          } catch {}
          return res.ok ? body : null;
        })
        .then((data) => {
          const u = data?.user || data;
          if (u && (u.id || u._id || u.email)) {
            setUser(u);
            // atualiza tenants vindos do backend
            if (Array.isArray(u.tenants)) {
              setTenants(u.tenants);
              localStorage.setItem("tenants", JSON.stringify(u.tenants));
            }
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            navigate("/login");
          }
        })
        .catch((err) => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          navigate("/login");
        });
    } else {
      setUser(null);
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        navigate("/login");
      }
    }
    // eslint-disable-next-line
  }, [token, navigate]);

  // login agora aceita também a lista de tenants
  const login = (jwt, tenantsList = []) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    if (Array.isArray(tenantsList)) {
      setTenants(tenantsList);
      localStorage.setItem("tenants", JSON.stringify(tenantsList));
    }
  };

  // seleciona o tenant (usado na página SelectTenant)
  const setSelectedTenant = (t) => {
    setTenant(t || null);
    if (t) localStorage.setItem("tenant", t);
    else localStorage.removeItem("tenant");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenants");
    localStorage.removeItem("tenant");
    setToken(null);
    setTenants([]);
    setTenant(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tenants,
        tenant,
        login,
        logout,
        setTenants,
        setSelectedTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
