import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link } from 'inferno-router';

import {auth, session} from './services/Session';

class App extends Component {

  constructor(props) {
    super(props);
    this.login()
    this.session = session;
  }

  login() {
    auth.authenticate('', '').then(() => {
      console.log('logged in');
      auth.listCharacters().then((characters) => {
        console.log('game list ', characters);
        auth.playCharacter(characters[0].code).then((key) => {
          console.log('Session validated');
          auth.disconnect();
          session.connect(key);
        });
      });
    });
  }


  render() {
    return (
      <div class='window'>
        <header class='toolbar toolbar-header' style='-webkit-app-region: drag'>
          <h1 class='title'>Tempest Client</h1>
          <div class='toolbar-actions'>
            <div class='btn-group'>
              <button class='btn btn-default'>
                <span class='icon icon-plus'></span>
              </button>
            </div>
          </div>
        </header>
        <div class='window-content'>
          <div class='pane-group'>
            <div class='pane-sm sidebar'>
              <nav class='nav-group'>
                <h5 class='nav-group-title'>Sessions</h5>
                <Link to='/game' className='nav-group-item active'>
                  <span class='icon icon-block'></span>
                  Wyloth
                </Link>
                <h5 class='nav-group-title'>Tools</h5>
                <a class='nav-group-item'>
                  <span class='icon icon-code'></span>
                  Scripts
                </a>
                <h5 class='nav-group-title'>Active Scripts</h5>
                <a class='nav-group-item'>
                  Hunting
                </a>
                <h5 class='nav-group-title'>Plugins</h5>
                <a class='nav-group-item'>
                  Moon Watcher
                </a>
              </nav>
            </div>
            <div class='pane'>{ this.props.children }</div>
          </div>
        </div>
        <footer class='toolbar toolbar-footer'>
          <div class='toolbar-actions'>
            <button class='btn btn-default btn-dropdown pull-right'>
             <span class='icon icon-light-up'></span>
             <span class='icon icon-connect'></span>
           </button>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
