import React from "react";
import { Link } from "react-router-dom";
function Navbar(){
    return(
        <div>
        <h1>this is navbar</h1>
        <Link to="/login">Login</Link>
        </div>
    );
}

export default Navbar;