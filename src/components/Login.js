import Inferno from 'inferno';
import Component from 'inferno-component';
import { auth, session } from '../services/Session';
import ErrorMessage from './ErrorMessage';
import Switch from './switch';

import '../css/login.css';

export default class Login extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      step: 'login',
      loginError: undefined,
      username: '',
      password: '',
    };
  }

  doLogin(username, password) {
    this.setState({ username, password });
    auth.authenticate(this.state.username, this.state.password).then(() => {
      auth.listCharacters().then((characters) => {
        this.setState({ step: 'characterselect', characters });
      }).catch(this.setLoginError.bind(this));
    }).catch(this.setLoginError.bind(this));
  }

  doSessionLogin(s) {
    auth.authenticate(s.get('username'), s.get('password')).then(() => {
      auth.listCharacters().then((characters) => {
        auth.playCharacter(s.get('characterCode')).then((key) => {
          auth.disconnect();
          session.connect(key);
          this.router.push('/game');
        }).catch(this.setLoginError.bind(this));
      }).catch(this.setLoginError.bind(this));
    }).catch(this.setLoginError.bind(this));
  }

  doSelect(c, save) {
    auth.playCharacter(c.code).then((key) => {
      auth.disconnect();
      session.connect(key);
      if (save) {
        auth.saveSession(
          this.state.username,
          this.state.password,
          c.name,
          c.code,
        );
      }

      this.router.push('/game');
    }).catch(this.setLoginError);
  }

  setLoginError(e) {
    console.log('login error', e);
    this.setState({ loginError: e });
  }

  render() {
    var content = '';
    if (this.state.step === 'login') {
      content = (
        <div>
          <LoginForm onLogin={this.doLogin.bind(this)}/>
          <hr/>
          <SessionList onSessionSelect={this.doSessionLogin.bind(this)}/>
        </div>
      );
    }

    if (this.state.step === 'characterselect') {
      content = (
        <CharacterSelect
          characters={this.state.characters}
          onSelect={this.doSelect.bind(this)}/>
      );
    }

    return (
      <div class='window-content'>
        <div class="login-wrapper">
          <div className="login clearfix">
            <ErrorMessage messsge={this.state.loginError}/>
            {content}
          </div>
        </div>
      </div>
    );
  }
}

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loginError: undefined,
    };
  }

  inputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  loginPressed() {
    this.props.onLogin(this.state.username, this.state.password);
  }

  render() {
    return (
      <div class="login-form clearfix">
        <h1>Login</h1>
        <p>Enter your DragonRealms account credentials to login to the account</p>
        <div className="form-group">
          <input type="text"
          placeholder="username"
          name="username"
          value={this.state.username}
          onInput={this.inputChange.bind(this)}
          className="form-control"/>
        </div>

        <div className="form-group">
          <input type="password"
          name="password"
          placeholder="password"
          value={this.state.password}
          onInput={this.inputChange.bind(this)}
          className="form-control"/>
        </div>
        <button class="btn btn-primary pull-right btn-large"
          onClick={this.loginPressed.bind(this)}>
            Login
          </button>
      </div>
    );
  }
}

class CharacterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { save: false };
  }

  render() {
    return (
      <div>
        <h1>Character Selection</h1>
        <p>
          Select the character to login. To save this session to quickly
          login later click <strong>"Save Session"</strong>
        </p>
        <ul class="list-group character-select">
          {this.props.characters.map((c, i) =>
          <li class="list-group-item"
              onClick={() => this.props.onSelect(c, this.state.save)}>
            <div class="media-body">
              <strong>{c.name}</strong>
              <p>{c.code}</p>
            </div>
          </li>
          )}
        </ul>
        <Switch label="Save Session"
          checked={this.state.save}
          onChange={(e) => this.setState({ save:  e })}/>
      </div>
    );
  }
}

class SessionList extends Component {

  constructor(props) {
    super(props);
    this.state = { sessions: [] };
  }

  componentDidMount() {
    auth.getSavedSessions().then((sessions) => {
      this.setState({ sessions });
    });
  }

  sessionClicked(session) {
    if (this.props.onSessionSelect) {
      this.props.onSessionSelect(session);
    }
  }

  deleteClicked() {
    console.log('delete');
  }

  render() {
    return (
      <ul class="session-list">
        {this.state.sessions.map(s =>
          <div class="item">
            <div class="details" onClick={this.sessionClicked.bind(this, s)}>
              <div class="glyph"><i class="fa fa-circle"></i></div>
             <span class="name">{s.get('characterName')}</span>
             <span class="username">{s.get('username')}</span>
            </div>
           <div class="tools">
            <i class="fa fa-trash" onClick={this.deleteClicked.bind(this)}></i>
           </div>
        </div>
        )}
      </ul>
    );
  }

}
