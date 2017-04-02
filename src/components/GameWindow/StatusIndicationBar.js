import Inferno from 'inferno';
import Component from 'inferno-component';

class StatusLabel extends Component {
  render() {
    var cls = 'status-item' + ' ' + this.props.style;
    if (this.props.active) {
      cls += ' active';
    }

    return (
      <div className={cls}>{this.props.text}</div>
    );
  }
}

export default class StatusIndicationBar extends Component {
  render() {
    return (
      <div class='status-indicators'>
        <StatusLabel active={this.props.indicators.standing} text="STAND"/>
        <StatusLabel active={this.props.indicators.sitting} text="SIT"/>
        <StatusLabel active={this.props.indicators.kneeling} text="KNEEL"/>
        <StatusLabel active={this.props.indicators.prone} text="PRONE"/>
        <StatusLabel active={this.props.indicators.joined} text="GROUP"/>
        <StatusLabel active={this.props.indicators.hidden} text="HIDE"/>
        <StatusLabel active={this.props.indicators.invisible} text="INVIS"/>
        <StatusLabel active={this.props.indicators.bleeding} style="danger" text="BLEED"/>
        <StatusLabel active={this.props.indicators.poison} style="warn" text="POISON"/>
        <StatusLabel active={this.props.indicators.stunned} style="warn" text="STUN"/>
        <StatusLabel active={this.props.indicators.webbed} style="warn" text="WEB"/>
        <StatusLabel active={this.props.indicators.dead} style="danger" text="DEAD"/>
      </div>
    );
  }
}
