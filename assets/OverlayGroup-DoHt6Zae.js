import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Cy89bvdA.js";import{n as r,t as i}from"./HelpTooltip-DJBDr9Tg.js";import{C as a,S as o,_ as s,b as c,v as l}from"./OverlaySegmented-D3FGIFSt.js";import{i as u,n as d}from"./overlaySurface-Cb72-hcv.js";import{l as f,t as p,u as m}from"./overlayPanelStyles-CJNL38vN.js";import{a as h,o as g,r as _}from"./OverlayIconButton-B14zLnuu.js";function v(e){let{children:t,label:n,help:r,divider:i=!0,direction:o=`row`}=e,{metrics:l}=u(),d=a(),p=(0,b.useId)();if(d!==void 0)return n===void 0?(0,x.jsx)(`div`,{style:m(l),children:t}):(0,x.jsxs)(`div`,{role:`group`,"aria-labelledby":p,style:m(l),children:[(0,x.jsx)(y,{help:r,children:(0,x.jsx)(`span`,{id:p,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:f(l,{divider:i,help:r!==void 0}),children:n})}),t]});let _=(0,x.jsx)(`div`,{style:h(l,o),children:t});return n===void 0?_:(0,x.jsxs)(`div`,{role:`group`,"aria-labelledby":p,style:c(l),children:[(0,x.jsx)(y,{help:r,children:(0,x.jsx)(`span`,{id:p,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:r===void 0?g(l):{...g(l),...s},children:n})}),_]})}function y(e){let{help:t,children:n}=e;return t===void 0?(0,x.jsx)(x.Fragment,{children:n}):(0,x.jsx)(i,{content:t,children:n})}var b,x;function S(){return(S=e((()=>{b=t(),r(),_(),o(),p(),l(),d(),x=n(),v.__docgenInfo={description:`Controls that answer one question, kept together.

On a bar, two controls that only make sense read together — a mode and the
number it takes — have to move together as the card reflows, or the reader
meets the number on a line of its own with nothing saying what it counts.

In a panel it is a section instead: a small-capitals heading over a hairline
that gives the eye somewhere to rest on the way down a long list. A heading
is worth adding once the cluster's idea has a name the names inside it do
not already spell out.
@param props - See {@link OverlayGroupProps}.
@returns The cluster.`,methods:[],displayName:`OverlayGroup`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The controls it holds.`},label:{required:!1,tsType:{name:`string`},description:`What the cluster is about, written over it in small capitals. In a panel
this is the section heading, and it is worth reaching for only past about
four rows: three settings under two headings is a panel that has been
filed rather than laid out. Nothing enforces that — a panel is allowed to
be wrong about its own length — but it is the line to hold.
@default undefined — the controls are drawn with no heading`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the cluster is for, in a sentence. Like a control's own help it hangs
off the heading, which is underlined with dots to say so.
@default undefined`},divider:{required:!1,tsType:{name:`boolean`},description:`Whether a hairline is drawn above the heading. Turn it off on the first
section of a panel: a rule immediately under the panel header's own rule
reads as a doubled line rather than as a division. Only consulted in a
panel.
@default true`},direction:{required:!1,tsType:{name:`union`,raw:`'row' | 'column'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'column'`}]},description:`How the controls inside are stacked. A row wraps as one unit, so a cluster
never breaks across two lines of the card mid-thought. Only consulted on a
bar; a section of a panel is always a column.
@default 'row'`}}}})))()}export{S as n,v as t};