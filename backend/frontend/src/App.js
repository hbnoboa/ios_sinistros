import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RequireTenant from "./components/RequireTenant";
import Home from "./views/Home";
import ConfirmEmail from "./views/auth/ConfirmEmail";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import SelectTenant from "./views/auth/SelectTenant";
import InsuredIndex from "./views/insured";
import InsuredNew from "./views/insured/new";
import InsuredEdit from "./views/insured/edit";
import InsuredShow from "./views/insured/show";
import InsuranceCompaniesIndex from "./views/insuranceCompanies";
import InsuranceCompanyNew from "./views/insuranceCompanies/new";
import InsuranceCompanyEdit from "./views/insuranceCompanies/edit";
import InsuranceCompanyShow from "./views/insuranceCompanies/show";
import BrokersIndex from "./views/brokers";
import BrokerNew from "./views/brokers/new";
import BrokerEdit from "./views/brokers/edit";
import BrokerShow from "./views/brokers/show";
import RegulatorsIndex from "./views/regulators";
import RegulatorNew from "./views/regulators/new";
import RegulatorEdit from "./views/regulators/edit";
import RegulatorShow from "./views/regulators/show";
import RiskManagersIndex from "./views/riskManagers";
import RiskManagerNew from "./views/riskManagers/new";
import RiskManagerEdit from "./views/riskManagers/edit";
import RiskManagerShow from "./views/riskManagers/show";
import ShippingCompaniesIndex from "./views/shippingCompanies";
import ShippingCompanyNew from "./views/shippingCompanies/new";
import ShippingCompanyEdit from "./views/shippingCompanies/edit";
import ShippingCompanyShow from "./views/shippingCompanies/show";
import AttendancesIndex from "./views/attendances";
import AttendanceNew from "./views/attendances/new";
import AttendanceEdit from "./views/attendances/edit";
import AttendanceShow from "./views/attendances/show";
import Dashboard from "./views/Dashboard";

// Wrapper para todas as rotas protegidas
const ProtectedLayout = () => (
  <PrivateRoute>
    <RequireTenant>
      <Outlet />
    </RequireTenant>
  </PrivateRoute>
);

const App = () => {
  const { token, tenant } = useAuth();

  return (
    <main>
      {token && tenant && <Navbar />}

      <Routes>
        <Route path="/confirm/:token" element={<ConfirmEmail />} />

        <Route
          path="/login"
          element={
            token ? (
              tenant ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/select-tenant" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/select-tenant"
          element={token ? <SelectTenant /> : <Navigate to="/login" replace />}
        />

        {/* Todas as rotas protegidas abaixo */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<Home />} />
          <Route path="insureds" element={<InsuredIndex />} />
          <Route path="insureds/new" element={<InsuredNew />} />
          <Route path="insureds/:id/edit" element={<InsuredEdit />} />
          <Route path="insureds/:id" element={<InsuredShow />} />
          <Route
            path="insurance-companies"
            element={<InsuranceCompaniesIndex />}
          />
          <Route
            path="insurance-companies/new"
            element={<InsuranceCompanyNew />}
          />
          <Route
            path="insurance-companies/:id/edit"
            element={<InsuranceCompanyEdit />}
          />
          <Route
            path="insurance-companies/:id"
            element={<InsuranceCompanyShow />}
          />
          <Route path="brokers" element={<BrokersIndex />} />
          <Route path="brokers/new" element={<BrokerNew />} />
          <Route path="brokers/:id/edit" element={<BrokerEdit />} />
          <Route path="brokers/:id" element={<BrokerShow />} />
          <Route path="regulators" element={<RegulatorsIndex />} />
          <Route path="regulators/new" element={<RegulatorNew />} />
          <Route path="regulators/:id/edit" element={<RegulatorEdit />} />
          <Route path="regulators/:id" element={<RegulatorShow />} />
          <Route path="risk-managers" element={<RiskManagersIndex />} />
          <Route path="risk-managers/new" element={<RiskManagerNew />} />
          <Route path="risk-managers/:id/edit" element={<RiskManagerEdit />} />
          <Route path="risk-managers/:id" element={<RiskManagerShow />} />
          <Route
            path="shipping-companies"
            element={<ShippingCompaniesIndex />}
          />
          <Route
            path="shipping-companies/new"
            element={<ShippingCompanyNew />}
          />
          <Route
            path="shipping-companies/:id/edit"
            element={<ShippingCompanyEdit />}
          />
          <Route
            path="shipping-companies/:id"
            element={<ShippingCompanyShow />}
          />
          <Route path="attendances" element={<AttendancesIndex />} />
          <Route path="attendances/new" element={<AttendanceNew />} />
          <Route path="attendances/:id/edit" element={<AttendanceEdit />} />
          <Route path="attendances/:id" element={<AttendanceShow />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
