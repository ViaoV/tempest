import Inferno from 'inferno';
import Component from 'inferno-component';
import { mapData } from '../services/Session';
import { session } from '../services/Session';
import _ from 'lodash';

import '../css/map.css';
import 'konva';

var Konva = window.Konva;

export default class MapView extends Component {

  constructor(props, { router }) {
    super(props);
    this.state = {};
    this.currentNode = 0;
    this.router = router;
  }

  componentDidMount() {
    mapData.lookupRoom(session.state.roomDesc).then((nodeDetails) => {
      if (nodeDetails) {
        mapData.loadMap(nodeDetails.mapName).then((data) => {
          this.data = data;
          this.currentNode = data.getNode(nodeDetails.id);
          setTimeout(this.drawMap.bind(this), 1);
        });
      }
    });
  }

  onComponentWillUnmount() {
    this.stage = null;
    this.nodeLayer = null;
    this.labelLayer = null;
    this.arcLayer = null;
  }

  drawMap() {
    console.log(this.data.maxX);
    this.stage = new Konva.Stage({
      container: 'map-container',   // Id of container <div>
      width: this.data.maxX - this.data.minX + 40,
      height: this.data.maxY - this.data.minY + 40,
    });
    this.nodeLayer = new Konva.Layer();
    this.labelLayer = new Konva.Layer();
    this.arcLayer = new Konva.Layer();
    this.data.nodes.forEach(n => this.drawNode(n));
    this.data.labels.forEach(l => this.drawLabel(l));
    this.stage.add(this.arcLayer);
    this.stage.add(this.nodeLayer);
    this.stage.add(this.labelLayer);
  }

  drawNode(node) {
    const x = parseInt(node.x) - this.data.minX + 20;
    const y = parseInt(node.y) - this.data.minY + 20;
    var circle = new Konva.Circle({
      x: x,
      y: y,
      radius: 5,
      fill: this.currentNode.id === node.id ? 'purple' : (node.color || 'white'),
      stroke: 'black',
      strokeWidth: 1,
    });
    circle.on('click', this.nodeClick.bind(this, node));

    this.nodeLayer.add(circle);
    (node.arcs || []).forEach((a) => this.drawArc(node, a));
  }

  nodeClick(node) {
    if (this.currentNode) {
      const path = this.data.movePath(this.currentNode.id, node.id);
      const first = path.shift();
      session.send(first + '\n');
      path.forEach(m => session.move(m + '\n'));
      this.router.push('/game');
    }
  }

  drawLabel(label) {
    const x = parseInt(label.x) - this.data.minX + 20 + 2;
    const y = parseInt(label.y) - this.data.minY + 20 + 2;
    this.labelLayer.add(new Konva.Text({
      x: x,
      y: y,
      text: label.text,
      fontSize: 11,
      fontFamily: 'Calibri',
      fill: 'black',
    }));
  }

  drawArc(src, arc) {
    if (!arc.destId) {
      return;
    }

    const dest = this.data.getNode(arc.destId);
    this.arcLayer.add(new Konva.Line({
      points: [
        parseInt(src.x) + 20 - this.data.minX,
        parseInt(src.y) + 20  - this.data.minY,
        parseInt(dest.x) + 20  - this.data.minX,
        parseInt(dest.y) + 20  - this.data.minY,
      ],
      stroke: '#888',
      strokeWidth: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    }));
  }

  render() {
    return (
      <div id='map-container' className='map'>
      </div>
    );
  }
}
