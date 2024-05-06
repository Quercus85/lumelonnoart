import React from "react";
import ReactDOM from "react-dom/client";
import Header from "./component/header/header";

export default function App(){
    return (
    <div>
        <Header/>
        <h3>Placeholder text</h3>
    </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
