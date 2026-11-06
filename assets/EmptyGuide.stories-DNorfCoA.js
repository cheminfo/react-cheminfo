import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CJRfpBq-.js";import{n as r,t as i}from"./icon-CoYpW1l4.js";import{n as a}from"./navItem-6b8YIPQN.js";function o(e,t,n){return t<=0||n<=0?0:Math.floor(e/n)%t}function s(e,t){let[n,r]=(0,c.useState)(()=>o(Date.now(),e,t));return(0,c.useEffect)(()=>{if(e<2||t<=0)return;let n=setInterval(()=>{r(e=>e+1)},t);return()=>{clearInterval(n)}},[e,t]),e>0?n%e:0}var c;function l(){return(l=e((()=>{c=t()})))()}function u(e){let{help:t,links:n,linksTitle:r,hints:i=[],hintInterval:a=_,figures:o=[]}=e;return(0,g.jsxs)(`div`,{className:`empty-guide no-print`,"data-testid":`empty-guide`,children:[t?(0,g.jsx)(`div`,{className:`empty-guide__help`,children:t}):null,n&&n.length>0?(0,g.jsx)(p,{links:n,title:r}):null,(0,g.jsx)(`div`,{className:`empty-guide__figures`,children:o.map(e=>(0,g.jsx)(f,{figure:e},e.src))}),i.length>0?(0,g.jsx)(h,{hints:i,interval:a}):null]})}function d(e){return(0,g.jsxs)(`section`,{className:`empty-guide__section`,children:[(0,g.jsx)(`h2`,{className:`empty-guide__title`,children:e.title}),e.children]})}function f(e){let{src:t,alt:n,share:r=1,onSelect:i,title:a}=e.figure,o=(0,g.jsx)(`img`,{src:t,alt:n,draggable:!1});return i?(0,g.jsx)(`button`,{type:`button`,className:`empty-guide__figure`,style:{flexGrow:r},title:a,onClick:i,children:o}):(0,g.jsx)(`figure`,{className:`empty-guide__figure`,style:{flexGrow:r},children:o})}function p(e){return(0,g.jsxs)(`nav`,{className:`empty-guide__links`,"aria-label":e.title,children:[e.title?(0,g.jsx)(`span`,{className:`empty-guide__title`,children:e.title}):null,e.links.map(e=>(0,g.jsx)(`a`,{href:e.href,onClick:t=>{m(t,e)},children:e.label},e.href))]})}function m(e,t){!t.onSelect||a(e)||(e.preventDefault(),t.onSelect())}function h(e){let{hints:t,interval:n}=e,r=s(t.length,n);return(0,g.jsxs)(`p`,{className:`empty-guide__hint`,"data-testid":`empty-guide-hint`,children:[(0,g.jsx)(i,{icon:`lightbulb`,size:14}),(0,g.jsx)(`span`,{children:t[r]},r)]})}var g,_;function v(){return(v=e((()=>{r(),l(),g=n(),_=9e3,u.__docgenInfo={description:`What a tool shows while it holds nothing: the space that is empty anyway says
how to start. It comes in grey over the tool, lets the pointer through to it
everywhere but on a link or a figure that can be clicked, and the site stops
rendering it at the first stroke.

