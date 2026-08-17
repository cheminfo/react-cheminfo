import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-PyJ4qDGk.js";import{n,t as r}from"./icon-BjhocVEU.js";import{a as i,o as a}from"./helpContent-CscgE0Ey.js";function o(e){let{content:t,size:n=13,placement:a=`right`,className:o}=e;return(0,s.jsx)(i,{content:t,placement:a,children:(0,s.jsx)(r,{icon:`help`,size:n,tabIndex:0,"aria-label":t.title,className:o===void 0?`help-icon`:`help-icon ${o}`})})}var s;function c(){return(c=e((()=>{n(),a(),s=t(),o.__docgenInfo={description:`The small question mark that sits beside a field label.

It is reachable by tab, so the explanation is not reserved to whoever is
holding a pointer.
@param props - See {@link HelpIconProps}.
@returns The glyph and its help.`,methods:[],displayName:`HelpIcon`,props:{content:{required:!0,tsType:{name:`HelpContent`},description:`The help the glyph reveals.`},size:{required:!1,tsType:{name:`number`},description:`Size of the glyph in pixels, so it sits on the line of the label it
follows.
@default 13`},placement:{required:!1,tsType:{name:`union`,raw:`'top' | 'right' | 'bottom' | 'left'`,elements:[{name:`literal`,value:`'top'`},{name:`literal`,value:`'right'`},{name:`literal`,value:`'bottom'`},{name:`literal`,value:`'left'`}]},description:`Which side the help opens on.
@default 'right'`},className:{required:!1,tsType:{name:`string`},description:"Class the glyph carries, in addition to `help-icon`.\n@default undefined"}}}})))()}export{c as n,o as t};