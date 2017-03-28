import Inferno from 'inferno';
import Component from 'inferno-component';

export default class ResourceBars extends Component {
  render() {
    return (
      <div class='status-bars'>
        <div class='bar health'>
          <span class='text'>Health</span>
          <div class='progress'
            style={{ width: this.props.health + '%' }}></div>
        </div>
        <div class='bar mana'>
          <span class='text'>Mana</span>
          <div class='progress'
            style={{ width: this.props.mana + '%' }}></div>
        </div>
        <div class='bar stamina'>
          <span class='text'>Stamina</span>
          <div class='progress'
            style={{ width: this.props.stamina + '%' }}></div>
        </div>
        <div class='bar concentration'>
          <span class='text'>Concentration</span>
          <div class='progress'
            style={{ width: this.props.concentration + '%' }}></div>
        </div>
      </div>
    );
  }
}
