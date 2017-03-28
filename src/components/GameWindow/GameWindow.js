import Inferno from 'inferno';
import Component from 'inferno-component';
import { session, scriptEngine } from '../../services/Session';
import $ from 'jquery';
import ResourceBars from './ResourceBars';
import GameInput from './GameInput';

class GameLine extends Component{
  render() {
    return (
      <span className={this.props.line.style}>
        {this.props.line.text}
      </span>
    );
  }
}

export class GameWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameLines: [],
      inputText: '',
      gameState: {
        resources: {},
      },
    };

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
  }

  componentDidUpdate() {
    this.el.scrollTop = this.el.scrollHeight;
  }

  render() {
    return (
      <div class='stack'>
        <div className='game-window scrollable'
          ref={(el) => this.el = el }>
          {this.state.gameLines.map(i =>
            <GameLine line={i}/>
          )}
        </div>
        <ResourceBars resources={this.state.gameState.resources} />
        <GameInput
          roundTimeEnd={this.state.gameState.roundTimeEnd}
          roundTimeSeconds={this.state.gameState.roundTimeSeconds}
          gameTime={this.state.gameState.time}/>
      </div>
    );
  }
}
