import "./breadcrumbs.css";
import React from "react";

export default function Breadcrumbs(props) {
    console.log("PROPS: " + JSON.stringify(props));
    const tags = props.tags;

    return (
        <div className="breadcrumb flex-center flex-row">
            <div className="tag-intestation">Tags:</div>
            {
                tags.map((item, index) => (
                    item != null ?
                        <span key={index} className="breadcrumb-tag">{item}</span> :
                        <span />
                ))
            }
        </div>
    );
}