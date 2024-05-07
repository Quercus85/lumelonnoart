import React from "react";
import "./header.css";
import { Outlet, Link } from "react-router-dom";

export default function Header(){
    return (
    <div className="header flex-center flex-row">
        <span><Link to={`/`}>Home</Link></span>
        <span><Link to={`about`}>About me</Link></span>
        <span>Gallery</span>
        <span>Comics</span> 
    </div>
    );
}