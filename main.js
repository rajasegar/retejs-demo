var numSocket = new Rete.Socket('Number value');
var jsonSocket = new Rete.Socket('JSON value');
const anyTypeSocket = new Rete.Socket('Any type');

jsonSocket.combineWith(anyTypeSocket);

numSocket.combineWith(anyTypeSocket);

var VueNumControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    change(e){
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value);
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
}

var VueUrlControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="text" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value);
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
}

class NumControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

class UrlControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueUrlControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
class NumComponent extends Rete.Component {

    constructor(){
        super("Number");
    }

    builder(node) {
        var out1 = new Rete.Output('num', "Number", numSocket);

        return node.addControl(new NumControl(this.editor, 'num')).addOutput(out1);
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
    }
}

class FetchComponent extends Rete.Component {

    constructor(){
        super("fetch");
    }

    builder(node) {
        var out1 = new Rete.Output('json', "JSON", jsonSocket);

        return node.addControl(new UrlControl(this.editor, 'json')).addOutput(out1);
    }

  async worker(node, inputs, outputs) {
    if(node.data.json) {
      // _.debounce(async () => {

        const response = await fetch(`https://api.github.com/users/${node.data.json}`);
        const data = await response.json();
        outputs['json'] = data;
        
      // }, 2000)
      
    } else {
      outputs['json'] = {};
    }
  }
}
class AddComponent extends Rete.Component {
    constructor(){
        super("Add");
    }

    builder(node) {
        var inp1 = new Rete.Input('num',"Number", numSocket);
        var inp2 = new Rete.Input('num2', "Number2", numSocket);
        var out = new Rete.Output('num', "Number", numSocket);

      inp1.addControl(new NumControl(this.editor, 'num'));
      inp2.addControl(new NumControl(this.editor, 'num2'));

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'preview', true))
            .addOutput(out);
    }

    worker(node, inputs, outputs) {
        var n1 = inputs['num'].length?inputs['num'][0]:node.data.num1;
        var n2 = inputs['num2'].length?inputs['num2'][0]:node.data.num2;
        var sum = n1 + n2;
        
        this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(sum);
        outputs['num'] = sum;
    }
}

class MultiplyComponent extends Rete.Component {
    constructor(){
        super("Multiply");
    }

    builder(node) {
        var inp1 = new Rete.Input('num',"Number", numSocket);
        var inp2 = new Rete.Input('num2', "Number2", numSocket);
        var out = new Rete.Output('num', "Number", numSocket);

      inp1.addControl(new NumControl(this.editor, 'num'));
      inp2.addControl(new NumControl(this.editor, 'num2'));

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'preview', true))
            .addOutput(out);
    }

    worker(node, inputs, outputs) {
        var n1 = inputs['num'].length?inputs['num'][0]:node.data.num1;
        var n2 = inputs['num2'].length?inputs['num2'][0]:node.data.num2;
        var sum = n1 * n2;
        
        this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(sum);
        outputs['num'] = sum;
    }
}

class ConsoleLogComponent extends Rete.Component {
  constructor() {
    super("console.log");
  }

  builder(node) {
    const inp1 = new Rete.Input('str', "Any", anyTypeSocket);

    return node
      .addInput(inp1);
    
  }

  worker(node, inputs, outputs) {

    const str = inputs['str'].length ? inputs['str'][0] : node.data.str;
    console.log(str);
    
  }
}

class AssocComponent extends Rete.Component {
  constructor() {
    super("assoc");
  }

  builder(node) {
    const inp1 = new Rete.Input('json', 'JSON', jsonSocket);
    const out1 = new Rete.Output('str', "Any", anyTypeSocket);

    return node
      .addControl(new UrlControl(this.editor, 'path'))
      .addInput(inp1)
      .addOutput(out1);
    
  }

  worker(node, inputs, outputs) {
    const _obj = inputs['json'][0];
    outputs['str'] = _.at(_obj, [node.data.path]);
  }
}

class JSONComponent extends Rete.Component {
  constructor() {
    super('json');
  }

  builder(node) {
    const out1 = new Rete.Output('json', 'JSON', jsonSocket);
    return node.addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs['json'] = {
      name: 'Rajasegar',
      age: 20,
      admin: false,
      address: {
        street: 'Kaveri nagar',
        state: 'TamilNadu',
        district: 'Chennai'
      }
    };
  }
}


(async () => {
    var container = document.querySelector('#rete');
  var components = [
    new NumComponent(),
    new AddComponent(),
    new MultiplyComponent(),
    new ConsoleLogComponent(),
    new FetchComponent(),
    new AssocComponent(),
    new JSONComponent()
  ];
    
    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin.default);    
    editor.use(ContextMenuPlugin.default);
    editor.use(AreaPlugin);

    var engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

  /*
    var n1 = await components[0].createNode({num: 2});
    var n2 = await components[0].createNode({num: 0});
    var add = await components[1].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];
 

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);

    editor.connect(n1.outputs.get('num'), add.inputs.get('num'));
    editor.connect(n2.outputs.get('num'), add.inputs.get('num2'));
    */


    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
        await engine.abort();
        await engine.process(editor.toJSON());
    });

    editor.view.resize();
    AreaPlugin.zoomAt(editor);
    editor.trigger('process');


})();
