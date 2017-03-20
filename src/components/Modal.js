import Inferno from 'inferno';
import Component from 'inferno-component';

import '../css/modal.css';


export class PromptModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      value: props.value,
    }
  }

  getClass() {
    if (this.props.show) {
      return 'window modal prompt show';
    }
    return 'window modal prompt';
  }

  close() {
    this.props.show = false;
    this.setState({show: false});
    if (this.props.cancel) {
      this.props.cancel()
    }
  }

  confirm() {
    this.props.show = false;
    this.setState({show: false});
    if (this.props.confirm) {
      this.props.confirm(this.state.value);
    }
  }

  valueChange(e) {
    this.setState({value: e.target.value});
  }

  render() {
    return (
    <div className={this.getClass()}>
      <div class='toolbar toolbar-header'>
        <h1 class='title'>{this.props.title}</h1>
      </div>
      <div class='modal-content'>
        <div class='message'>{this.props.message}</div>
        <input type='text' value={this.state.value} onInput={this.valueChange.bind(this)}/>
      </div>
      <footer class='toolbar toolbar-footer'>
      <div class='toolbar-actions'>
        <button class='btn btn-default' onClick={this.close.bind(this)}>
          Cancel
        </button>

        <button class='btn btn-primary pull-right' onClick={this.confirm.bind(this)}>
          Save
        </button>
      </div>
      </footer>
    </div>
  )
  }
}
