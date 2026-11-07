import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CJ6VHgF7.js";import{n as r,t as i}from"./icon-8FdibYhk.js";import{n as a}from"./navItem-6b8YIPQN.js";function o(e){return(0,u.jsx)(`div`,{className:`empty-guide__figures`,children:e.figures.map(e=>`stack`in e?(0,u.jsx)(s,{entry:e},c(e)):(0,u.jsx)(l,{figure:e},e.src))})}function s(e){let{stack:t,share:n=1}=e.entry;return(0,u.jsx)(`div`,{className:`empty-guide__stack`,style:{flexGrow:n},children:t.map(e=>(0,u.jsx)(l,{figure:e},e.src))})}function c(e){return e.stack.map(e=>e.src).join(` `)}function l(e){let{src:t,alt:n,share:r=1,onSelect:i,title:a}=e.figure,o=(0,u.jsx)(`img`,{src:t,alt:n,draggable:!1});return i?(0,u.jsx)(`button`,{type:`button`,className:`empty-guide__figure`,style:{flexGrow:r},title:a,onClick:i,children:o}):(0,u.jsx)(`figure`,{className:`empty-guide__figure`,style:{flexGrow:r},children:o})}var u;function d(){return(d=e((()=>{u=n(),o.__docgenInfo={description:`The faint pictures of a guide, side by side in the room left.
@param props - The figures.
@param props.figures - The pictures, some of them stacked.
@returns The row.`,methods:[],displayName:`GuideFigures`,props:{figures:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`union`,raw:`EmptyGuideFigure | EmptyGuideFigureStack`,elements:[{name:`EmptyGuideFigure`},{name:`EmptyGuideFigureStack`}]}],raw:`ReadonlyArray<EmptyGuideFigure | EmptyGuideFigureStack>`},description:``}}}})))()}function f(e,t,n){return t<=0||n<=0?0:Math.floor(e/n)%t}function p(e,t){let[n,r]=(0,m.useState)(()=>f(Date.now(),e,t));return(0,m.useEffect)(()=>{if(e<2||t<=0)return;let n=setInterval(()=>{r(e=>e+1)},t);return()=>{clearInterval(n)}},[e,t]),e>0?n%e:0}var m;function h(){return(h=e((()=>{m=t()})))()}function g(e){let{actions:t=[],help:n,links:r,linksTitle:i,hints:a=[],hintInterval:s=C,figures:c=[],figuresTitle:l}=e;return(0,S.jsxs)(`div`,{className:`empty-guide no-print`,"data-testid":`empty-guide`,children:[n?(0,S.jsx)(`div`,{className:`empty-guide__help`,children:n}):null,r&&r.length>0?(0,S.jsx)(y,{links:r,title:i}):null,t.length>0||l?(0,S.jsx)(v,{actions:t,figuresTitle:l}):null,(0,S.jsx)(o,{figures:c}),a.length>0?(0,S.jsx)(x,{hints:a,interval:s}):null]})}function _(e){return(0,S.jsxs)(`section`,{className:`empty-guide__section`,children:[(0,S.jsx)(`h2`,{className:`empty-guide__title`,children:e.title}),e.children]})}function v(e){let{actions:t,figuresTitle:n}=e;return(0,S.jsxs)(`div`,{className:`empty-guide__start`,children:[t.map(e=>(0,S.jsxs)(`button`,{type:`button`,className:`empty-guide__action`,onClick:e.onSelect,children:[e.icon?(0,S.jsx)(i,{icon:e.icon,size:18}):null,e.label]},e.label)),n?(0,S.jsx)(`p`,{className:`empty-guide__figures-title`,children:n}):null]})}function y(e){return(0,S.jsxs)(`nav`,{className:`empty-guide__links`,"aria-label":e.title,children:[e.title?(0,S.jsx)(`span`,{className:`empty-guide__title`,children:e.title}):null,e.links.map(e=>(0,S.jsx)(`a`,{href:e.href,onClick:t=>{b(t,e)},children:e.label},e.href))]})}function b(e,t){!t.onSelect||a(e)||(e.preventDefault(),t.onSelect())}function x(e){let{hints:t,interval:n}=e,r=p(t.length,n);return(0,S.jsxs)(`p`,{className:`empty-guide__hint`,"data-testid":`empty-guide-hint`,children:[(0,S.jsx)(i,{icon:`lightbulb`,size:14}),(0,S.jsx)(`span`,{children:t[r]},r)]})}var S,C;function w(){return(w=e((()=>{r(),d(),h(),S=n(),C=9e3,g.__docgenInfo={description:`What a tool shows while it holds nothing: the space that is empty anyway says
how to start. It comes in grey over the tool, lets the pointer through to it
everywhere but on a button, a link or a figure that can be clicked, and the
site stops rendering it at the first stroke.

