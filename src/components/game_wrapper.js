import Inferno from 'inferno';
import Component from 'inferno-component';
import { auth, session, scriptEngine } from '../services/Session';
import { Link } from 'inferno-router';
import _ from 'lodash';

import { SideMenu } from './SideMenu';

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
  }

  render() {
    return (
      <div class='window-content'>
        <div class='pane-group'>
          <SideMenu />
          <div class='pane'>{ this.props.children }</div>
        </div>
      </div>
    );
  }
}
