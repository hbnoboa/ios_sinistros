import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.passwordConfirm) {
      setMessage("As senhas não coincidem.");
      return;
    }
    setMessage("Enviando...");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Cadastro realizado! Verifique seu email para confirmar.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Erro ao cadastrar.");
      }
    } catch {
      setMessage("Erro ao cadastrar.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="text"
          name="role"
          placeholder="Função"
          value={form.role}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          name="passwordConfirm"
          placeholder="Confirme a senha"
          value={form.passwordConfirm}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Cadastrar
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Register;
