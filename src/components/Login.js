import Inferno from 'inferno';
import Component from 'inferno-component';
import { auth, session } from '../services/Session';
import ErrorMessage from './ErrorMessage';
import Switch from './switch';
import { ConfirmModal, WaitModal, MessageModal } from './Modal';

export default class Login extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      step: 'login',
      loginError: false,
      username: '',
      password: '',
      waitMessage: '',
      waitShow: '',
      waitTitle: '',
    };
  }

  doLogin(username, password) {
    this.setState({
      waitShow: true,
      waitTitle: 'Logging in',
    });
    this.setState({ username, password });
    auth.authenticate(this.state.username, this.state.password).then(() => {
      this.setState({
        waitTitle: 'Credentials validated. Retrieving characters.',
      });
      auth.listCharacters().then((characters) => {
        this.setState({ step: 'characterselect', characters, waitShow: false });
      }).catch(this.setLoginError.bind(this));
    }).catch(this.setLoginError.bind(this));
  }

  doSessionLogin(s) {
    this.setState({
      waitShow: true,
      waitTitle: 'Logging in',
      loginError: undefined,
    });
    auth.authenticate(s.get('username'), s.get('password')).then(() => {
      auth.listCharacters().then((characters) => {
        this.setState({
          waitTitle: 'Credentials validated. Loading session.',
        });
        auth.playCharacter(s.get('characterCode')).then((key) => {
          auth.disconnect();
          this.setState({
            waitShow: false,
            waitTitle: '',
          });
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
        ).catch(() => {});
      }

      this.router.push('/game');
    }).catch(this.setLoginError);
  }

  setLoginError(e) {
    this.setState({ waitShow: false });
    this.setState({ loginError: true });
    auth.disconnect();
  }

  disconnect() {
    auth.disconnect();
    this.setState({ step: 'login' });
  }

  render() {
    var content = '';
    if (this.state.step === 'login') {
      content = (
        <div class="login">
          <LoginForm onLogin={this.doLogin.bind(this)}/>
          <SessionList onSessionSelect={this.doSessionLogin.bind(this)}/>
        </div>
      );
    }

    if (this.state.step === 'characterselect') {
      content = (
        <div class="login">
          <CharacterSelect
            onCancel={this.disconnect.bind(this)}
            characters={this.state.characters}
            onSelect={this.doSelect.bind(this)}/>
        </div>
      );
    }

    return (
      <div class='window-content'>
        <div class="padded-more">
          <WaitModal show={this.state.waitShow} title={this.state.waitTitle}>
            {this.state.waitMessage}
          </WaitModal>
          <MessageModal show={this.state.loginError} title="Login Error">
            Could not login.
          </MessageModal>
          {content}
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
      <div class='login-form clearfix'>
        <h1>Login</h1>
        <p>Enter your DragonRealms account credentials to login to the account</p>
        <div className='form-group'>
          <input type='text'
          placeholder='username'
          name='username'
          value={this.state.username}
          onInput={this.inputChange.bind(this)}
          className='form-control'/>
        </div>

        <div className='form-group'>
          <input type='password'
          name='password'
          placeholder='password'
          value={this.state.password}
          onInput={this.inputChange.bind(this)}
          className='form-control'/>
        </div>
        <div class='buttons'>
          <button class='btn primary'
            onClick={this.loginPressed.bind(this)}>
              Login
          </button>
        </div>
      </div>
    );
  }
}

class CharacterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { save: false };
  }

  onCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  render() {
    return (
      <div>
        <h1>Character Selection</h1>
        <p>
          Select the character to login. To save this session to quickly
          login later click <strong>"Save Session"</strong>
        </p>
        <ul class='list-group character-select'>
          {this.props.characters.map((c, i) =>
          <li class='list-group-item'
              onClick={() => this.props.onSelect(c, this.state.save)}>
            <div class='media-body'>
              <strong>{c.name}</strong>
              <p>{c.code}</p>
            </div>
          </li>
          )}
        </ul>
        <Switch label='Save Session'
          checked={this.state.save}
          onChange={(e) => this.setState({ save:  e })}/>
          <div class="buttons">
            <button class='btn btn-primary pull-right btn-large'
              onClick={this.onCancel.bind(this)}>
                Cancel
            </button>
          </div>
      </div>
    );
  }
}

class SessionList extends Component {

  constructor(props) {
    super(props);
    this.state = { sessions: [], confirmDelete: false };
  }

  componentDidMount() {
    this.loadSessions();
  }

  loadSessions() {
    auth.getSavedSessions().then((sessions) => {
      this.setState({ sessions });
    });
  }

  sessionClicked(session) {
    if (this.props.onSessionSelect) {
      this.props.onSessionSelect(session);
    }
  }

  confirmDelete(s) {
    this.setState({
      confirmDelete: true,
      deleteSessionCode: s.get('characterCode'),
    });
  }

  deleteSession() {
    this.setState({ confirmDelete: false });
    auth.deleteSessionByCode(this.state.deleteSessionCode).then(() => {
      this.loadSessions();
    });
  }

  render() {
    return (
      <div>
        <div class='session-list'>
          {this.state.sessions.map(s =>
            <div class='item lift-box'>
              <div class='details' onClick={this.sessionClicked.bind(this, s)}>
               {s.get('characterName')}
              </div>
             <div class='delete' onClick={this.confirmDelete.bind(this, s)}>
              <i class='fa fa-trash'></i>
             </div>
          </div>
          )}
        </div>
        { this.state.sessions.length == 0 &&
          <p class='no-sessions'>No saved sessions</p>
        }
        <ConfirmModal title='Delete Session'
          confirm={this.deleteSession.bind(this)}
          show={this.state.confirmDelete}>
          Are yopu sure you want to remove this session?
        </ConfirmModal>
      </div>
    );
  }

}
