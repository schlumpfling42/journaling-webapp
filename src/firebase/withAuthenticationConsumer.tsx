import * as React from "react";
import { AuthUserContext } from "./AuthUserContext";

export const withAuthenticationConsumer = (Component: any) => {
  return (props: any) => {

      return (
        <AuthUserContext.Consumer>
          {authUser => (
            <Component authUser={authUser} {...props} />
          )}
        </AuthUserContext.Consumer>
      );
  }
}
