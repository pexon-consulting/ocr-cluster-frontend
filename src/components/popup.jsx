import React from "react"
// import "..//styles/popup.css"
import {Button, CircularProgress} from "@mui/material";
// import Popup from 'reactjs-popup';
import Tooltip from "@mui/material/Tooltip";
export const Popup = ({ signedurl, preprocessing, processing, status, closePopup }) => {
    return (
        // <div className="popup-container">
        //     <div className="popup-body">
        //         <h1>System Info</h1>
        //         <p>Signed URL Function: {signedurl}</p>
        //         <p>Preprocessing Function: {preprocessing}</p>
        //         <p>Processing Function: {processing}</p>
        //         <p>Status Function: {status}</p>
        //         <button onClick={closePopup}>Close X</button>
        //     </div>
        // </div>

        <Popup
            // trigger={<Button type="submit">View System Info</Button>}
            // modal
            // nested
        >
            {() => (
                <div className="popup-container">
                    <div className="popup-body">
                        <h1>System Info</h1>
                        <p>Signed URL Function: {signedurl}</p>
                        <p>Preprocessing Function: {preprocessing}</p>
                        <p>Processing Function: {processing}</p>
                        <p>Status Function: {status}</p>
                        <button onClick={closePopup}>Close X</button>
                    </div>
                </div>
            )}
        </Popup>
    );
};