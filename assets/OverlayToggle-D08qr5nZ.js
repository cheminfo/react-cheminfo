import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-vuJI5ajg.js";import{n as r,t as i}from"./icon-CvEvlnQN.js";import{o as a,t as o}from"./components-D_4HRFR0.js";import{n as s,t as c}from"./htmlSelect-CuyGC72P.js";import{i as l,n as u,r as d,t as f}from"./menuItem-l5ndxX0y.js";import{i as p,r as m}from"./popoverNextMigrationUtils-DYxerxyT.js";import{n as h,t as g}from"./menuDivider-Bdolqmsr.js";import{T as _,_ as v,a as y,c as b,f as ee,m as te,o as ne,p as re,s as ie,v as x,w as S}from"./OverlaySegmented-Bvu8PDZy.js";import{i as C,n as w}from"./overlaySurface-B-_PBqFf.js";import{t as ae}from"./clamp-M7_x50VL.js";import{a as oe,t as T}from"./numbers-BxzU8aH2.js";import{S as se,x as ce}from"./chartFrameGeometry-CYHWhbkM.js";import{a as le,c as ue,d as de,f as fe,l as pe,m as me,o as he,p as ge,s as E,u as _e}from"./ChartFrame-1gnPG4E0.js";import{n as ve,r as ye,s as be,t as xe}from"./OverlayIconButton-COfiiPWn.js";function Se(e,t){return!Number.isFinite(e)||e<=0||!Number.isFinite(t)?!1:e<t}function Ce(e){let{collapsed:t,startedFolded:n,width:r,collapseBelow:i}=e;return t??(n||Se(r,i))}function D(e){let{children:t,placement:n,label:r,icon:i,padded:a=!0}=e,{metrics:o}=C(),[s,c]=(0,O.useState)(!1);return(0,k.jsx)(m,{placement:A[n],onInteraction:e=>c(e),content:a?(0,k.jsx)(`div`,{style:ge(o),children:t}):(0,k.jsx)(k.Fragment,{children:t}),children:(0,k.jsx)(xe,{icon:i,label:r,active:s,opensMenu:!0})})}var O,k,A;function j(){return(j=e((()=>{p(),O=t(),ve(),E(),w(),k=n(),A={"top-left":`bottom-start`,"top-right":`bottom-end`,"bottom-left":`top-start`,"bottom-right":`top-end`,above:`bottom-end`,below:`top-end`,stretch:`bottom-end`},D.__docgenInfo={description:`The button at the end of a bar, and the panel behind it.

Both shapes of bar draw this one, so a reader who has opened the controls of
a floating card knows where the controls of an embedded figure are. It is
the domain's own icon button rather than a general one, which is what keeps
it the same weight of ink as the glyph beside it and lets it say, while the
panel is open, that it is the thing holding the panel open.
@param props - See {@link OverlayBarButtonProps}.
@returns The button and its panel.`,methods:[],displayName:`OverlayBarButton`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The controls it holds: whatever has folded away, then the second tier —
everything an expert changes and a reader never does.`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits, which is what decides the way the panel opens.`},label:{required:!0,tsType:{name:`string`},description:`What the button is called, for the pointer and for a screen reader.`},icon:{required:!0,tsType:{name:`IconName`},description:`Its glyph.`},padded:{required:!1,tsType:{name:`boolean`},description:`Whether the panel is drawn with the card's own padding around it. Turn it
off for an {@link OverlayPanel}, which brings its own: nested inside a
padded surface a panel's header rule stops short of both edges and reads
as a mis-drawn line rather than as a header.
@default true`}}}})))()}function M(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d,restingOpacity:f}=e,{metrics:p,awake:m,busy:h}=C(),g=u||a!==void 0?(0,N.jsxs)(D,{placement:o,label:s,icon:c,padded:l,children:[u?t:null,a]}):null;return(0,N.jsxs)(`div`,{style:_e(o,p),"data-testid":d,children:[(0,N.jsx)(`div`,{style:fe(m?1:me(f),h)}),u?(0,N.jsx)(`div`,{style:de(p),children:g}):(0,N.jsxs)(`div`,{role:`group`,"aria-label":s,style:de(p),children:[t,n,r,i,g]})]})}var N;function P(){return(P=e((()=>{j(),E(),w(),N=n(),M.__docgenInfo={description:`The small card of controls floating in a corner of a figure.

