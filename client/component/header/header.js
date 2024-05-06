import React from "react";
import "./header.css";

export default function Header(){
    return (
    <div className="header flex-center flex-row">
        <span>Home</span>
        <span>About me</span>
        <span>Gallery</span>
        <span>Comics</span>
    </div>
    );
}