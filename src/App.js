import Inferno from 'inferno';
import Component from 'inferno-component';

import { session } from './services/Session';

import './css/main.css';

class App extends Component {

  constructor(props, { router }) {
    super(props);
    this.state = {
      loggedIn: false,
      cloudConnected: false,
    };

    this.router = router;
  }

  componentDidMount() {
    session.on('disconnected', () => {
      this.router.push('/login');
      this.setState({ loggedIn: false });
    });

    session.on('connected', () => {
      this.setState({ loggedIn: true });
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

  iconCls(icon, flag) {
    var cls = ['fa', 'fa-' + icon];
    if (this.state[flag] === true) {
      cls.push('success');
    } else {
      cls.push('danger');
    }

    return cls.join(' ');
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
              <i className={this.iconCls('plug', 'loggedIn')}></i>
            </div>
            <div class='item'>
              <i className={this.iconCls('cloud', 'cloudConnected')}></i>
            </div>
          </div>
        </header>
        {this.props.children}
      </div>
    );
  }
}

export default App;
