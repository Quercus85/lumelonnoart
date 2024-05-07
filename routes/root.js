import React from "react";
import { Index } from "../client/component/index";
import { Outlet } from "react-router-dom";

export default function Root() {
    return (
        <>
            <div>
                <Outlet />
            </div>
        </>
    );
}
