import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {PublicClientApplication} from "@azure/msal-browser";
import {AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate} from "@azure/msal-react";
import {msalConfig} from "./authConfig";
import Content from "./components/content";
// import Login from "./components/login";

const pca = new PublicClientApplication(msalConfig);


const root = ReactDOM.createRoot(document.getElementById('root'));
// if (window.STAGE === "MAIN" || window.STAGE === "DEMO") {
    root.render(
        <React.StrictMode>
            <Content/>
        </React.StrictMode>
    );
// } else {
//     root.render(
//         <React.StrictMode>
//             <MsalProvider instance={pca}>
//                 <AuthenticatedTemplate>
//                     <Content/>
//                 </AuthenticatedTemplate>
//                 <UnauthenticatedTemplate>
//                     <Login/>
//                 </UnauthenticatedTemplate>
//             </MsalProvider>
//         </React.StrictMode>
//     );
// }
