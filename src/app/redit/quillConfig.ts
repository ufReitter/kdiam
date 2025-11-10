import Quill from 'quill';

var cssId = 'snowCss'; // you could encode the css path itself to generate id..
if (!document.getElementById(cssId)) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.id = cssId;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'assets/quill/quill.snow.css';
  link.media = 'all';
  head.appendChild(link);
}

var Block = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/block/embed');
const Embed = Quill.import('blots/embed');
const Inline = Quill.import('blots/inline');
const Link = Quill.import('formats/link');

var TextBlock = Quill.import('blots/text');

const Parchment = Quill.import('parchment');
let CustomClass = new Parchment.Attributor.Class('kompendia', 'kd', {
  scope: Parchment.Scope.INLINE,
});
CustomClass.whitelist = ['reference', 'variable', 'nbsp'];

const IdAttribute = new Parchment.Attributor.Attribute('id', 'id', {
  scope: Parchment.Scope.INLINE,
});
const NameAttribute = new Parchment.Attributor.Attribute('name', 'name', {
  scope: Parchment.Scope.INLINE,
});
class LinkStuff extends Link {
  static create(value) {
    if (typeof value === 'string') {
      value = { href: value };
    }
    if (value.onclick?.includes('component.navigate')) {
      value.href = value.onclick
        .replace("window.fncIdentifierCompRef.component.navigate('", '')
        .replace("')", '');
    }

    if (value.href?.includes('http') || value.href?.includes('mailto:')) {
      value.onclick =
        "window.fncIdentifierCompRef.component.open('" + value.href + "')";
    } else {
      value.onclick =
        "window.fncIdentifierCompRef.component.navigate('" + value.href + "')";
    }

    let node = super.create(value);

    node.setAttribute('href', value.href);

    if (value.onclick) {
      node.setAttribute('onClick', value.onclick);
    }
    if (value.target != null) {
      node.setAttribute('target', value.target);
    } else {
      node.setAttribute('target', '_blank');
    }

    if (value.onclick && !value.href?.includes('http')) {
      node.removeAttribute('href');
    }

    return node;
  }
  static formats(domNode) {
    let href = domNode.getAttribute('href');
    let onclick = domNode.getAttribute('onClick');
    const target = domNode.getAttribute('target');

    if (onclick) {
      href = onclick
        .replace("window.fncIdentifierCompRef.component.navigate('", '')
        .replace("')", '');
      href = href
        .replace("window.fncIdentifierCompRef.component.open('", '')
        .replace("')", '');
      onclick = '';
      return href;
    }

    return { href, onclick, target };
  }
}

class XVideoBlot extends Inline {}
XVideoBlot.blotName = 'nb';
XVideoBlot.tagName = 'nb';

Quill.register(XVideoBlot);

// Inline.order = [
//   'cursor',
//   'inline',
//   'code',
//   'underline',
//   'strike',
//   'italic',
//   'bold',
//   'script',
//   'link',
//   'nbsp',
// ];

let xxx =
  '<nb>b</nb><span class="kd-variable">s<sub>0</sub></span> = 0,7…1,5<nb>e</nb>';

class QuillNbsp extends Inline {
  static create(value) {
    let node = super.create();

    // const node = document.createElement('nbsp');
    const child1 = document.createElement('span');
    const child2 = document.createElement('span');
    const child3 = document.createElement('span');
    child1.innerHTML = '<span>aaa</span>';
    child2.innerHTML = '<span>bbb</span>';
    child3.innerHTML = '<span class="kd-variable">s<sub>0</sub></span>';
    // let content = document.createElement('nbsp');
    // node.innerHTML =
    //   '<span class="kd-variable">s<sub>0</sub></span><span> = 0,7…1,5</span>';
    // node.setAttribute('name', 'nbsp');
    node.appendChild(child1);
    node.appendChild(child2);
    node.appendChild(child3);
    return node;
  }
}

QuillNbsp.blotName = 'nbsp';
// QuillNbsp.className = 'kd-nbsp';
QuillNbsp.tagName = 'nbsp';
QuillNbsp.allowedChildren = [TextBlock, Block, Inline, BlockEmbed];

class RefLink extends Inline {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('name', value.name);
    node.innerHTML = value.text;
    return node;
  }
}

RefLink.blotName = 'ref-link';
RefLink.className = 'kd-reference';
RefLink.tagName = 'span';

Quill.register(CustomClass, true);
Quill.register(IdAttribute, true);
Quill.register(NameAttribute, true);

class QuillLines extends Block {}
QuillLines.blotName = 'kd-lines';
QuillLines.className = 'kd-lines';
QuillLines.tagName = 'div';

class QuillCaptionA extends Block {}
QuillCaptionA.blotName = 'kd-caption-a';
QuillCaptionA.className = 'kd-caption-a';
QuillCaptionA.tagName = 'div';

class QuillCaptionB extends Block {}
QuillCaptionB.blotName = 'kd-caption-b';
QuillCaptionB.className = 'kd-caption-b';
QuillCaptionB.tagName = 'div';

Quill.register(
  {
    'formats/nbsp': QuillNbsp,
  },
  true,
);
Quill.register(
  {
    'formats/ref-link': RefLink,
  },
  true,
);
Quill.register(
  {
    'formats/link-stuff': LinkStuff,
  },
  true,
);

// Quill.register(QuillNbsp);
Quill.register(QuillLines);
Quill.register(QuillCaptionA);
Quill.register(QuillCaptionB);
