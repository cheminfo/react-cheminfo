import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BFcqecWa.js";import{n,t as r}from"./icon-CCk9lzfD.js";import{i,n as a}from"./overlaySurface-BnH9Afip.js";import{n as o,t as s}from"./useOverlayInteraction-8OkQyOGg.js";import{a as c,t as l}from"./overlayControlStyles-miIy0n3T.js";function u(e){let{icon:t,label:n,value:a,active:s=!1,disabled:l=!1}=e,{disabledReason:u,opensMenu:p=!1,onClick:m,testId:h}=e,{untitled:g=!1}=e,{metrics:_}=i(),{hovered:v,focused:y,handlers:b}=o(),x=a===void 0?n:`${n} — ${a}`;return(0,f.jsx)(`button`,{type:`button`,className:`no-print`,title:g?void 0:l&&u!==void 0?u:x,"aria-label":x,"aria-haspopup":p?`menu`:void 0,"aria-expanded":p?s:void 0,"aria-pressed":p?void 0:s,disabled:l,"data-testid":h,style:c(_,{hovered:v,focused:y,active:s,disabled:l}),onClick:m,...b,children:typeof t==`string`?(0,f.jsx)(r,{icon:t,size:d(_.buttonSize)}):t})}function d(e){return Math.max(12,Math.round(e*.55))}var f;function p(){return(p=e((()=>{n(),l(),a(),s(),f=t(),u.__docgenInfo={description:`One setting reduced to its glyph.

A bar of named controls over an embedded figure spends more of the picture
on its own words than the figure spends on the data, so on the bar a setting
is a glyph and its name is what the pointer and the screen reader are told.
That trade is only honest while the name is always there, which is why the
label is required rather than optional and why it carries the current value
with it: an icon nobody can name is a control nobody presses.
@param props - See {@link OverlayIconButtonProps}.
@returns The button.`,methods:[],displayName:`OverlayIconButton`,props:{icon:{required:!0,tsType:{name:`union`,raw:`IconName | ReactElement`,elements:[{name:`IconName`},{name:`ReactElement`}]},description:`The glyph: a Blueprint icon name, or an element of the caller's own — an
inline \`<svg>\` drawing the very mark the figure draws, which is the one
kind of icon a reader does not have to learn.`},label:{required:!0,tsType:{name:`string`},description:"What the setting is called, phrased as the question the reader already\nhas: `Colour by`, `Group outlines`. It is written into both `title` and\n`aria-label`, because a glyph says nothing until it is named — that is the\nprice of an icon-only bar, and it is paid here rather than left to each\ncaller to remember."},value:{required:!1,tsType:{name:`string`},description:"What the setting is currently on, written after the name as\n`label — value`. Give it wherever there is one: `Colour by — species`\nanswers the reader's actual question, where `Colour by` alone only tells\nthem which question the button asks.\n@default undefined — the name alone"},active:{required:!1,tsType:{name:`boolean`},description:`Whether the choices behind it are showing, or the thing it turns on is on.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether it cannot be pressed.
@default false`},disabledReason:{required:!1,tsType:{name:`string`},description:`Why it cannot be pressed, which the pointer is told in place of the name.
A greyed glyph that does not say why is the one thing worse than a glyph.
@default undefined — the pointer is still told the name`},opensMenu:{required:!1,tsType:{name:`boolean`},description:`Whether pressing it opens a menu. Its state is then announced as a menu
that is open or shut rather than as a button that is pressed, which is
what tells a screen reader there is more behind it.
@default false`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed. Leave it out inside a popover, which listens on
the wrapper it puts around the button and would otherwise be told twice.
@default undefined — nothing of its own happens`},untitled:{required:!1,tsType:{name:`boolean`},description:`Whether the pointer is left without the browser's own tooltip, for a
button that already opens a card of its own on hover: the two would
otherwise stack. The screen reader is still told the name.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}export{p as n,u as t};