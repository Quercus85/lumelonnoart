import React from "react";
import "./header.css";
import { Outlet, Link } from "react-router-dom";

export default function Header(){
    return (
    <div className="header flex-center flex-row">
        <span><Link to={`/`} className="link">Home</Link></span>
        <span><Link to={`about`} className="link">About me</Link></span>
        <span><Link to={`/`} className="link">Gallery</Link></span>
        <span><Link to={`/`} className="link">Comics</Link></span> 
    </div>
    );
}