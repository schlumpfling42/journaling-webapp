import React, {useEffect, useState} from "react";
import { firebase } from "../firebase";
import { AuthUserContext } from "./AuthUserContext";
import { authProvider } from "./firebase";
import "./withAuthentication.css";

export const withAuthentication = (Component: any) => {
  return  (props: any) => {
    const [authUser, setAuthUser] = useState<any>();

    useEffect(() => {
      firebase.auth.getRedirectResult().then(result => {
        if (result.user) {
          setAuthUser(result.user);
        } else {
          doLoginRedirect();
        }
       });
    }, []);
        
    const doLoginRedirect = () => {
      firebase.auth.signInWithRedirect(authProvider);
    }

    if(authUser) {
      return (
        <AuthUserContext.Provider value={authUser}>
          <Component { ...props} authUser={authUser}/>
        </AuthUserContext.Provider>
      );
    } else {
      return (
        <div className="cssload-container">
          <div className="cssload-speeding-wheel"/>
        </div>
      );
    }
  }
};
