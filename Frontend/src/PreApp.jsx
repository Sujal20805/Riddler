import { Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";

function App() {
  return (
    <>
      <Navbar />
      <div className="flex-grow flex flex-col overflow-y-auto">
        <Outlet />
      </div>
    </>
  );
}

export default App;
