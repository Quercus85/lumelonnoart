import React from "react";
import "./header.css";

export default function Header(){
    //TODO togli il link riga 11
    return (
    <div className="header flex-center flex-row">
        <span>Home</span>
        <span>About me</span>
        <span>Gallery</span>
        <span><a href="/pippolette">Comics</a></span> 
    </div>
    );
}