import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"
import InvoicesPage from "./pages/invoices/InvoicesPage"
import CreateInvoicePage from "./pages/invoices/CreateInvoicePage"
import ContractsPage from "./pages/contracts/ContractsPage"
import CreateContractPage from "./pages/contracts/CreateContractPage"
import ContractDetailPage from "./pages/contracts/ContractDetailPage"
import EditContractPage from "./pages/contracts/EditContractPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/invoices",
        element: <InvoicesPage />,
      },
      {
        path: "/invoices/create",
        element: <CreateInvoicePage />,
      },
      {
        path: "/contracts",
        element: <ContractsPage />,
      },
      {
        path: "/contracts/create",
        element: <CreateContractPage />,
      },
      {
        path: "/contracts/:id/edit",
        element: <EditContractPage />,
      },
      {
        path: "/contracts/:id",
        element: <ContractDetailPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
