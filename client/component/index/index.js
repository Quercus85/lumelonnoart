import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { tagsFormatter } from "../../../src/utils/tags-json-formatter";
import Card from "../card/card";

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
const client = feathers();

client.configure(feathers.socketio(socket));

async function getBlogArticles() {
    const articles = await client.service("articles").find({
        $skip: 0,
        $limit: 10 //TODO scopri perchè non prende questi parametri
    });
    const jsonOutput = tagsFormatter(articles);

    const imageIds = articles.data
        .filter(article => article.image_id !== null)
        .map(article => article.image_id);
    const images = await client.service('images').find({
        query: {
            article_id: {
                $in: imageIds
            }
        }
    });

    jsonOutput.forEach(article => {
        article.images = images.data.filter(image => image.article_id === article.image_id);
    });

    return jsonOutput;
}


export function Index() {

    const [articles, setArticles] = useState(null);

    // Prende i dati dopo il caricamento della pagina
    useEffect(() => {
        const fetchData = async () => {
            const result = await getBlogArticles();
            setArticles(result);
        };

        fetchData();
    }, []); // Aggiungi eventuali dipendenze qui

    return (
        <div>
            <h3>Well comed, and well met !</h3>
            <p>Don't forget to check the gallery !</p>
            <p>Here's the latest posts:</p>
            <div class="card-container">
                {articles ? (
                    articles.map((item) => (
                        <Card title={item.title} subtitle={item.subtitle} art_body={item.art_body} tags={item.tags} images={item.images} />
                    ))
                ) : (
                    <p>Loading data...</p>
                )
                }
            </div>
        </div>
    );
}