It rests at three quarters strength and wakes when the pointer reaches the
figure or the keyboard reaches one of its controls; only the ground fades,
never the text, and the tab order is the same whether it is resting or
awake, so the fade is a courtesy to the eye and never a gate on the
interaction.

Folded, it is the button alone: a card has only the one tier, and a corner
of a narrow figure is not somewhere half a strip of controls can live — the
tools fold away with the controls, since what they act on is the very figure
the card would then be covering.
@param props - See {@link OverlayBarCardProps}.
@returns The card.`,methods:[],displayName:`OverlayBarCard`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The controls at the start of the row.`},end:{required:!1,tsType:{name:`ReactNode`},description:`What sits at the far end of the row.
@default undefined — the end holds only the glyphs`},tools:{required:!1,tsType:{name:`ReactNode`},description:`The glyph-sized tools that act on the figure rather than change it.
@default undefined — the bar carries no tools`},info:{required:!1,tsType:{name:`ReactNode`},description:`The one control that never folds.
@default undefined — the bar carries no glyph`},more:{required:!1,tsType:{name:`ReactNode`},description:`What waits behind the button.
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"},restingOpacity:{required:!0,tsType:{name:`number`},description:`How opaque the ground is while nothing is pointing at the figure.`}}}})))()}function F(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d}=e,{metrics:f}=C(),p=a!==void 0||u&&n!==void 0;return(0,I.jsxs)(`div`,{style:_e(o,f),"data-testid":d,children:[(0,I.jsx)(`div`,{style:le}),(0,I.jsxs)(`div`,{style:ue(f),children:[(0,I.jsx)(`div`,{style:pe(f),children:t}),(0,I.jsxs)(`div`,{role:`group`,"aria-label":s,style:pe(f),children:[u?null:n,r,i,p?(0,I.jsxs)(D,{placement:o,label:s,icon:c,padded:l,children:[u?n:null,a]}):null]})]})]})}var I;function L(){return(L=e((()=>{j(),E(),w(),I=n(),F.__docgenInfo={description:`The bar that spans the width of the figure, its two ends pushed apart.

It is in the flow above the picture rather than on it, and its ground is
solid rather than translucent, because a strip reaching from one edge of the
figure to the other is chrome the picture is mounted in — a floating card
that wide would cover the very data it is there to explain.

What folds when the figure is too narrow is the far end alone: the start
holds the strip a reader moves between views with, and a reader who cannot
leave the view they are on is stuck rather than merely short of options.
@param props - See {@link OverlayBarShapeProps}.
@returns The bar.`,methods:[],displayName:`OverlayBarStrip`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The controls at the start of the row.`},end:{required:!1,tsType:{name:`ReactNode`},description:`What sits at the far end of the row.
@default undefined — the end holds only the glyphs`},tools:{required:!1,tsType:{name:`ReactNode`},description:`The glyph-sized tools that act on the figure rather than change it.
@default undefined — the bar carries no tools`},info:{required:!1,tsType:{name:`ReactNode`},description:`The one control that never folds.
@default undefined — the bar carries no glyph`},more:{required:!1,tsType:{name:`ReactNode`},description:`What waits behind the button.
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"}}}})))()}function we(e){let{children:t,end:n,tools:r,info:i,more:a}=e,{placement:o=`top-right`}=e,{label:s=`Options`,restingOpacity:c=he}=e,{collapsed:l,defaultCollapsed:u=!1}=e,{collapseBelow:d=420,moreIcon:f=`cog`,testId:p}=e,{morePadded:m=!0}=e,{width:h}=C(),[g]=(0,Te.useState)(u),_=Ce({collapsed:l,startedFolded:g,width:h,collapseBelow:d});return o===`stretch`?(0,R.jsx)(F,{end:n,tools:r,info:i,more:a,placement:o,label:s,moreIcon:f,morePadded:m,folded:_,testId:p,children:t}):(0,R.jsx)(M,{end:n,tools:r,info:i,more:a,placement:o,label:s,moreIcon:f,morePadded:m,folded:_,restingOpacity:c,testId:p,children:t})}var Te,R;function Ee(){return(Ee=e((()=>{Te=t(),P(),L(),E(),w(),R=n(),we.__docgenInfo={description:`The controls of a figure: a small card floating in one of its corners, or
one bar spanning the width above it.

Which of the two it is, is the whole of the decision made here — the shapes
themselves are drawn by {@link OverlayBarCard} and {@link OverlayBarStrip},
because a card that hides in a corner and a strip that spans the width agree
on what they hold and on nothing about how they sit. A stretched bar is what
an embedded figure wants, where a floating card would spend the host's page
twice — once on the chrome and once on the data the chrome is covering.
@param props - See {@link OverlayBarProps}.
@returns The bar.`,methods:[],displayName:`OverlayBar`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The controls that stay on screen. Keep it to one or two in a floating
card: a third is already a panel, and a panel over a figure hides the
figure. A stretched bar holds its tab strip here, at the start of the row.`},end:{required:!1,tsType:{name:`ReactNode`},description:`What sits at the far end of the row: the controls belonging to whatever
the figure is currently showing. They are the first thing to go when the
figure is too narrow for both ends, folding in behind the button.
@default undefined — the bar's end holds only its glyphs`},tools:{required:!1,tsType:{name:`ReactNode`},description:`The glyph-sized tools that act on the figure rather than change how it is
drawn — saving it as a file, printing it. They ride beside the \`?\` at the
end of the row and, on a stretched bar, never fold: a tool is one button
wide already, and a reader who cannot find the one that takes the figure
away concludes the figure cannot be taken away.
@default undefined — the bar carries no tools`},info:{required:!1,tsType:{name:`ReactNode`},description:`The one control drawn at the end whatever the width — the \`?\` opening the
figure's own explanation. It never folds, because a reader short of room
is exactly the reader who has not been told what they are looking at.
@default undefined — the bar carries no glyph`},more:{required:!1,tsType:{name:`ReactNode`},description:`What opens behind the button at the end of the bar — everything an expert
changes and a reader never does. This is where a control goes unless
somebody argued for putting it in the strip.
@default undefined — the bar carries no button`},placement:{required:!1,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:"Where it sits. Pick the corner the data leaves emptiest, which\n`emptiestCorner` answers from the points themselves, or `stretch` for the\nsettings bar of an embedded figure, which spans the width above it.\n@default 'top-right'"},label:{required:!1,tsType:{name:`string`},description:`What the group of controls is called, for a reader arriving by tab and for
the button the bar folds into.
@default 'Options'`},restingOpacity:{required:!1,tsType:{name:`number`},description:`How opaque the bar is while nothing is pointing at the figure. Never below
about 0.6: a control the reader cannot see is a control they will not look
for, and only the ground fades — the text is always at full strength. \`1\`
pins it, which is what a figure about to be screenshotted wants. A
stretched bar ignores it: its ground is chrome rather than something laid
over the picture, and chrome that fades reads as a fault.
@default 0.74`},collapsed:{required:!1,tsType:{name:`boolean`},description:"Whether the bar is reduced to a button opening the same controls in a\npopover. Left out, it folds on its own once the figure is narrower than\n`collapseBelow`. A caller that needs to know whether a bar left to decide\nhas folded asks `overlayBarFolded` with the width `useOverlaySurface`\nreads, which is the answer the bar itself draws from.\n@default undefined — the bar decides from the figure's width"},defaultCollapsed:{required:!1,tsType:{name:`boolean`},description:`Whether it starts folded, for a bar the reader may open and close.
@default false`},collapseBelow:{required:!1,tsType:{name:`number`},description:`Figure width, in pixels, under which the bar folds on its own.
@default 420`},moreIcon:{required:!1,tsType:{name:`IconName`},description:`Blueprint glyph of the button that opens the rest. A cog rather than an
ellipsis, because once the bar folds that button holds every control and
not only the second tier.
@default 'cog'`},morePadded:{required:!1,tsType:{name:`boolean`},description:`Whether what opens behind that button is drawn with the card's own padding
around it. Turn it off when \`more\` is an {@link OverlayPanel}, which
brings its own: nested inside a padded surface a panel's header rule stops
short of both edges and reads as a mis-drawn line rather than as a header.
@default true`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card, for the end-to-end tests.\n@default undefined"}}}})))()}function z(e){let{colors:t}=e,{metrics:n}=C(),r=t.length>V?V-1:t.length,i=t.length-r,a=ke(n),o=[];for(let e=0;e<r;e++){let n=t[e];n!==void 0&&o.push((0,B.jsx)(`span`,{style:De(n,a)},`${e}:${n}`))}return(0,B.jsxs)(`span`,{"aria-hidden":`true`,style:Ae,children:[o,i>0?(0,B.jsx)(`span`,{style:Oe(n),children:`+${i}`}):null]})}function De(e,t){return{display:`inline-block`,width:t,height:t,borderRadius:`50%`,background:e,boxShadow:t>=6?`inset 0 0 0 1px var(--border)`:void 0}}function Oe(e){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:600,lineHeight:1}}function ke(e){return Math.max(4,Math.round(e.buttonSize/6))}var B,V,Ae;function H(){return(H=e((()=>{w(),B=n(),V=4,Ae={display:`inline-flex`,alignItems:`center`,gap:2},z.__docgenInfo={description:`The colours of a figure, as the glyph of the control that changes them.

Every other icon on a bar has to be learned before it means anything. This
one does not: a reader who has just looked at four groups of dots knows what
a row of those four colours opens, which is why the control that picks what
the figure is coloured by wears its palette rather than a paint-pot.

Past four colours it becomes three and a count. Eight dots inside a
twenty-four pixel button is a smear, and a smear says less about the figure
than three honest colours and the news that there are more.
@param props - See {@link OverlaySwatchIconProps}.
@returns The row of dots.`,methods:[],displayName:`OverlaySwatchIcon`,props:{colors:{required:!0,tsType:{name:`unknown`},description:`The colours the figure is drawn in, in the order it draws them. Hand it
the very colours on the chart: the whole point of this glyph is that a
reader recognises the plot in it without being taught anything.`}}}})))()}function je(e){return{display:`inline-flex`,alignItems:`center`,gap:0,height:e.controlHeight,padding:2,borderRadius:e.controlRadius,background:`var(--surface-sunken)`}}function Me(e,t){let n=e.controlHeight-4;return{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:n,height:n,padding:0,border:`none`,borderRadius:Math.max(3,e.controlRadius-2),background:`transparent`,color:t?`var(--text-faint)`:`var(--text-muted)`,font:`inherit`,fontSize:e.fontSize+1,lineHeight:1,cursor:t?`default`:`pointer`,opacity:t?.45:1}}function Ne(e,t){return{minWidth:Math.max(e.fontSize,Math.ceil(t*e.fontSize*Pe)),padding:`0 3px`,color:`var(--text)`,fontSize:e.fontSize,fontVariantNumeric:`tabular-nums`,textAlign:`center`,userSelect:`none`}}var Pe;function Fe(){return(Fe=e((()=>{Pe=.6})))()}function Ie(e){let{value:t,min:n,max:r,onChange:i,label:a,help:o,hideLabel:s=!1,disabled:c=!1,testId:l,step:u=1,digits:d=0,unit:f=``}=e,{metrics:p}=C();function m(e){let a=Re(t+e*u,n,r);a!==t&&i(a)}function h(e){let t=Be.get(e.key);t===void 0||c||(e.preventDefault(),m(t))}return(0,U.jsx)(v,{label:a,help:o,hideLabel:s,disabled:c,children:(0,U.jsxs)(`span`,{style:je(p),"data-testid":l,children:[(0,U.jsx)(`button`,{type:`button`,style:Me(p,c||t<=n),disabled:c||t<=n,"aria-label":`Decrease ${a}`,onClick:()=>m(-1),onKeyDown:h,children:`−`}),(0,U.jsx)(`span`,{style:Ne(p,Le(e)),"aria-live":`polite`,children:`${T(t,d)}${f}`}),(0,U.jsx)(`button`,{type:`button`,style:Me(p,c||t>=r),disabled:c||t>=r,"aria-label":`Increase ${a}`,onClick:()=>m(1),onKeyDown:h,children:`+`})]})})}function Le(e){let{min:t,max:n,digits:r=0,unit:i=``}=e;return Math.max(T(t,r).length,T(n,r).length)+i.length}function Re(e,t,n){return ae(se(e,ze),t,n)}var U,ze,Be;function Ve(){return(Ve=e((()=>{oe(),ce(),x(),Fe(),w(),U=n(),ze=10,Be=new Map([[`ArrowUp`,1],[`ArrowRight`,1],[`ArrowDown`,-1],[`ArrowLeft`,-1]]),Ie.__docgenInfo={description:`A value the reader nudges up and down.

It is two buttons around a number rather than a field, because over a figure
the reader is not typing a value, they are hunting for the one that makes
the picture read — and on a phone a text field raises a keyboard that covers
the very picture the value is being chosen against. The end of the range is
shown by the button going dead rather than by a value that refuses to move,
so the reader can see where the limit is before pressing into it.
@param props - See {@link OverlayNumberProps}.
@returns The stepper.`,methods:[],displayName:`OverlayNumber`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
already has: \`Colour by\`, \`Group outlines\`, \`Dot size\`.

Required, and deliberately so. A row with no name is a row whose only
identification is the help glyph beside it, which is how a panel ends up
with a column of question marks standing in for its words — and it is the
name that a screen reader is given, that the help hangs off, and that
fills the panel's left column.`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the control does, in a sentence. It hangs off the name, which is
underlined with dots to say so — never off a glyph of its own. A control
floating over a figure has no room to explain itself, and a reader who has
to guess what it does picks nothing at all, so every control should carry
one.
@default undefined — the name is written plainly`},hideLabel:{required:!1,tsType:{name:`boolean`},description:`Whether the name is written or only announced. Hide it for a control whose
own words already say what it is — a button that reads \`Zoom to selection\`
— and never for one whose choices are bare numbers. It is honoured on a
bar alone: in a panel the name is the left column, and an empty cell there
is the ragged panel the grid exists to prevent.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the control is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`number`},description:`The current value.`},min:{required:!0,tsType:{name:`number`},description:`The smallest it may be.`},max:{required:!0,tsType:{name:`number`},description:`The largest it may be.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: number) => void`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`void`}}},description:`Called with the new value, already held inside the range.`},step:{required:!1,tsType:{name:`number`},description:`How much one press, or one arrow key, moves it.
@default 1`},digits:{required:!1,tsType:{name:`number`},description:`Decimals the value is written with, so the control does not resize as the
reader steps through it.
@default 0`},unit:{required:!1,tsType:{name:`string`},description:"Written after the value, e.g. `px`.\n@default '' — no unit is written"}}}})))()}function He(e){let{label:t,value:n,keyWord:r=t,showKey:a=!0,swatches:o}=e,{active:s=!1,disabled:c=!1,disabledReason:l}=e,{opensMenu:u=!1,onClick:d,testId:f}=e,{metrics:p}=C(),{hovered:m,focused:h,handlers:g}=ne(),_=`${t} — ${n}`;return(0,W.jsxs)(`button`,{type:`button`,title:c&&l!==void 0?l:_,"aria-label":_,"aria-haspopup":u?`menu`:void 0,"aria-expanded":u?s:void 0,disabled:c,"data-testid":f,style:ee(p,{hovered:m,focused:h,active:s,disabled:c}),onClick:d,...g,children:[o===void 0||o.length===0?null:(0,W.jsx)(z,{colors:o}),a?(0,W.jsx)(`span`,{style:re(),children:r}):null,(0,W.jsx)(`span`,{style:te(),children:n}),(0,W.jsx)(`span`,{"aria-hidden":`true`,style:b(),children:(0,W.jsx)(i,{icon:`caret-down`,size:Ue(p.fontSize)})})]})}function Ue(e){return e+2}var W;function We(){return(We=e((()=>{r(),H(),w(),ie(),y(),W=n(),He.__docgenInfo={description:`A setting written as its own value, with a caret saying it can be changed.

