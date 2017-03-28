import Inferno from 'inferno';
import App from './App';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, Redirect } from 'inferno-router';
import { GameWindow } from './components/GameWindow';
import ScriptList from './components/ScriptList';
import MapView from './components/Map';
import ScriptEditor from './components/editor/Editor';
import Login from './components/Login';
import GameWrapper from './components/game_wrapper';

const browserHistory = createHashHistory();

const routes = (
  <Router history={ browserHistory }>
    <Route component={ App }>
      <IndexRoute component={Login}></IndexRoute>
      <Route path="/login" component={Login}/>
      <Route path='/' component={ GameWrapper }>
        <Route path='/game' component={ GameWindow }></Route>
        <Route path='/scripts/:script' component={ ScriptEditor }></Route>
        <Route path='/scripts' component={ ScriptList }></Route>
        <Route path='/map' component={ MapView }></Route>
      </Route>
    </Route>
  </Router>
);

// Render HTML on the browser
Inferno.render(routes, document.getElementById('app'));
