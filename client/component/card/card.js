import "./card.css";
import React from "react";

export default function Card(props) {
    //console.log("PROPS: " + JSON.stringify(props));
    return (
        <div className="card flex-center flex-row">
            <div className="card-content">
                <div class="title">{props.title}</div>
                <div class="subtitle">{props.subtitle}</div>
                <div class="art_body">{props.art_body}</div>
            </div>
        </div>
    );
}