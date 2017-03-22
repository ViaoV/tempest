import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link } from 'inferno-router';
import { scriptEngine } from '../services/Session';
import { PromptModal, ConfirmModal } from './Modal';

import '../css/sub-toolbar.css';

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
    scriptEngine.listScriptNames().then((s) => this.setState({ scripts: s }));
  }

  editScript(script) {
    if (!this.state.selectedScript && !script) { return; }

    if (script) {
      this.router.push('/scripts/' + script);
    } else {

      this.router.push('/scripts/' + this.state.selectedScript);
    }
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
      <div style='width: 100%;height: 100%;overflow: hidden;'>
        <PromptModal
          show={this.state.showNewModal}
          message='Enter a name for your script'
          confirm={this.newScriptConfirm.bind(this)}
          title='New Script'/>
        <div class='sub-toolbar'>
          <div class='left'>
            <button onClick={this.newScript.bind(this)}>
              <i class='fa fa-plus'></i> New
            </button>
            <button onClick={this.editScript.bind(this)}>
              <i class='fa fa-edit'></i> edit
            </button>
            <button onClick={this.deleteScript.bind(this)}>
              <i class='fa fa-trash'></i> delete
            </button>
          </div>
          <div class='right'>
            <button onClick={this.runScript.bind(this)}><i class='fa fa-play'></i> Run</button>
          </div>
        </div>
        <div class='sub-toolbar-content'>
        <table className='table-striped'>
          <tbody>
            {this.state.scripts.map(script =>
              <tr
                className={(this.state.selectedScript == script) ? 'selected' : ''}
                onClick={() => this.setState({ selectedScript: script })}
                onDblClick={this.editScript.bind(this, script)}>
                <td>{script}</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <ConfirmModal
          show={this.state.showDeleteConfirm}
          confirm={this.deleteScriptConfirm.bind(this)}
          title="Delete Script">
            Are you sure you want to delete the
            <strong>{this.state.selectedScript}</strong> script.
        </ConfirmModal>
      </div>
    );
  }
}
