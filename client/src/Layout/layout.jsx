import { useState } from "react";
import Navbar from "../components/Navbar";
import AddExpense from "../components/AddExpense";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const Layout = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <>
      <Navbar onAddExpense={() => setShowAddExpense(true)} />
      <Outlet />
      <Footer />
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onAdd={(expense) => {
            console.log(expense);
            setShowAddExpense(false);
          }}
        />
      )}
    </>
  );
};

export default Layout;
