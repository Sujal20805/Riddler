/** @format */

import { Outlet } from "react-router-dom";
import PreNavbar from "./Components/PreNavbar.jsx";

function App() {
  return (
    <>
        <PreNavbar />
        <div className="flex-grow-1" style={{ overflowY: "auto" }}>
        <Outlet />
        </div>
    </>
  );
}

export default App;