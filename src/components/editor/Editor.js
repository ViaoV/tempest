import Inferno from 'inferno';
import Component from 'inferno-component';
import ace from 'brace';
import 'brace/mode/coffee';
import 'brace/theme/monokai';
import { scriptEngine } from '../../services/Session';
import { PromptModal } from '../Modal';

import '../../css/sub-toolbar.css';

export default class ScriptEditor extends Component {
  constructor(props, { router }) {
    super(props);
    this.router = router;
    this.state = {
      scriptName: this.props.params.script,
    };
  }

  componentDidMount() {
    this.editor = ace.edit('script-editor');
    this.editor.getSession().setMode('ace/mode/coffee');
    this.editor.setTheme('ace/theme/monokai');
    scriptEngine.readScript(this.state.scriptName).then((script) => {
      this.editor.setValue(script, -1);
    });
  }

  close() {
    this.router.push('/scripts');
  }

  save() {
    const script = this.state.scriptName;
    scriptEngine.saveScript(script, this.editor.getValue()).then(() => {
      this.router.push('/scripts');
    });
  }

  showRename() {
    this.setState({ showRenameModal: true });
  }

  doRename(val) {
    scriptEngine.renameScript(this.state.scriptName, val).then(() => {
      this.setState({ scriptName: val, showRenameModal: false });
    });
  }

  render() {
    return (
      <div class='stack vertical'>
        <PromptModal
          show={this.state.showRenameModal}
          message='Enter a new name for the script'
          value={this.state.scriptName}
          confirm={this.doRename.bind(this)}
          title='Rename Script'/>
        <div class='toolbar'>
          <div class='left'>
            <button onClick={this.showRename.bind(this)}>{this.state.scriptName}</button>
          </div>
          <div class='right'>
            <button onClick={this.close.bind(this)}><i class='fa fa-times'></i></button>
            <button onClick={this.save.bind(this)}><i class='fa fa-save'></i></button>
          </div>
        </div>
        <div id='script-editor' style="width: 100%; height: 100%;">
        </div>
      </div>
    );
  }
}
