import Inferno from 'inferno';
import Component from 'inferno-component';
import '../css/switch.css';

export default class Switch extends Component {
  constructor(props) {
    super(props);
    this.state = { checked: props.checked };
  }

  renderIcon() {
    if (this.state.checked) {
      return (
        <i class="fa fa-check"></i>
      );
    } else {
      return (
        <i class="fa fa-ban"></i>
      );
    }
  }

  cls() {
    if (this.state.checked) {
      return 'switch active';
    } else {
      return 'switch inactive';
    }
  }

  toggle() {
    this.setState({ checked: !this.state.checked });
    if (this.props.onChange) {
      this.props.onChange(this.state.checked);
    }
  }

  render() {
    return (
      <div className={this.cls()} onClick={this.toggle.bind(this)}>
        {this.renderIcon()} {this.props.label}
      </div>
    );
  }
}
