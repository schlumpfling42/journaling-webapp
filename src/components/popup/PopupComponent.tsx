import React from 'react';
import "./Popup.css";

export const Component = (props: any) => {
    const visible = props.visible;
    
    const title = props.title;
    const message = props.message ? (props.message.length > 100 ? props.message.substring(0,100) + "... ?" : props.message) : "Do you want to delete this value ?";

    const confirmIcon = props.confirmIcon ? props.confirmIcon : "check";
    const confirmCallback = props.confirmCallback;

    const cancelIcon = props.cancelIcon ? props.cancelIcon : "clear";
    const cancelCallback = props.cancelCallback;

    if(visible) {
        return(
            <div className="popup">
                <div className="popup-frame">
                    <div className="popup-dialog">
                        <div className="popup-title">{title}</div>
                        <div className="popup-message">{message}</div>
                        <div className="popup-buttons">
                            <button className="popup-confirm" onClick={confirmCallback}>
                                <i className="material-icons md-dark value-button">{confirmIcon}</i>
                            </button>
                            <button className="popup-cancel" onClick={cancelCallback}>
                                <i className="material-icons md-dark value-button">{cancelIcon}</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return(null);
    }
}