import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { format } from "../src/utils/tags-of_images-json-formatter";

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
const client = feathers();

client.configure(feathers.socketio(socket));

async function getImages() {
    const images = await client.service("images").find();
    const jsonResponse = format(images);
    return jsonResponse;
}

export default function About() {
    const [response, setResponse] = useState(null);

    // Prende i dati dopo il caricamento della pagina
    useEffect(() => {
        const fetchData = async () => {
            const result = await getImages();
            setResponse(result);
        };

        fetchData();
    }, []); // Aggiungi eventuali dipendenze qui

    console.log(response);
    if (response) {
        console.log(response[0].image_url);
    }

    /*
    TODO: il json delle tag contiene gli id invece delle sole descrizione. Fixalo
    tags: Array(6) [ "1", "2020", "3", … ]
        0: "1"
        1: "2020"
        2: "3"
        3: "Sketch"
        4: "4"
        5: "Comic"
    */
    return (
        <>
            <h3>This is the About Me page</h3>
            {response ? (
                response.map((item, index) => (
                    <div key={index}>
                        <p>Id: {item.id}</p>
                        <p>Title: {item.image_name}</p>
                        <a href={item.image_url} ><img src={item.image_thumb} /></a>
                        <div>Tags:
                            {item.tags.map((tag, index) => (
                                <div key={index}>
                                    <span>{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>Loading data...</p>
            )
            }
        </>
    );
}
