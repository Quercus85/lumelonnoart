import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../client/component/header/header";

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket)); //TODO SPOSTA QUESTA LOGICA IN UN FILE APPOSITO
// Use localStorage to store our login token
//client.configure(feathers.authentication());

const images = await client.service('images').find();
console.log(JSON.stringify(images))  

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
