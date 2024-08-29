import "./card.css";
import React from "react";
import Breadcrumbs from "../breadcrumbs/breadcrumbs";

export default function Card(props) {
    //console.log("PROPS: " + JSON.stringify(props));
    return (
        <div className="card flex-center flex-row">
            <div className="card-content">
                <div class="title">{props.title}</div>
                <div class="subtitle">{props.subtitle}</div>
                <div class="art_body">{props.art_body}</div>
                <Breadcrumbs tags={props.tags} />
            </div>
        </div>
    );
}