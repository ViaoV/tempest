import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link } from 'inferno-router';

import { auth, session } from './services/Session';

import './css/status-bar.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      indicators: {},
    };
    session.on('state', (state) => {
      console.log(state);
      this.setState(state)
    });
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
        }).catch(this.loginError);
      }).catch(this.loginError);
    }).catch(this.loginError);
  }

  loginError(e) {
    console.error('Login error: ' + e);
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
            <StatusBarLabelItem label='L' value={this.state.left} />
            <StatusBarLabelItem label='R' value={this.state.right} />
            <StatusBarLabelItem label='SP' value={this.state.spell} />
            <div className='status-seperator-item'></div>
            <StatusBarTextItem active={this.state.indicators.grouped}>
              <i className='fa fa-fw fa-users'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.hidden}>
              <i className='fa fa-fw fa-user-secret'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.invisible}>
              <i className='fa fa-fw fa-eye-slash'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.bleeding}>
              <i className='fa fa-fw fa-heart'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.stunned}>
              <i className='fa fa-fw fa-star'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.webbed}>
              <i className='fa fa-fw fa-bolt'></i>
            </StatusBarTextItem>
            <StatusBarTextItem active={this.state.indicators.dead}>
              <i className='fa fa-fw fa-times'></i>
            </StatusBarTextItem>
            <div className='status-seperator-item'></div>
            <StatusBarProgress value='40' cls='blue'/>
            <StatusBarProgress value='80' cls='red'/>
            <StatusBarProgress value='20' cls='yellow'/>
          </div>
        </footer>
      </div>
    );
  }
}

class StatusBarTextItem extends Component {
  render() {
    var cls = 'btn status-item';
    if (this.props.active) {
      cls += ' active';
    }
    return (
      <div className={cls}>{this.props.children}</div>
    );
  }
}

class StatusBarLabelItem extends Component {
  render() {
    return (
      <div className='btn btn-default status-label-item'>
        <span class='label'>{this.props.label}</span>
        {this.props.value}
      </div>
    );
  }
}

class StatusBarProgress extends Component {
  render() {
    var cls = 'inner-bar ' + this.props.cls;
    return (
      <div className='status-progress'>
        <div className={cls} style={{width: this.props.value + '%'}}></div>
      </div>
    );
  }
}




export default App;
