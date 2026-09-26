import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C_0-xZ4H.js";import{n,t as r}from"./icon-CiSLA9df.js";import{n as i,t as a}from"./useT-DdDrCs00.js";import{n as o}from"./joinClassNames-BbK_6p9Z.js";import{n as s,t as c}from"./HelpTooltip-DUZQf2Lx.js";import{t as l}from"./helpName-uK3f7RM1.js";function u(e){let{content:t,label:n,icon:a=`help`,size:s=13,placement:u=`right`,className:f}=e,p=i();return(0,d.jsx)(c,{content:t,placement:u,children:(0,d.jsx)(r,{icon:a,size:s,tabIndex:0,"aria-label":n??l(t,p),className:o(`help-icon`,f)})})}var d;function f(){return(f=e((()=>{n(),a(),s(),d=t(),u.__docgenInfo={description:`The small question mark that sits beside a field label.

It is reachable by tab, so the explanation is not reserved to whoever is
holding a pointer.
@param props - See {@link HelpIconProps}.
@returns The glyph and its help.`,methods:[],displayName:`HelpIcon`,props:{content:{required:!0,tsType:{name:`HelpContent`},description:"The help the glyph reveals. A site with free-form help passes only a\n`body`."},label:{required:!1,tsType:{name:`string`},description:`What a screen reader calls the glyph.
@default the help's title, or the chrome's own word for help when it has
none`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph drawn, for a site that marks help with another sign.
@default 'help'`},size:{required:!1,tsType:{name:`number`},description:`Size of the glyph in pixels, so it sits on the line of the label it
follows.
@default 13`},placement:{required:!1,tsType:{name:`union`,raw:`'top' | 'right' | 'bottom' | 'left'`,elements:[{name:`literal`,value:`'top'`},{name:`literal`,value:`'right'`},{name:`literal`,value:`'bottom'`},{name:`literal`,value:`'left'`}]},description:`Which side the help opens on.
@default 'right'`},className:{required:!1,tsType:{name:`string`},description:"Class the glyph carries, in addition to `help-icon`.\n@default undefined"}}}})))()}export{f as n,u as t};