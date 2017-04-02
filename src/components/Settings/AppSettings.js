import Inferno from 'inferno';
import Component from 'inferno-component';
import Switch from '../switch';
import  _ from 'lodash';

import { settings } from '../../services/Session';

export class AppSettings extends Component {
  constructor(props) {
    super(props);
    this.state = settings.getAll();
  }

  toggleSetting() {
    settings.setAll(this.state);
  }

  handleSwitchClick(prop, v) {
    const currentState = this.state;
    _.set(currentState, prop, v);
    settings.set(prop, v);
    this.setState(currentState);
  }

  renderSwitch(title, prop) {
    return (
      <Switch label={title}
      checked={_.get(this.state, prop)}
      onChange={this.handleSwitchClick.bind(this, prop)}/>
    );
  }

  render() {
    return (
      <div class="stack">
        <div class="settings scrollable">
          <h2>Commands</h2>
          <div class="blocks">
            <div class="section">
              <p>Automatically delay commands during roundtimes</p>
              {this.renderSwitch('Roundtime Delay', 'game.roundTimeDelay')}
            </div>
            <div class="section">
              <p>Automatically requeue commands that were rejected during
              roundtimes, or because of typeahead limits</p>
              {this.renderSwitch('Roundtime Requeue', 'game.commandRequeue')}
            </div>
            <div class="section">
              <p>When sending a command to the server also print this to the
              game window.</p>
              {this.renderSwitch('Echo Commands', 'game.localEcho')}
            </div>
          </div>
          <h2>Game Components</h2>
          <div class="blocks">
            <div class="section">
              <p>Show and track resource indicators for mana, vitality,
              concentration, stamina, and spirit </p>
              {this.renderSwitch('Resource Bars', 'game.resourceBars')}
            </div>
            <div class="section">
              <p>Show status indicator icons on the game window for hidden,
              bleeding, etc.</p>
              {this.renderSwitch('Status Indicators', 'game.statusIndicators')}
            </div>
          </div>
          <h2>Notifiations</h2>
          <div class="blocks">
            <div class="section">
              <p>Allow scripts to send desktop notifications.</p>
              {this.renderSwitch('Script Notifications', 'notifications.scripts')}
            </div>
            <div class="section">
              <p>Send desktop notifications when someone whipsers to you and the
              game window is not focused.</p>
              {this.renderSwitch('Whisper Notifications', 'notifications.whisper')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