Fill the absolute box of the tool's view with it: the parent is positioned.
@param props - See {@link EmptyGuideProps}.
@returns The guide.`,methods:[],displayName:`EmptyGuide`,props:{help:{required:!1,tsType:{name:`ReactNode`},description:`What is true on every visit: how to start, the keys. Sections drawn by
\`<EmptyGuideSection>\`, side by side as far as the width allows.
@default undefined — no help`},links:{required:!1,tsType:{name:`unknown`},description:`The ways to learn more, a line under the help.
@default undefined — no line`},linksTitle:{required:!1,tsType:{name:`string`},description:`What the line of links is headed.
@default undefined — no heading`},hints:{required:!1,tsType:{name:`unknown`},description:`What changes: one sentence on show at a time, the next one after
\`hintInterval\`, and another one first on the next visit.
@default undefined — no hint`},hintInterval:{required:!1,tsType:{name:`number`},description:`How long a hint stays, in milliseconds.
@default 9000`},figures:{required:!1,tsType:{name:`unknown`},description:`Pictures of what the tool can make, faint, side by side in the room left.
@default undefined — no picture`}}},d.__docgenInfo={description:`One section of a guide's help.
@param props - Its title, and what it says.
@param props.title - What it is about.
@param props.children - What it says.
@returns The section.`,methods:[],displayName:`EmptyGuideSection`,props:{title:{required:!0,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``}}}})))()}function y(e){return(0,x.jsx)(`dl`,{className:`shortcut-list`,children:e.rows.map(e=>(0,x.jsxs)(`div`,{className:`shortcut-list__row`,children:[(0,x.jsx)(`dt`,{children:(0,x.jsx)(b,{keys:e.keys})}),(0,x.jsx)(`dd`,{children:e.label})]},e.keys.join(` `)))})}function b(e){return(0,x.jsx)(`span`,{className:`shortcut-keys`,children:e.keys.map(e=>(0,x.jsx)(`kbd`,{children:e},e))})}var x;function S(){return(S=e((()=>{x=n(),y.__docgenInfo={description:`Keys and what they do, one line each, the caps in a column of their own so
the eye runs down them.
@param props - The lines.
@param props.rows - The keys and what they do.
@returns The list.`,methods:[],displayName:`ShortcutList`,props:{rows:{required:!0,tsType:{name:`unknown`},description:``}}},b.__docgenInfo={description:`Keys drawn as caps, in the grey of a guide.
@param props - The keys.
@param props.keys - The keys.
@returns The caps.`,methods:[],displayName:`ShortcutKeys`,props:{keys:{required:!0,tsType:{name:`unknown`},description:``}}}})))()}var C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{v(),S(),C=n(),w={position:`relative`,height:420,border:`1px solid var(--border)`,background:`var(--surface)`},T=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2226%22%20r%3D%2212%22%20fill%3D%22%232f8fd6%22%2F%3E%3Crect%20x%3D%2217%22%20y%3D%222%22%20width%3D%226%22%20height%3D%2214%22%20fill%3D%22%232f8fd6%22%2F%3E%3C%2Fsvg%3E`,E={title:`Guide/EmptyGuide`,component:u,decorators:[e=>(0,C.jsx)(`div`,{style:w,children:(0,C.jsx)(e,{})})],parameters:{docs:{description:{component:`What a tool shows while it holds nothing: help that stays, a hint that changes, and faint pictures of what the tool can make. The pointer goes through it, and the site stops rendering it at the first stroke.`}}}},D={args:{help:(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(d,{title:`Draw`,children:(0,C.jsx)(y,{rows:[{keys:[`Click`],label:`Draw a bond`},{keys:[`Drag`],label:`Aim it`}]})}),(0,C.jsx)(d,{title:`Point at an atom and press`,children:(0,C.jsx)(y,{rows:[{keys:[`c`,`n`,`o`],label:`Set the element`},{keys:[`+`,`-`],label:`Change the charge`}]})})]}),linksTitle:`Learn`,links:[{label:`From a blank page to a figure`,href:`#talk`}],hints:[`Paste a SMILES to add it to the drawing.`,`Drop a molfile on the page to open it.`],hintInterval:3e3,figures:[{src:T,alt:`A flask`,share:2},{src:`${T}#clicked`,alt:`Another flask`,title:`Copy it to the page`,onSelect:()=>void 0}]}},O={args:{help:(0,C.jsx)(d,{title:`Start`,children:`Type a formula, and its isotopic distribution appears here.`})}},k={args:{hints:[`Type a formula such as C6H12O6 to see its isotopic distribution.`]}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    help: <EmptyGuideSection title="Start">
        Type a formula, and its isotopic distribution appears here.
      </EmptyGuideSection>
  }
}`,...O.parameters?.docs?.source},description:{story:`Help alone: a tool with nothing to show off and nothing that changes.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    hints: ['Type a formula such as C6H12O6 to see its isotopic distribution.']
  }
}`,...k.parameters?.docs?.source},description:{story:`A hint alone, at the bottom of the empty space.`,...k.parameters?.docs?.description}}},A=[`Default`,`HelpOnly`,`HintOnly`]})))()}j();export{D as Default,O as HelpOnly,k as HintOnly,A as __namedExportsOrder,E as default};