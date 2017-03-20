import Inferno from 'inferno';
import Component from 'inferno-component';

import './css/photon-fills.css';
import './css/app.css';

class App extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
  }

  render() {
    return (
      <div class='window'>
        <header class='toolbar toolbar-header' style='-webkit-app-region: drag'>
          <h1 class='title'>Tempest Client</h1>
        </header>
        {this.props.children}
      </div>
    );
  }
}

export default App;
