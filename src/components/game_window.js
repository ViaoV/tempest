import Inferno from 'inferno';
import Component from 'inferno-component';
import '../css/game-window.css';
import { session } from '../services/Session';
import $ from 'jquery';

export default class GameWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameLines: [],
      inputText: '',
      gameState: {},
    };
    session.on('message', (e, data) => {
      if (e.stream === 'game') {
        var buf = this.state.gameLines.slice();
        buf.push({ details: e, text: data });
        this.setState({
          gameLines: buf.slice(Math.max(buf.length - 100, 0)),
        });
      }
    });
    session.debugLoad();
  }

  componentDidUpdate() {
    // $(this.el).animate({ scrollTop: this.el.scrollHeight }, 300);
    this.el.scrollTop = this.el.scrollHeight;
  }

  onKeyPress(e) {
    if (e.keyCode === 13) {
      session.send(this.state.inputText + '\n');
      this.setState({ inputText: '' });
    }
  }

  inputChange(e) {
    this.setState({ inputText: e.target.value });
  }

  render() {
    return (
      <div class='game-window' ref={(el) => this.el = el }>
        {this.state.gameLines.map(i =>
          <GameLine line={i}/>
        )}
        <input class='game-input'
          onInput={this.inputChange.bind(this)}
          value={this.state.inputText}
          onKeyPress={this.onKeyPress.bind(this)}/>
      </div>
    );
  }
}

class GameLine extends Component{
  render() {
    return (
      <span className={this.props.line.details.style}>
        {this.props.line.text}
      </span>
    );
  }
}
