import Inferno from 'inferno';
import Component from 'inferno-component';

export default class ErrorMessage extends Component {
  render() {
    if (!this.props.message) {
      return '';
    } else {
      return (
        <div class="error-message">
          {this.props.message}
        </div>
      );
    }
  }
}
