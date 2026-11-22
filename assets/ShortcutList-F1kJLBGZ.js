import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-YPNzoHBo.js";import{n as r,t as i}from"./icon-DP3djEra.js";import{n as a}from"./navItem-6b8YIPQN.js";function o(e){return(0,u.jsx)(`div`,{className:`empty-guide__figures`,children:e.figures.map(e=>`stack`in e?(0,u.jsx)(s,{entry:e},c(e)):(0,u.jsx)(l,{figure:e},e.src))})}function s(e){let{stack:t,share:n=1}=e.entry;return(0,u.jsx)(`div`,{className:`empty-guide__stack`,style:{flexGrow:n},children:t.map(e=>(0,u.jsx)(l,{figure:e},e.src))})}function c(e){return e.stack.map(e=>e.src).join(` `)}function l(e){let{src:t,alt:n,share:r=1,onSelect:i,title:a,label:o}=e.figure,s=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(`img`,{src:t,alt:n,draggable:!1}),o?(0,u.jsx)(`span`,{className:`empty-guide__label`,children:o}):null]});return i?(0,u.jsx)(`button`,{type:`button`,className:`empty-guide__figure`,style:{flexGrow:r},title:a,onClick:i,children:s}):(0,u.jsx)(`figure`,{className:`empty-guide__figure`,style:{flexGrow:r},children:s})}var u;function d(){return(d=e((()=>{u=n(),o.__docgenInfo={description:`The faint pictures of a guide, side by side in the room left.
@param props - The figures.
@param props.figures - The pictures, some of them stacked.
@returns The row.`,methods:[],displayName:`GuideFigures`,props:{figures:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`union`,raw:`EmptyGuideFigure | EmptyGuideFigureStack`,elements:[{name:`EmptyGuideFigure`},{name:`EmptyGuideFigureStack`}]}],raw:`ReadonlyArray<EmptyGuideFigure | EmptyGuideFigureStack>`},description:``}}}})))()}function f(e,t,n){return t<=0||n<=0?0:Math.floor(e/n)%t}function p(e,t){let[n,r]=(0,m.useState)(()=>f(Date.now(),e,t));return(0,m.useEffect)(()=>{if(e<2||t<=0)return;let n=setInterval(()=>{r(e=>e+1)},t);return()=>{clearInterval(n)}},[e,t]),e>0?n%e:0}var m;function h(){return(h=e((()=>{m=t()})))()}function g(e){let{actions:t=[],help:n,links:r,linksTitle:i,hints:a=[],hintInterval:s=C,figures:c=[],figuresTitle:l}=e;return(0,S.jsx)(`div`,{className:`empty-guide no-print`,"data-testid":`empty-guide`,children:(0,S.jsxs)(`div`,{className:`empty-guide__body`,children:[n?(0,S.jsx)(`div`,{className:`empty-guide__help`,children:n}):null,r&&r.length>0?(0,S.jsx)(y,{links:r,title:i}):null,t.length>0||l?(0,S.jsx)(v,{actions:t,figuresTitle:l}):null,(0,S.jsx)(o,{figures:c}),a.length>0?(0,S.jsx)(x,{hints:a,interval:s}):null]})})}function _(e){return(0,S.jsxs)(`section`,{className:`empty-guide__section`,children:[(0,S.jsx)(`h2`,{className:`empty-guide__title`,children:e.title}),e.children]})}function v(e){let{actions:t,figuresTitle:n}=e;return(0,S.jsxs)(`div`,{className:`empty-guide__start`,children:[t.map(e=>(0,S.jsxs)(`button`,{type:`button`,className:`empty-guide__action`,onClick:e.onSelect,children:[e.icon?(0,S.jsx)(i,{icon:e.icon,size:18}):null,e.label]},e.label)),n?(0,S.jsx)(`p`,{className:`empty-guide__figures-title`,children:n}):null]})}function y(e){return(0,S.jsxs)(`nav`,{className:`empty-guide__links`,"aria-label":e.title,children:[e.title?(0,S.jsx)(`span`,{className:`empty-guide__title`,children:e.title}):null,e.links.map(e=>(0,S.jsx)(`a`,{href:e.href,onClick:t=>{b(t,e)},children:e.label},e.href))]})}function b(e,t){!t.onSelect||a(e)||(e.preventDefault(),t.onSelect())}function x(e){let{hints:t,interval:n}=e,r=p(t.length,n);return(0,S.jsxs)(`p`,{className:`empty-guide__hint`,"data-testid":`empty-guide-hint`,children:[(0,S.jsx)(i,{icon:`lightbulb`,size:14}),(0,S.jsx)(`span`,{children:t[r]},r)]})}var S,C;function w(){return(w=e((()=>{r(),d(),h(),S=n(),C=9e3,g.__docgenInfo={description:`What a tool shows while it holds nothing: the space that is empty anyway says
how to start. It comes in grey over the tool, lets the pointer through to it
everywhere but on what can be clicked or typed in — a button, a link, a
figure that can be clicked, a capsule, a field — and the site stops
rendering it at the first stroke.

Fill the absolute box of the tool's view with it: the parent is positioned.
A small box keeps the figures and says each section's title and first line;
a phone-sized one drops the figures.
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
@returns The caps.`,methods:[],displayName:`ShortcutKeys`,props:{keys:{required:!0,tsType:{name:`unknown`},description:``}}}})))()}export{w as a,_ as i,O as n,g as r,T as t};