import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DzkT2GF_.js";import{i as n,n as r}from"./overlaySurface-DHur7bpc.js";import{n as i,r as a}from"./overlayFigureStyles-Bo423KJ2.js";function o(e){let{children:t,placement:r=`over`,edge:i=`bottom`}=e,{tone:o=`quiet`,live:l=!1}=e,{metrics:u}=n();return(0,c.jsx)(`div`,{style:r===`below`?d:s(i,u),children:(0,c.jsx)(`span`,{style:a(u,o),"aria-live":l?`polite`:void 0,"aria-atomic":l?!0:void 0,children:t})})}function s(e,t){return{position:`absolute`,left:0,right:0,top:e===`top`?0:void 0,bottom:e===`bottom`?0:void 0,display:`flex`,alignItems:`center`,padding:`${t.paddingY}px ${t.inset}px`,background:`linear-gradient(to ${e===`bottom`?`top`:`bottom`}, ${l}, ${l} 45%, ${u})`,pointerEvents:`none`}}var c,l,u,d;function f(){return(f=e((()=>{i(),r(),c=t(),l=`color-mix(in srgb, var(--surface) 86%, transparent)`,u=`color-mix(in srgb, var(--surface) 0%, transparent)`,d={display:`flex`,alignItems:`center`},o.__docgenInfo={description:`The band across a figure that says, in one sentence, what it is showing.

Floating, it is a gradient rather than a filled strip: the sentence stays
readable while the marks under its far edge stay visible, so it never looks
as though it has cropped the data. Docked, it needs neither — there is
nothing under it to see through to.
@param props - See {@link OverlayCaptionProps}.
@returns The band.`,methods:[],displayName:`OverlayCaption`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`One sentence, in words the reader already has. It is the figure's own
explanation, so it names what a mark is before it names what an axis is.`},placement:{required:!1,tsType:{name:`union`,raw:`'over' | 'below'`,elements:[{name:`literal`,value:`'over'`},{name:`literal`,value:`'below'`}]},description:`Whether it floats over the figure or is laid out in the flow beneath it.

A figure reserves the foot of its own box for the horizontal axis title, so
a band floating there prints the sentence over the axis name. \`below\` is
therefore what a standing explanation wants: it explains the picture rather
than annotating a gesture, and nothing it says is worth covering the axis
for. \`over\` is left for a sentence that has to reach the reader without the
figure moving under their pointer.
@default 'over'`},edge:{required:!1,tsType:{name:`union`,raw:`'top' | 'bottom'`,elements:[{name:`literal`,value:`'top'`},{name:`literal`,value:`'bottom'`}]},description:`Which edge it sits against, when it floats over the figure. A docked
caption ignores it — it has only the one place to be.
@default 'bottom'`},tone:{required:!1,tsType:{name:`union`,raw:`'quiet' | 'strong'`,elements:[{name:`literal`,value:`'quiet'`},{name:`literal`,value:`'strong'`}]},description:"How loud it is. `quiet` is the standing explanation; `strong` is live\nstate the reader has just caused — `Adding to selection`, `31 samples\nselected`.\n@default 'quiet'"},live:{required:!1,tsType:{name:`boolean`},description:`Whether a screen reader is told about it as it changes. Turn it on for
\`strong\`, so a selection made by keyboard is announced.
@default false`}}}})))()}export{f as n,o as t};