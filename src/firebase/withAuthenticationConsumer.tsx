import * as React from "react";
import { AuthUserContext } from "./AuthUserContext";

export const withAuthenticationConsumer = (Component: any) => {
  return (props: any) => {

      return (
        <AuthUserContext.Consumer>
          {({authUser, fbAccessToken, fbUserId}) => (
            <Component authUser={authUser} fbAccessToken={fbAccessToken} fbUserId={fbUserId} {...props} />
          )}
        </AuthUserContext.Consumer>
      );
  }
}
