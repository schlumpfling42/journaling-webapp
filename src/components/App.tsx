import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { PopupComponent } from "../components/popup";
import * as routes from "../constants/routes";
import { firebase } from "../firebase";
import { withAuthentication } from "../firebase/withAuthentication";
import { Anger } from "../pages/Anger";
import { Contacts } from "../pages/Contacts";
import { Habits } from "../pages/Habits";
import { Home } from "../pages/Home";
import { IntegrityChecklist } from "../pages/Integrity Checklist";
import { Journal } from "../pages/Journal";
import { Settings } from "../pages/Settings";
import { Wins } from "../pages/Wins";
import { Navigation } from "./navigation";

import "./app.css";

class AppComponent extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      authUser: null
    };
  }

  public componentDidMount() {
    firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState(() => ({ authUser }))
        : this.setState(() => ({ authUser: null }));
    });
  }

  public render() {
    return (
      <BrowserRouter>
        <div className="app">
          <Navigation />
          <Switch>
            <Route exact={true} path={routes.HOME} component={Home} />
            <Route exact={true} path={routes.WINS} component={Wins} />
            <Route exact={true} path={routes.JOURNAL} component={Journal} />
            <Route exact={true} path={routes.ANGER} component={Anger} />
            <Route exact={true} path={routes.HABITS} component={Habits} />
            <Route exact={true} path={routes.INTEGRITY} component={IntegrityChecklist} />
            <Route exact={true} path={routes.CONTACTS} component={Contacts} />
            <Route exact={true} path={routes.SETTINGS} component={Settings} />
          </Switch>
          <PopupComponent/>
        </div>
      </BrowserRouter>
    );
  }
}

export const App = withAuthentication(AppComponent);
