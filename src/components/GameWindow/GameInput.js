import Inferno from 'inferno';
import Component from 'inferno-component';

import { session, scriptEngine } from '../../services/Session';

export default class ResourceBars extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
    };
    this.inputHistory = [];
    this.inputHistoryIndex = -1;
  }

  componentDidMount() {
    this.inputEl.focus();
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
    if (e.keyCode === 27) {
      e.preventDefault();
      console.log('clearing pending commands');
      session.clearPendingActions();
      console.log('sendQueue ', session.sendBuffer.length);
    }

    if (e.keyCode === 38) {
      e.preventDefault();
      if (this.inputHistoryIndex  < this.inputHistory.length - 1) {
        this.inputHistoryIndex = this.inputHistoryIndex + 1;
        if (this.inputHistoryIndex == -1) {
          this.setState({ inputText: '' });
        } else {
          this.setState({ inputText: this.inputHistory[this.inputHistoryIndex] });
        }
      }
    }

    if (e.keyCode === 40) {
      e.preventDefault();
      if (this.inputHistoryIndex > -1) {
        this.inputHistoryIndex = this.inputHistoryIndex - 1;
        this.setState({ inputText: this.inputHistory[this.inputHistoryIndex] });
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
        this.inputHistory.unshift(msg);
        session.sendNow(msg + '\n');
      }

      this.setState({ inputText: '' });
    }
  }

  inputChange(e) {
    this.setState({ inputText: e.target.value });
  }

  get roundTimePercent() {
    var rt = this.props.roundTimeEnd - this.props.time;
    if (rt <= 0) {
      return 0;
    }

    return Math.floor(rt / this.props.roundTimeSeconds * 100) + '%';
  }

  render() {
    return (
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
    );
  }
}
