import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CGFjf9cs.js";import{n,r}from"./buttons-C48J1DRg.js";import{a as i,o as a}from"./helpContent-BTXD2agD.js";function o(e){let{content:t,onClick:r,label:a,icon:o=`help`,small:c=!1,className:l}=e;return(0,s.jsx)(i,{content:t,placement:`bottom`,children:(0,s.jsx)(n,{variant:`minimal`,size:c?`small`:`medium`,icon:o,text:a,"aria-label":a??t.title,className:l,onClick:r})})}var s;function c(){return(c=e((()=>{r(),a(),s=t(),o.__docgenInfo={description:`The help entry of a toolbar: a glyph that explains itself on hover and opens
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
@default undefined`}}}})))()}export{c as n,o as t};