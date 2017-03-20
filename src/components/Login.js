import Inferno from 'inferno';
import Component from 'inferno-component';
import { auth, session } from '../services/Session';
import ErrorMessage from './ErrorMessage';

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
    //this.setState({ loginError: e });
  }

  render() {
    var content = '';
    if (this.state.step === 'login') {
      content = <LoginForm onLogin={this.doLogin.bind(this)}/>;
    }

    if (this.state.step === 'characterselect') {
      content = (
        <CharacterSelect
          characters={this.state.characters}
          onSelect={this.doSelect.bind(this)}/>
      );
    }

    return (
      <div class="pane-group">
        <div class="pane-sm sidebar">
          <SessionList/>
        </div>
        <div class="pane">
          <div className="login">
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
      <div class="login-form">
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
        <h1>Login</h1>
        <p>Enter your DragonRealms account credentials to login to the account</p>
        <ul class="list-group">
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
        <label>
          <input type="checkbox"
            checked={this.state.save}
            onChange={(e) => this.setState({save: e.target.value})}/>
            Save Session
        </label>
      </div>
    );
  }
}

class SessionList extends Component {

  constructor(props) {
    super(props);
    this.state = { sessions: [], selectedSession: undefined }
  }

  componentDidMount() {
    auth.getSavedSessions().then((sessions) => {
      this.setState({ sessions });
    });
  }

  sessionClicked(selectedSession) {
    console.log(selectedSession);
    this.setState({ selectedSession });
  }

  itemCls(session) {
    if (session == this.state.selectedSession) {
      return 'list-group-item selected';
    } else {
      return 'list-group-item';
    }
  }

  render() {
    return (
      <ul class="list-group">
        <li class="list-group-header">
          Saved Sessions
        </li>
        {this.state.sessions.map(s =>
          <li
            className={this.itemCls(s)}
            onClick={this.sessionClicked.bind(this, s)}>
            <div class="media-body">
             <strong>{s.get('characterCode')}</strong>
             <p>{s.get('username')}</p>
           </div>
        </li>
        )}
      </ul>
    )
  }

}
