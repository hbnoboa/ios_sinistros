import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Confirmando...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/auth/confirm/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          data.message &&
          data.message === "Email confirmado. Você já pode entrar."
        ) {
          setSuccess(true);
          setMessage(data.message);
          setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
        } else {
          setMessage(data.message || data.error || "Erro ao confirmar.");
        }
      })
      .catch(() => setMessage("Erro ao confirmar."));
  }, [token, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Confirmação de Email</h2>
      <p>{message}</p>
      {success && <p>Redirecionando para o login...</p>}
    </div>
  );
};

export default ConfirmEmail;
