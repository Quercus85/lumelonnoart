import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
const client = feathers();

client.configure(feathers.socketio(socket));

async function getImages() {
    const images = await client.service("images").find();
    return images;
}

export default function About() {
    const [response, setResponse] = useState(null);
    //prende i dati dopo il caricamento della pagina
    useEffect(() => {
        const fetchData = async () => {
            const result = await getImages();
            setResponse(result);
        };

        fetchData();
    }, []); // Aggiungi eventuali dipendenze qui
    console.log(response);
    return (
        <>
            <h3>This is the About Me page</h3>
            {response ? (
                <p>Total: {response.total}</p>
            ) : (
                <p>Loading data...</p>
            )}
        </>
    );
}
