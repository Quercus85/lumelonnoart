import React from "react";
import ReactDOM from "react-dom/client";
import Header from "./header/header";

export default function App(){
    return (
    <div>
        <Header/>
        <h3>Placeholder text</h3>
        <h2>More placeholder fuckery</h2>
    </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
