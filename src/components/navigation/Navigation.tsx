import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import * as routes from "../../constants/routes";
import { AuthUserContext } from "../../firebase/AuthUserContext";
import "./Navigation.css";

export const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser => (authUser ? <NavigationAuth /> : <NavigationNonAuth />)}
  </AuthUserContext.Consumer>
);

const NavigationAuth = () => (
  <div id="navigation_bar">
    <Link to={routes.HOME}>
    <i key={"settings_img"} className="material-icons md-dark value-button">home</i>
    </Link>
    <div id="content_tabs">
        <NavLink activeClassName="activLink" to={routes.WINS}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">military_tech</i>
            <div>Wins</div>
          </div>
        </NavLink>
        <NavLink activeClassName="activLink" to={routes.JOURNAL}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">book</i>
            <div>Journal</div>
          </div>
        </NavLink>
        <NavLink activeClassName="activLink" to={routes.ANGER}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">record_voice_over</i>
            <div>Anger</div>
          </div>
        </NavLink>
        <NavLink activeClassName="activLink" to={routes.HABITS}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">pending_actions</i>
            <div>Habits</div>
          </div>
        </NavLink>
        <NavLink activeClassName="activLink" to={routes.INTEGRITY}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">check_circle</i>
            <div>Integrity</div>
          </div>
        </NavLink>
        <NavLink activeClassName="activLink" to={routes.CONTACTS}>
          <div className="nav-title">
            <i className="material-icons md-dark nav-button">emoji_people</i>
            <div>Contacts</div>
          </div>
        </NavLink>
    </div>
    <div id="settings_tab">
      <NavLink activeClassName="activLink" to={routes.SETTINGS}>
        <i key={"settings_img"} className="material-icons md-dark value-button">settings</i>
      </NavLink>
    </div>
  </div>
);

const NavigationNonAuth = () => (
  <ul />
);
