import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../client/component/header/header";

export default function Root() {
    
    return (
        <>
            <Header />
            <div>
                <Outlet />
            </div>
        </>
    );
}
