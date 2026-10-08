import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Bx_6GVVU.js";import{n,t as r}from"./tooltip-BMDfpCTw.js";import{n as i,t as a}from"./useActionTooltip-goMw7ndt.js";function o(e){let{content:t,children:n,opened:a=!1}=e,{placement:o=`bottom`,popoverClassName:l=`help-tooltip`}=e,{delay:u}=e,{isOpen:d,target:f}=i(a,u);return(0,s.jsx)(r,{content:t,placement:o,popoverClassName:l,isOpen:d,children:(0,s.jsx)(`span`,{style:c,...f,children:n})})}var s,c;function l(){return(l=e((()=>{n(),a(),s=t(),c={display:`inline-flex`},o.__docgenInfo={description:`A tooltip on a control that opens something — a dialog, a popover, a menu.

It is the wrapper form of {@link useActionTooltip}, which is where the whole
argument is written; a tooltip whose target cannot take a wrapping element —
a menu item, a table cell — uses the hook directly.
@param props - See {@link ActionTooltipProps}.
@returns The control, with its tooltip.`,methods:[],displayName:`ActionTooltip`,props:{content:{required:!0,tsType:{name:`union`,raw:`string | ReactElement`,elements:[{name:`string`},{name:`ReactElement`}]},description:`What the control is for, read on hover.`},children:{required:!0,tsType:{name:`ReactElement`},description:`The control.`},opened:{required:!1,tsType:{name:`boolean`},description:`Whether what the control opens is on screen. While it is, the tooltip
stays shut.
@default false`},placement:{required:!1,tsType:{name:`Placement`},description:`Which side of the control the tooltip is drawn on.
@default 'bottom'`},popoverClassName:{required:!1,tsType:{name:`string`},description:`Class the popover carries, for a card that is not the chrome's own.
@default 'help-tooltip'`},delay:{required:!1,tsType:{name:`number`},description:`How long the pointer rests on the control before the card is drawn, in
milliseconds.
@default 250`}}}})))()}export{l as n,o as t};