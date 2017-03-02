import Inferno from 'inferno';
import App from './App';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute } from 'inferno-router';
import GameWindow from './components/game_window';

const browserHistory = createHashHistory();

const routes = (
  <Router history={ browserHistory }>
    <Route component={ App }>
      <IndexRoute component={ GameWindow }/>
      <Route path='/game' component={ GameWindow }></Route>
    </Route>
  </Router>
);

// Render HTML on the browser
Inferno.render(routes, document.getElementById('app'));
