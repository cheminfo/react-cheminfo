import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C_0-xZ4H.js";import{n,t as r}from"./useT-DdDrCs00.js";import{n as i,r as a}from"./buttons-DFytC0DQ.js";import{n as o,t as s}from"./HelpTooltip-DUZQf2Lx.js";import{t as c}from"./helpName-uK3f7RM1.js";function l(e){let{content:t,onClick:r,label:a,icon:o=`help`,small:l=!1,className:d}=e,f=n();return(0,u.jsx)(s,{content:t,placement:`bottom`,children:(0,u.jsx)(i,{variant:`minimal`,size:l?`small`:`medium`,icon:o,text:a,"aria-label":a??c(t,f),className:d,onClick:r})})}var u;function d(){return(d=e((()=>{a(),r(),o(),u=t(),l.__docgenInfo={description:`The help entry of a toolbar: a glyph that explains itself on hover and opens
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
@default undefined`}}}})))()}export{d as n,l as t};