It does the job of a caption beside a segmented control or a native select
at the cost of no box at all. The reader scans the bar and reads
\`Species\` and \`95%\`, which is how the figure is drawn; the names of the two
settings are one press away and in every announcement.
@param props - See {@link OverlayValueButtonProps}.
@returns The button.`,methods:[],displayName:`OverlayValueButton`,props:{label:{required:!0,tsType:{name:`string`},description:"What the setting is called, in full and phrased as the question the reader\nalready has: `Colour by`, `Group outlines`. It is never the thing written\non the bar — it goes into `title` and `aria-label` with the value after\nit, so a button showing `Species` still announces `Colour by — Species`."},value:{required:!0,tsType:{name:`string`},description:"What the setting is currently on, which is the thing actually written:\n`Species`, `95%`. Write the answer rather than the jargon."},keyWord:{required:!1,tsType:{name:`string`},description:`The one word written in front of the value on a roomy bar.
@default the label, which is right wherever the name is already one word`},showKey:{required:!1,tsType:{name:`boolean`},description:`Whether that key word is written. This is the first thing a narrowing bar
turns off: the name of a setting is read once and its value every time.
@default true`},swatches:{required:!1,tsType:{name:`unknown`},description:`The figure's own colours, drawn as a row of dots in front of the words. A
reader who has just looked at four groups of dots recognises them without
being taught anything, which is worth more than any paint-pot glyph.
@default undefined — no dots are drawn`},active:{required:!1,tsType:{name:`boolean`},description:`Whether the choices behind it are showing.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether it cannot be pressed.
@default false`},disabledReason:{required:!1,tsType:{name:`string`},description:`Why it cannot be pressed, which the pointer is told in place of the name.
A greyed control that does not say why is worse than one that is missing.
@default undefined — the pointer is still told the name and the value`},opensMenu:{required:!1,tsType:{name:`boolean`},description:`Whether pressing it opens a menu, which is what tells a screen reader
there is more behind the words than a press.
@default false`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed. Leave it out inside a popover, which listens on
the wrapper it puts around the button and would otherwise be told twice.
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}function G(e){let{label:t,value:n,options:r,onChange:i,keyWord:a,showKey:o}=e,{swatches:s,disabled:c=!1,disabledReason:l}=e,{placement:u=`bottom-end`,testId:p}=e,{metrics:h}=C(),_=(0,K.useId)(),[v,y]=(0,K.useState)(!1),b=n;for(let e of r)e.value===n&&(b=e.label);return(0,q.jsx)(m,{isOpen:v,disabled:c,placement:u,onInteraction:e=>y(e),content:(0,q.jsxs)(d,{role:`listbox`,"aria-labelledby":_,size:h.blueprintSize,style:Ge,children:[(0,q.jsx)(g,{title:t,titleId:_}),r.map(e=>(0,q.jsx)(f,{roleStructure:`listoption`,selected:e.value===n,text:e.label,htmlTitle:e.title,disabled:e.disabled,onClick:()=>i(e.value)},e.value))]}),children:(0,q.jsx)(He,{label:t,value:b,keyWord:a,showKey:o,swatches:s,active:v,disabled:c,disabledReason:l,testId:p,opensMenu:!0})})}var K,q,Ge;function J(){return(J=e((()=>{l(),h(),u(),p(),K=t(),We(),w(),q=n(),Ge={minWidth:168},G.__docgenInfo={description:`A setting written as its value, whose choices are a menu behind it.

It is what a picker becomes on a bar with no room for captions: the same
choices, in the same order, with the one in force ticked. It takes the very
options the picker takes, so a bar swaps one for the other without reshaping
anything it holds — and unlike the picker it answers the reader's question
before it is opened, because the answer is what is written on it.
@param props - See {@link OverlayValueMenuProps}.
@returns The button and its menu.`,methods:[],displayName:`OverlayValueMenu`,props:{label:{required:!0,tsType:{name:`string`},description:"What the setting is called, in full: `Colour by`, `Group outlines`. It\nnames the button for the pointer and the screen reader, and it is written\nover the menu as its heading — so a reader who opened it on a guess is\ntold what they have opened before they choose."},value:{required:!0,tsType:{name:`TValue`},description:`The current choice, whose own label is what the button writes.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},keyWord:{required:!1,tsType:{name:`string`},description:`The one word written in front of the value on a roomy bar.
@default the label`},showKey:{required:!1,tsType:{name:`boolean`},description:`Whether that key word is written.
@default true`},swatches:{required:!1,tsType:{name:`unknown`},description:`The figure's own colours, drawn as a row of dots in front of the words.
@default undefined — no dots are drawn`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the setting cannot be reached at all.
@default false`},disabledReason:{required:!1,tsType:{name:`string`},description:`Why it cannot be reached, which the pointer is told in place of the name.
@default undefined — the pointer is still told the name and the value`},placement:{required:!1,tsType:{name:`PopoverNextPlacement`},description:`Which way the menu opens. Away from the nearest edge of the figure, so the
choices are not the thing that pushes the reader off the picture.
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"}}}})))()}function Y(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:l}=e,{metrics:u}=C(),d=_(),{appearance:f=d===void 0?`field`:`quiet`}=e;return f===`quiet`?(0,X.jsx)(v,{label:i,help:a,hideLabel:o,disabled:s,children:(0,X.jsx)(G,{label:i,value:t,options:n,onChange:r,showKey:!1,disabled:s,testId:l})}):(0,X.jsx)(v,{label:i,help:a,hideLabel:o,disabled:s,children:(0,X.jsx)(c,{value:t,disabled:s,large:u.blueprintSize===`large`,"aria-label":i,"data-testid":l,onChange:e=>r(e.currentTarget.value),children:n.map(e=>(0,X.jsx)(`option`,{value:e.value,title:e.title,disabled:e.disabled,children:e.label},e.value))})})}var X;function Ke(){return(Ke=e((()=>{s(),x(),J(),S(),w(),X=n(),Y.__docgenInfo={description:`The picker a card reaches for once the choices stop fitting side by side.

The options are written out rather than handed to Blueprint's shorthand,
because a choice that does not apply has to keep its place in the list and
say why the pointer cannot take it — and the shorthand has nowhere to put
that sentence.
@param props - See {@link OverlaySelectProps}.
@returns The caption, its help, and the picker.`,methods:[],displayName:`OverlaySelect`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
already has: \`Colour by\`, \`Group outlines\`, \`Dot size\`.

Required, and deliberately so. A row with no name is a row whose only
identification is the help glyph beside it, which is how a panel ends up
with a column of question marks standing in for its words — and it is the
name that a screen reader is given, that the help hangs off, and that
fills the panel's left column.`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the control does, in a sentence. It hangs off the name, which is
underlined with dots to say so — never off a glyph of its own. A control
floating over a figure has no room to explain itself, and a reader who has
to guess what it does picks nothing at all, so every control should carry
one.
@default undefined — the name is written plainly`},hideLabel:{required:!1,tsType:{name:`boolean`},description:`Whether the name is written or only announced. Hide it for a control whose
own words already say what it is — a button that reads \`Zoom to selection\`
— and never for one whose choices are bare numbers. It is honoured on a
bar alone: in a panel the name is the left column, and an empty cell there
is the ragged panel the grid exists to prevent.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the control is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},appearance:{required:!1,tsType:{name:`union`,raw:`'field' | 'quiet'`,elements:[{name:`literal`,value:`'field'`},{name:`literal`,value:`'quiet'`}]},description:`Whether the picker is drawn as a form field or as a quiet button showing
only its value.

A settings panel gets \`quiet\` on its own, because a bordered field beside
borderless switches and steppers is the one shape in the panel that draws
the eye, and it draws it to whichever setting happens to be a list.
@default 'quiet' inside an OverlayPanel, 'field' anywhere else`}}}})))()}function qe(e){let t=Math.round(e.controlHeight*.75/2)*2,n=Math.round(t*5/3),r=t-4;return{width:n,height:t,knob:r,inset:2,travel:n-r-4}}function Je(e,t,n){return{display:`inline-flex`,alignItems:`center`,minWidth:t.width,height:e.controlHeight,padding:0,border:`none`,background:`transparent`,cursor:n?`default`:`pointer`,opacity:n?.6:1}}function Ye(e,t){return{position:`relative`,display:`inline-block`,width:e.width,height:e.height,borderRadius:999,background:t?`var(--accent)`:`var(--border-strong)`,transition:`background ${Z}ms ease`}}function Xe(e,t){return{position:`absolute`,top:e.inset,left:t?e.inset+e.travel:e.inset,width:e.knob,height:e.knob,borderRadius:`50%`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,transition:`left ${Z}ms ease`}}var Z;function Ze(){return(Ze=e((()=>{Z=150})))()}function Qe(e){let{checked:t,onChange:n,label:r,help:i,hideLabel:o=!1,disabled:s=!1,testId:c,swatch:l,icon:u}=e,{metrics:d}=C(),f=_();if((e.appearance??(f===void 0?`button`:`switch`))===`switch`){let e=qe(d);return(0,Q.jsx)(v,{label:r,help:i,hideLabel:o,disabled:s,children:(0,Q.jsx)(`button`,{type:`button`,"aria-pressed":t,"aria-label":r,disabled:s,"data-testid":c,style:Je(d,e,s),onClick:()=>n(!t),children:(0,Q.jsx)(`span`,{style:Ye(e,t),children:(0,Q.jsx)(`span`,{style:Xe(e,t)})})})})}return(0,Q.jsx)(v,{label:r,help:i,hideLabel:!0,disabled:s,children:(0,Q.jsx)(a,{variant:`minimal`,size:d.blueprintSize,active:t,disabled:s,"aria-pressed":t,"aria-label":r,title:o?r:void 0,icon:l===void 0?u:(0,Q.jsx)(`span`,{style:be(l)}),text:o?void 0:r,"data-testid":c,onClick:()=>n(!t)})})}var Q;function $(){return($=e((()=>{o(),x(),ye(),S(),w(),Ze(),Q=n(),Qe.__docgenInfo={description:`One thing on the figure turned on and off.

On a bar it is a pressed button, because the same control has to work as a
legend entry — a swatch and a series name that dim when the series is hidden
— and a checkbox beside a colour square reads as two separate claims about
one series. In a panel it is a switch, because a row of grey chips is a row
whose state cannot be read: \`One scale for all\` drawn as a chip answers the
reader's only question about it — is it on? — with nothing at all, and the
reader has to click it to find out.

It stays a real \`button\` reporting \`aria-pressed\` in both appearances rather
than becoming a checkbox in one of them, since a control that reports its
state one way on a bar and another in a panel is a control a reader who
cannot see it has to learn twice. A native button is also operated by Space
and by Enter for nothing, where a checkbox built out of a \`div\` has to
reimplement both and usually gets one of them subtly wrong.

A swatch takes the glyph's place when both are given, since the colour is
what ties the entry to a mark on the chart.
@param props - See {@link OverlayToggleProps}.
@returns The toggle.`,methods:[],displayName:`OverlayToggle`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
already has: \`Colour by\`, \`Group outlines\`, \`Dot size\`.

Required, and deliberately so. A row with no name is a row whose only
identification is the help glyph beside it, which is how a panel ends up
with a column of question marks standing in for its words — and it is the
name that a screen reader is given, that the help hangs off, and that
fills the panel's left column.`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the control does, in a sentence. It hangs off the name, which is
underlined with dots to say so — never off a glyph of its own. A control
floating over a figure has no room to explain itself, and a reader who has
to guess what it does picks nothing at all, so every control should carry
one.
@default undefined — the name is written plainly`},hideLabel:{required:!1,tsType:{name:`boolean`},description:`Whether the name is written or only announced. Hide it for a control whose
own words already say what it is — a button that reads \`Zoom to selection\`
— and never for one whose choices are bare numbers. It is honoured on a
bar alone: in a panel the name is the left column, and an empty cell there
is the ragged panel the grid exists to prevent.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the control is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},checked:{required:!0,tsType:{name:`boolean`},description:`Whether it is on.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Called with the new state.`},appearance:{required:!1,tsType:{name:`union`,raw:`'button' | 'switch'`,elements:[{name:`literal`,value:`'button'`},{name:`literal`,value:`'switch'`}]},description:"How it is drawn: a pressed button carrying its own words, or a switch\nbeside a name in a panel's control column.\n@default `'switch'` inside an {@link OverlayPanel}, `'button'` anywhere else"},swatch:{required:!1,tsType:{name:`string`},description:`Colour of the square in front of the caption. Give it the series' own
colour and a row of toggles becomes the figure's legend, each entry
showing and hiding what it names. Drawn by the button appearance alone.
@default undefined — no square is drawn`},icon:{required:!1,tsType:{name:`IconName`},description:`Blueprint glyph in front of the caption, for a toggle short of room. Drawn
by the button appearance alone.
@default undefined`}}}})))()}export{G as a,Ve as c,we as d,Ee as f,Ke as i,z as l,$ as n,J as o,Y as r,Ie as s,Qe as t,H as u};