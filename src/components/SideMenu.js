import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link } from 'inferno-router';
import { scriptEngine } from '../services/Session';

export class SideMenu extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      activeScripts: [],
    };
  }

  activeClass(route) {
    var active = (this.router.location.pathname.indexOf(route) > -1);
    return (active) ? 'nav-group-item active' : 'nav-group-item';
  }

  componentDidMount() {
    scriptEngine.on('script.loaded', () => {
      this.setState({ activeScripts: scriptEngine.scripts.map(i => i.name) });
    });
    scriptEngine.on('script.unloaded', () => {
      this.setState({ activeScripts: scriptEngine.scripts.map(i => i.name) });
    });
  }

  render() {
    return (
      <div class='sidebar'>
        <div class='stack'>
          <div class="nav">
            <nav class='nav-group'>
              <Link to='/game' className={this.activeClass.bind(this)('/game')}>
                <i class='fa fa-terminal'></i>
                Game
              </Link>
            </nav>
            <nav class='nav-group'>
              <div class='nav-group-title'>Tools</div>
              <Link to='/scripts' className={this.activeClass.bind(this)('/scripts')}>
                <i class='fa fa-code'></i>
                Scripts
              </Link>
              <Link to='/map' className={this.activeClass.bind(this)('/map')}>
                <i class='fa fa-map-o'></i>
                Map
              </Link>
            </nav>
            <nav class='nav-group'>
              <div className='nav-group-title'>Active Scripts</div>
              {this.state.activeScripts.map(i=>
                <a onClick={() => scriptEngine.unloadScript(i)} className='nav-group-item'>
                  <i class='fa fa-circle'></i> {i}
                </a>
              )}
            </nav>
          </div>
          <div class="bottom-bar">
            <nav class='nav-group'>
              <Link to='/settings' className={this.activeClass.bind(this)('/settings')}>
                <i class='fa fa-cog'></i>
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}
