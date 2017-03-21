import Inferno from 'inferno';
import Component from 'inferno-component';

import '../css/modal.css';
import '../css/modal-effect.css';

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
    this.closable = true;
  }

  componentWillReceiveProps(props) {
    this.setState({ show: props.show });
  }

  hide() {
    this.props.show = false;
    this.setState({ show: false });
  }

  backdropClick() {
    console.log('backdrop click');
    if (this.props.closable || this.closable) {
      this.hide();
    }
  }

  renderModal(contents) {
    const cls = (this.state.show) ? 'modal show' : 'modal';
    const bdCls = (this.state.show) ? 'modal-backdrop show' : 'modal-backdrop';
    return (
      <div>
        <div className={bdCls} onClick={this.backdropClick.bind(this)}>
        </div>
        <div className={cls}>
          <div class='modal-title'>{this.props.title}</div>
          {contents}
        </div>
      </div>
    );
  }
}

export class PromptModal extends Modal {

  constructor(props) {
    super(props);
    this.state.value = this.props.value;
  }

  confirm() {
    this.props.show = false;
    this.setState({ show: false });
    if (this.props.confirm) {
      this.props.confirm(this.state.value);
    }
  }

  valueChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    return this.renderModal(
      <div className="modal-content">
        <p>{this.props.message}</p>
        <input type='text' value={this.state.value} onInput={this.valueChange.bind(this)}/>
        <div class='modal-buttons'>
          <button onClick={this.confirm.bind(this)}
            class='pull-left btn btn-primary btn-large'>Rename</button>
          <button onClick={this.hide.bind(this)}
            class='pull-right btn btn-large'>Nevermind</button>
        </div>
      </div>
    );
  }
}

export class ConfirmModal extends Modal {

  confirm() {
    this.setState({ show: false }, () => {
      if (this.props.confirm) {
        this.props.confirm();
      }
    });
  }

  render() {
    return this.renderModal(
      <div className="modal-content">
        <p>{this.props.children}</p>
        <div class='modal-buttons'>
          <button onClick={this.confirm.bind(this)}
            class='pull-left btn btn-negative btn-large'>Do It</button>
          <button onClick={this.hide.bind(this)}
            class='pull-right btn btn-large'>Nevermind</button>
        </div>
      </div>
    );
  }
}

export class WaitModal extends Modal {

  constructor(props) {
    super(props);
    this.closable = false;
  }

  render() {
    return this.renderModal(
      <div className="modal-content">
        <p>{this.props.children}</p>
      </div>
    );
  }
}

export class MessageModal extends Modal {
  render() {
    return this.renderModal(
      <div className="modal-content">
        <p>{this.props.children}</p>
        <div class='modal-buttons'>
          <button onClick={this.hide.bind(this)}
            class='pull-right btn btn-large'>Close</button>
        </div>
      </div>
    );
  }
}
