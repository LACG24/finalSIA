import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import { Login } from "./screens/login";
import { Layout } from "./screens/layout";
import { NavBar } from "./components/navBar";
import { AdminPage } from "./screens/adminPage";
import { MainPage } from "./screens/mainPage";
import { UserPage } from "./screens/adminUserPage";
import { CheckDateAdd } from "./screens/checkDateAdd";
import { CheckDateDelete } from "./screens/checkDateDelete";
import { RestorePass } from "./screens/restorePass";
import { CreateUser } from "./screens/createUser";
import { AddProduct } from "./screens/addProduct";
import { EditProduct } from "./screens/editProduct";
import { CodePage } from "./screens/codePage";
import { NewPass } from "./screens/newPass";
import { EditUser } from "./screens/editUser";
import { AddDate } from "./screens/addDate";
import { UserDetails } from "./screens/userDetails";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useState } from "react";

function App() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState();

  return (
    <div className="app">
      <Router>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/mainPage"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminUserPage"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminPage"
            element={
              <AdminPage
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            }
          />
          <Route
            path="/checkDateDelete"
            element={
              <ProtectedRoute>
                <CheckDateDelete
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkDateDelete"
            element={
              <ProtectedRoute>
                <CheckDateDelete selectedIds={selectedIds} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createUser"
            element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route path="/restorePass" element={<RestorePass />} />
          <Route
            path="/createUser"
            element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addProduct"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editProduct/:a_id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/codePage" element={<CodePage />} />
          <Route path="/newPass" element={<NewPass />} />
          <Route
            path="/editUser/:u_id"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addDate/:a_id"
            element={
              <ProtectedRoute>
                <AddDate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userDetails/:id"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
