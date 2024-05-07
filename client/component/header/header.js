import React from "react";
import "./header.css";
import { Outlet, Link } from "react-router-dom";

export default function Header(){
    return (
    <div className="header flex-center flex-row">
        <Link to={`/`} className="link">Home</Link>
        <Link to={`about`} className="link">About me</Link>
        <Link to={`/`} className="link">Gallery</Link>
        <Link to={`/`} className="link">Comics</Link> 
    </div>
    );
}