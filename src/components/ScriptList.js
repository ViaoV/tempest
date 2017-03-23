import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link } from 'inferno-router';
import { scriptEngine } from '../services/Session';
import { PromptModal, ConfirmModal } from './Modal';

export default class ScriptList extends Component {

  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      scripts:  [],
      showNewModal: false,
      selectedScript: undefined,
    };
  }

  componentDidMount() {
    this.loadScripts();
  }

  loadScripts() {
    scriptEngine.listScriptNames().then((s) => this.setState({ scripts: s}));
  }

  editScript() {
    if (!this.state.selectedScript) { return; }

    this.router.push('/scripts/' + this.state.selectedScript);
  }

  runScript() {
    if (!this.state.selectedScript) { return; }

    scriptEngine.loadScript(this.state.selectedScript);
    this.router.push('/game');
  }

  deleteScript() {
    if (!this.state.selectedScript) { return; }

    this.setState({
      showDeleteConfirm: true,
    });
  }

  deleteScriptConfirm() {
    this.setState({ showDeleteConfirm: false });
    scriptEngine.deleteScript(this.state.selectedScript).then(() => {
      this.loadScripts();
    });
  }

  newScript() {
    this.setState({ showNewModal: true });
  }

  selectScript(script) {
    this.setState({ selectedScript: script });
  }

  newScriptConfirm(val) {
    this.setState({ showNewModal: false });
    scriptEngine.newScript(val).then(() => {
      this.router.push('/scripts/' + val);
    });
  }

  render() {
    return (
      <div class='stack'>
        <ConfirmModal
          show={this.state.showDeleteConfirm}
          confirm={this.deleteScriptConfirm.bind(this)}
          cancel={() => this.setState({showDeleteConfirm: false})}
          title="Delete Script">
            Are you sure you want to delete the
            <strong>{this.state.selectedScript}</strong> script.
        </ConfirmModal>
        <PromptModal
          show={this.state.showNewModal}
          message='Enter a name for your script'
          confirm={this.newScriptConfirm.bind(this)}
          cancel={() => this.setState({showNewModal: false})}
          title='New Script'/>
        <div class='toolbar'>
          <div class='left'>
            <button onClick={this.newScript.bind(this)}>
              <i class='fa fa-plus'></i>
            </button>
            <button onClick={this.deleteScript.bind(this)}>
              <i class='fa fa-trash'></i>
            </button>
          </div>
          <div class='right'>
            <button onClick={this.runScript.bind(this)}><i class='fa fa-play'></i></button>
          </div>
        </div>
        <div class="scrollable">
          <table className='table-striped'>
            <tbody>
              {this.state.scripts.map(script =>
                <tr
                  className={(this.state.selectedScript == script) ? 'selected' : ''}
                  onClick={this.selectScript.bind(this, script)}
                  onDblClick={this.editScript.bind(this, script)}>
                  <td>{script}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
