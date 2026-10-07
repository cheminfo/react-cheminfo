import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DmsZCiF9.js";import{n,t as r}from"./useT-CHjajSTB.js";import{n as i,r as a}from"./buttons-CFMpNh65.js";import{n as o}from"./joinClassNames-BbK_6p9Z.js";import{n as s,t as c}from"./HelpTooltip-zf0bpUBD.js";import{t as l}from"./helpName-uK3f7RM1.js";function u(e){let{content:t,onClick:r,label:a,icon:s=`help`,small:u=!1,className:f}=e,p=n();return(0,d.jsx)(c,{content:t,placement:`bottom`,children:(0,d.jsx)(i,{variant:`minimal`,size:u?`small`:`medium`,icon:s,text:a,"aria-label":a??l(t,p),className:o(`no-print`,f),onClick:r})})}var d;function f(){return(f=e((()=>{a(),r(),s(),d=t(),u.__docgenInfo={description:`The help entry of a toolbar: a glyph that explains itself on hover and opens
the full guide when pressed.

It shows the same body as the glyph beside a field and as any other mention
of that help, so a construct is documented in one place.
@param props - See {@link HelpToolbarButtonProps}.
@returns The toolbar button and its help.`,methods:[],displayName:`HelpToolbarButton`,props:{content:{required:!0,tsType:{name:`HelpContent`},description:`The help the button reveals on hover.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What pressing the button does — usually opening the guide the tooltip
summarises. Left out for a button that only explains itself.
@default undefined — the button does nothing when pressed`},label:{required:!1,tsType:{name:`string`},description:`Text beside the glyph. Left out for a toolbar that has run out of room.
@default undefined — the button is reduced to its glyph`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph of the button.
@default 'help'`},small:{required:!1,tsType:{name:`boolean`},description:`Whether the button is the small size a dense toolbar needs.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class the button carries.
@default undefined`}}}})))()}export{f as n,u as t};