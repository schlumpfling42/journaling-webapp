import React, {useEffect, useState} from "react";
import { firebase } from "../firebase";
import { AuthUserContext } from "./AuthUserContext";
import { authProvider } from "./firebase";
import "./withAuthentication.css";

export const withAuthentication = (Component: any) => {
  return  (props: any) => {
    const [authUser, setAuthUser] = useState<any>();
    const [additionalUserInfo, setAdditionalUserInfo] = useState<any>();
    const [accessToken, setAccessToken] = useState<any>();

    useEffect(() => {
      firebase.auth.getRedirectResult().then(result => {
        if (result.user) {
          setAuthUser(result.user);
          setAdditionalUserInfo(result.additionalUserInfo);
          const credential: any = result.credential;
          setAccessToken(credential.accessToken);
        } else {
          doLoginRedirect();
        }
       });
      //  firebase.auth.onAuthStateChanged((result: any) => {
      //   if (result) {
      //     result.getIdToken().then((idToken: any) => {
      //         setAccessToken(idToken);
      //     });
      //   }
      //  });
    }, []);
        
    const doLoginRedirect = () => {
      firebase.auth.signInWithRedirect(authProvider);
    }

    if(authUser && additionalUserInfo && accessToken) {
      return (
        <AuthUserContext.Provider value={{authUser, fbUserId: additionalUserInfo.profile.id, fbAccessToken: accessToken}}>
          <Component { ...props} authUser={authUser} fbUserId={additionalUserInfo.profile.id} fbAccessToken={accessToken}/>
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
