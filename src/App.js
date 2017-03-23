import Inferno from 'inferno';
import Component from 'inferno-component';

import { session } from './services/Session';

import './css/main.css';

class App extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
    session.on('disconnected', () => {
      router.push('/login');
    });
  }

  minimize() {
    const { remote } = window.require('electron');
    remote.BrowserWindow.getFocusedWindow().minimize();
  }

  maximize() {
    const { remote } = window.require('electron');
    const win = remote.BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }

  close() {
    const { remote } = window.require('electron');
    remote.BrowserWindow.getFocusedWindow().close();
  }

  render() {
    return (
      <div class='window'>
        <header class='titlebar'>
          <div class='left'>
            <div class="item" onClick={this.close}>
              <i class='fa fa-times'></i>
            </div>
            <div class="item" onClick={this.minimize}>
              <i class='fa fa-minus'></i>
            </div>
            <div class="item" onClick={this.maximize}>
              <i class='fa fa-square-o'></i>
            </div>
          </div>
          <div class='right'>
            <div class='item'>
              <i class='fa fa-plug danger'></i>
            </div>
            <div class='item'>
              <i class='fa fa-cloud danger'></i>
            </div>
          </div>
        </header>
        {this.props.children}
      </div>
    );
  }
}

export default App;
