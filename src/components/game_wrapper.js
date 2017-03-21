import Inferno from 'inferno';
import Component from 'inferno-component';
import { auth, session, scriptEngine } from '../services/Session';
import { Link } from 'inferno-router';
import _ from 'lodash';

import '../css/status-bar.css';
import '../css/photon-fills.css';
import '../css/app.css';

export default class GameWrapper extends Component {
  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      indicators: {},
      activeScripts: [],
      showSideMenu: true,
    };
    session.on('state', (state) => {
      this.setState(state);
    });

    scriptEngine.on('script.loaded', () => {
      this.setState({ activeScripts: scriptEngine.scripts.map(i => i.name) });
    });
    scriptEngine.on('script.unloaded', () => {
      this.setState({ activeScripts: scriptEngine.scripts.map(i => i.name) });
    });
  }

  activeClass(route) {
    var active = (this.router.location.pathname.indexOf(route) > -1);
    return (active) ? 'nav-group-item active' : 'nav-group-item';
  }

  render() {
    return (
      <div class='window-content'>
        <div class='pane-group'>
          {this.renderSidebar()}
          <div class='pane'>{ this.props.children }</div>
        </div>
      </div>
    );
  }

  renderStatusBar() {
    return (
      <footer class='toolbar toolbar-footer'>
      <div class='toolbar-actions'>
      <StatusBarLabelItem label='L' value={this.state.left} />
      <StatusBarLabelItem label='R' value={this.state.right} />
      <StatusBarLabelItem label='SP' value={this.state.spell} />
      <div className='status-seperator-item'></div>
      <StatusBarTextItem active={this.state.indicators.grouped}>
      <i className='fa fa-fw fa-users'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.hidden}>
      <i className='fa fa-fw fa-user-secret'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.invisible}>
      <i className='fa fa-fw fa-eye-slash'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.bleeding}>
      <i className='fa fa-fw fa-heart'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.stunned}>
      <i className='fa fa-fw fa-star'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.webbed}>
      <i className='fa fa-fw fa-bolt'></i>
      </StatusBarTextItem>
      <StatusBarTextItem active={this.state.indicators.dead}>
      <i className='fa fa-fw fa-times'></i>
      </StatusBarTextItem>
      <div className='status-seperator-item'></div>
      <StatusBarProgress value='40' cls='blue'/>
      <StatusBarProgress value='80' cls='red'/>
      <StatusBarProgress value='20' cls='yellow'/>
      </div>
      </footer>
    );
  }

  renderSidebar() {
    if (!this.state.showSideMenu) {
      return '';
    } else {
      return (
        <div class='pane-sm sidebar'>
          <nav class='nav-group'>
            <Link to='/game' className={this.activeClass.bind(this)('/game')}>
              <i class='fa fa-terminal'></i>
              Game
            </Link>
          </nav>
          <nav class='nav-group'>
            <h5 class='nav-group-title'>Tools</h5>
            <Link to='/scripts' className={this.activeClass.bind(this)('/scripts')}>
              <i class='fa fa-code'></i>
              Scripts
            </Link>
            <Link to='/map' className={this.activeClass.bind(this)('/map')}>
            <span class='icon icon-map'></span>
              Map
            </Link>
          </nav>
          <nav class='nav-group'>
            <h5 className='nav-group-title'>Active Scripts</h5>
            {this.state.activeScripts.map(i=>
              <a onClick={() => scriptEngine.unloadScript(i)} className='nav-group-item'>
                <i class='fa fa-circle'></i> {i}
              </a>
            )}
          </nav>
          <nav class='nav-group'>
            <h5 class='nav-group-title'>Configuration</h5>
          </nav>
        </div>
      );
    }
  }
}

class StatusBarTextItem extends Component {
  render() {
    var cls = 'btn status-item';
    if (this.props.active) {
      cls += ' active';
    }

    return (
      <div className={cls}>{this.props.children}</div>
    );
  }
}

class StatusBarLabelItem extends Component {
  render() {
    return (
      <div className='btn btn-default status-label-item'>
        <span class='label'>{this.props.label}</span>
        {this.props.value}
      </div>
    );
  }
}

class StatusBarProgress extends Component {
  render() {
    var cls = 'inner-bar ' + this.props.cls;
    return (
      <div className='status-progress'>
        <div className={cls} style={{ width: this.props.value + '%' }}></div>
      </div>
    );
  }
}