Fill the absolute box of the tool's view with it: the parent is positioned.
@param props - See {@link EmptyGuideProps}.
@returns The guide.`,methods:[],displayName:`EmptyGuide`,props:{actions:{required:!1,tsType:{name:`unknown`},description:`The ways to start, as big buttons on the line over the figures, the first
in the site's colour. Faint figures alone read as content already on the
page, so a guide showing any says here how to leave them behind.
@default undefined — no button`},help:{required:!1,tsType:{name:`ReactNode`},description:`What is true on every visit: how to start, the keys. Sections drawn by
\`<EmptyGuideSection>\`, side by side as far as the width allows.
@default undefined — no help`},links:{required:!1,tsType:{name:`unknown`},description:`The ways to learn more, a line under the help.
@default undefined — no line`},linksTitle:{required:!1,tsType:{name:`string`},description:`What the line of links is headed.
@default undefined — no heading`},hints:{required:!1,tsType:{name:`unknown`},description:`What changes: one sentence on show at a time, the next one after
\`hintInterval\`, and another one first on the next visit.
@default undefined — no hint`},hintInterval:{required:!1,tsType:{name:`number`},description:`How long a hint stays, in milliseconds.
@default 9000`},figures:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`union`,raw:`EmptyGuideFigure | EmptyGuideFigureStack`,elements:[{name:`EmptyGuideFigure`},{name:`EmptyGuideFigureStack`}]}],raw:`ReadonlyArray<EmptyGuideFigure | EmptyGuideFigureStack>`},description:`Pictures of what the tool can make, faint, side by side in the room left,
some of them stacked.
@default undefined — no picture`},figuresTitle:{required:!1,tsType:{name:`string`},description:`What a click on a figure does, on the line over them, after the buttons.
@default undefined — nothing said`}}},_.__docgenInfo={description:`One section of a guide's help.
@param props - Its title, and what it says.
@param props.title - What it is about.
@param props.children - What it says.
@returns The section.`,methods:[],displayName:`EmptyGuideSection`,props:{title:{required:!0,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``}}}})))()}function T(e){return(0,D.jsx)(`dl`,{className:`shortcut-list`,children:e.rows.map(e=>(0,D.jsxs)(`div`,{className:`shortcut-list__row`,children:[(0,D.jsx)(`dt`,{children:(0,D.jsx)(E,{keys:e.keys})}),(0,D.jsx)(`dd`,{children:e.label})]},e.keys.join(` `)))})}function E(e){return(0,D.jsx)(`span`,{className:`shortcut-keys`,children:e.keys.map(e=>(0,D.jsx)(`kbd`,{children:e},e))})}var D;function O(){return(O=e((()=>{D=n(),T.__docgenInfo={description:`Keys and what they do, one line each, the caps in a column of their own so
the eye runs down them.
@param props - The lines.
@param props.rows - The keys and what they do.
@returns The list.`,methods:[],displayName:`ShortcutList`,props:{rows:{required:!0,tsType:{name:`unknown`},description:``}}},E.__docgenInfo={description:`Keys drawn as caps, in the grey of a guide.
@param props - The keys.
@param props.keys - The keys.
@returns The caps.`,methods:[],displayName:`ShortcutKeys`,props:{keys:{required:!0,tsType:{name:`unknown`},description:``}}}})))()}var k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{w(),O(),k=n(),A={position:`relative`,height:420,border:`1px solid var(--border)`,background:`var(--surface)`},j=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2226%22%20r%3D%2212%22%20fill%3D%22%232f8fd6%22%2F%3E%3Crect%20x%3D%2217%22%20y%3D%222%22%20width%3D%226%22%20height%3D%2214%22%20fill%3D%22%232f8fd6%22%2F%3E%3C%2Fsvg%3E`,M={title:`Guide/EmptyGuide`,component:g,decorators:[e=>(0,k.jsx)(`div`,{style:A,children:(0,k.jsx)(e,{})})],parameters:{docs:{description:{component:`What a tool shows while it holds nothing: help that stays, a hint that changes, and faint pictures of what the tool can make. The pointer goes through it, and the site stops rendering it at the first stroke.`}}}},N={args:{actions:[{label:`Start drawing`,icon:`draw`,onSelect:()=>void 0}],figuresTitle:`or click a figure to copy it to your page`,help:(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(_,{title:`Draw`,children:(0,k.jsx)(T,{rows:[{keys:[`Click`],label:`Draw a bond`},{keys:[`Drag`],label:`Aim it`}]})}),(0,k.jsx)(_,{title:`Point at an atom and press`,children:(0,k.jsx)(T,{rows:[{keys:[`c`,`n`,`o`],label:`Set the element`},{keys:[`+`,`-`],label:`Change the charge`}]})})]}),linksTitle:`Learn`,links:[{label:`From a blank page to a figure`,href:`#talk`}],hints:[`Paste a SMILES to add it to the drawing.`,`Drop a molfile on the page to open it.`],hintInterval:3e3,figures:[{src:j,alt:`A flask`,share:2},{src:`${j}#clicked`,alt:`Another flask`,title:`Copy it to the page`,onSelect:()=>void 0}]}},P={args:{figures:[{src:j,alt:`A flask`,share:2},{stack:[{src:`${j}#top`,alt:`A flask above`},{src:`${j}#bottom`,alt:`A flask below`}]}]}},F={args:{help:(0,k.jsx)(_,{title:`Start`,children:`Type a formula, and its isotopic distribution appears here.`})}},I={args:{hints:[`Type a formula such as C6H12O6 to see its isotopic distribution.`]}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    actions: [{
      label: 'Start drawing',
      icon: 'draw',
      onSelect: () => undefined
    }],
    figuresTitle: 'or click a figure to copy it to your page',
    help: <>
        <EmptyGuideSection title="Draw">
          <ShortcutList rows={[{
          keys: ['Click'],
          label: 'Draw a bond'
        }, {
          keys: ['Drag'],
          label: 'Aim it'
        }]} />
        </EmptyGuideSection>
        <EmptyGuideSection title="Point at an atom and press">
          <ShortcutList rows={[{
          keys: ['c', 'n', 'o'],
          label: 'Set the element'
        }, {
          keys: ['+', '-'],
          label: 'Change the charge'
        }]} />
        </EmptyGuideSection>
      </>,
    linksTitle: 'Learn',
    links: [{
      label: 'From a blank page to a figure',
      href: '#talk'
    }],
    hints: ['Paste a SMILES to add it to the drawing.', 'Drop a molfile on the page to open it.'],
    hintInterval: 3000,
    figures: [{
      src: FLASK,
      alt: 'A flask',
      share: 2
    }, {
      src: \`\${FLASK}#clicked\`,
      alt: 'Another flask',
      title: 'Copy it to the page',
      onSelect: () => undefined
    }]
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    figures: [{
      src: FLASK,
      alt: 'A flask',
      share: 2
    }, {
      stack: [{
        src: \`\${FLASK}#top\`,
        alt: 'A flask above'
      }, {
        src: \`\${FLASK}#bottom\`,
        alt: 'A flask below'
      }]
    }]
  }
}`,...P.parameters?.docs?.source},description:{story:`Figures stacked in one place of the row, beside one that takes the height.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    help: <EmptyGuideSection title="Start">
        Type a formula, and its isotopic distribution appears here.
      </EmptyGuideSection>
  }
}`,...F.parameters?.docs?.source},description:{story:`Help alone: a tool with nothing to show off and nothing that changes.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    hints: ['Type a formula such as C6H12O6 to see its isotopic distribution.']
  }
}`,...I.parameters?.docs?.source},description:{story:`A hint alone, at the bottom of the empty space.`,...I.parameters?.docs?.description}}},L=[`Default`,`StackedFigures`,`HelpOnly`,`HintOnly`]})))()}R();export{N as Default,F as HelpOnly,I as HintOnly,P as StackedFigures,L as __namedExportsOrder,M as default};