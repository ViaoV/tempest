import Inferno from 'inferno';
import Component from 'inferno-component';
import '../css/game-window.css';
import { session, scriptEngine } from '../services/Session';
import $ from 'jquery';

export default class GameWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameLines: [],
      inputText: '',
      gameState: {
        resources: {},
      },
    };
    this.inputHistory = [];
    this.inputHistoryIndex = -1;
    session.on('message', (msg) => {
      if (msg.stream === 'game') {
        var buf = this.state.gameLines.slice();
        buf.push(msg);
        this.setState({
          gameLines: buf.slice(Math.max(buf.length - 100, 0)),
        });
      }
    });
    session.on('state', (s) => this.setState({ gameState: s }));
  }

  componentDidMount() {
    this.setState({ gameLines: session.streams.get('game') });
    this.inputEl.focus();
  }

  componentDidUpdate() {
    this.el.scrollTop = this.el.scrollHeight;
  }

  handleKeyBinds(code) {
    var bindings = {
      Numpad1: 'SW',
      Numpad2: 'S',
      Numpad3: 'SE',
      Numpad4: 'W',
      Numpad5: 'OUT',
      Numpad6: 'E',
      Numpad7: 'NW',
      Numpad8: 'N',
      Numpad9: 'NE',
      Numpad0: 'DOWN',
      NumpadDecimal: 'UP',
      NumpadAdd: 'LOOK',
      NumpadMultiply: 'EXP',
    };
    if (bindings[code]) {
      session.sendNow(bindings[code] + '\n');
      return true;
    }


    return false;
  }

  onInputKeyDown(e) {
    if (e.keyCode == 27) {
      e.preventDefault()
      console.log('clearing pending commands');
      session.clearPendingActions();
      console.log('sendQueue ', session.sendBuffer.length);
    }

    if (e.keyCode == 38) {
      e.preventDefault();
      if (this.inputHistoryIndex  < this.inputHistory.length - 1) {
        this.inputHistoryIndex = this.inputHistoryIndex + 1;
        if (this.inputHistoryIndex == -1) {
          this.setState({inputText: '' });
        } else {
          this.setState({inputText: this.inputHistory[this.inputHistoryIndex]});
        }
      }
    }
    if (e.keyCode == 40) {
      e.preventDefault();
      if (this.inputHistoryIndex > -1) {
        this.inputHistoryIndex = this.inputHistoryIndex - 1;
        this.setState({inputText: this.inputHistory[this.inputHistoryIndex]});
      }
    }
  }

  onInputKeyPress(e) {
    this.inputHistoryIndex = -1;
    if (this.handleKeyBinds(e.code)) {
      e.preventDefault();
      return false;
    }
    if (!this.state.inputText) {
      return;
    }
    var msg = this.state.inputText.trim();
    if (e.keyCode === 13) {
      if (msg[0] == '.') {
        var tokens =  msg.substring(1).split(' ');
        var scriptName = tokens.shift();
        scriptEngine.loadScript(scriptName, tokens);
      } else {
        this.inputHistory.unshift(msg)
        session.sendNow(msg + '\n');
      }

      this.setState({ inputText: '' });
    }
  }

  inputChange(e) {
    this.setState({ inputText: e.target.value });
  }

  get roundTimePercent() {
    var rt = this.state.gameState.roundTimeEnd - this.state.gameState.time;
    if (rt <= 0) {
      return 0;
    }

    return Math.floor(rt / this.state.gameState.roundTimeSeconds * 100) + '%';
  }

  render() {
    return (
      <div class='game-window-container'>
        <div className='game-window selectable-text'
          ref={(el) => this.el = el }>
          {this.state.gameLines.map(i =>
            <GameLine line={i}/>
          )}
        </div>
        <div class='status-bars'>
          <div class='bar health'>
            <span class='text'>Health</span>
            <div class='progress'
              style={{width: this.state.gameState.resources.health + '%'}}></div>
          </div>
          <div class='bar mana'>
            <span class='text'>Mana</span>
            <div class='progress'
              style={{width: this.state.gameState.resources.mana + '%'}}></div>
          </div>
          <div class='bar stamina'>
            <span class='text'>Stamina</span>
            <div class='progress'
              style={{width: this.state.gameState.resources.stamina + '%'}}></div>
          </div>
          <div class='bar concentration'>
            <span class='text'>Concentration</span>
            <div class='progress'
              style={{width: this.state.gameState.resources.concentration + '%'}}></div>
          </div>
        </div>
        <div class='game-input'>
          <input
            ref={(el) => this.inputEl = el }
            onInput={this.inputChange.bind(this)}
            value={this.state.inputText}
            onKeyPress={this.onInputKeyPress.bind(this)}
            onKeyDown={this.onInputKeyDown.bind(this)} />
          <div className='progress'
          style={{ width: this.roundTimePercent }}></div>
        </div>
      </div>
    );
  }
}

class GameLine extends Component{
  render() {
    return (
      <span className={this.props.line.style}>
        {this.props.line.text}
      </span>
    );
  }
}
