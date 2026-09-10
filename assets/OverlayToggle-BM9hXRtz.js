import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CsLeyY0n.js";import{n as r,t as i}from"./icon-D5a9FMaM.js";import{n as a,t as o}from"./components-K5snJHcW.js";import{n as s,t as c}from"./htmlSelect-uUIHp2XK.js";import{i as l,n as u,r as d,t as f}from"./menuItem-CirB_kK9.js";import{i as p,r as m}from"./popoverNextMigrationUtils-CX34xXDY.js";import{n as h,t as g}from"./menuDivider-tivaGXHV.js";import{n as _,t as v}from"./HelpTooltip-gs5lCIrW.js";import{_ as y,c as b,d as x,f as ee,g as te,h as ne,l as re,m as ie,o as S,p as ae,u as oe,v as se}from"./ChartFrame-DEpkeZ0N.js";import{n as ce,t as le}from"./HelpIcon-BcbMMgh3.js";import{n as ue,t as de}from"./listNavigation-DtROoc3V.js";import{n as fe,t as pe}from"./useContainerSize-BbGJmEIB.js";function C(){return(0,me.useContext)(he)}var me,he;function w(){return(w=e((()=>{me=t(),he=(0,me.createContext)(void 0)})))()}function ge(e){return{display:`inline-flex`,alignItems:`center`,gap:Math.max(4,e.gap-2),minHeight:e.controlHeight}}function _e(e,t){return{display:`grid`,gridTemplateColumns:`${t}px minmax(0, 1fr)`,alignItems:`center`,columnGap:Math.max(10,e.gap+2),minHeight:e.controlHeight,width:`100%`}}function ve(e){return e.labelSize*8+8}function ye(e,t){let{help:n=!1,disabled:r=!1}=t;return{color:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:500,whiteSpace:`nowrap`,userSelect:`none`,...n?T:void 0,...r?Se:void 0}}function be(e){return{display:`inline-flex`,flexDirection:`column`,alignItems:`flex-start`,gap:2,minHeight:e.controlHeight}}var xe,T,Se;function E(){return(E=e((()=>{xe={display:`flex`,alignItems:`center`,minWidth:0},T={textDecoration:`underline dotted var(--border-strong)`,textUnderlineOffset:3,cursor:`help`},Se={opacity:.6}})))()}function D(e){let{children:t,label:n,help:r,hideLabel:i=!1,disabled:a=!1,testId:o,labelPlacement:s=`inline`}=e,{metrics:c}=b(),l=C(),u=e.layout??(l===void 0?`row`:`grid`),d=(0,Ce.useId)(),f=u===`grid`||!i,p=f?(0,O.jsx)(`span`,{id:u===`grid`?d:void 0,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:ye(c,{help:r!==void 0,disabled:a}),children:n}):null,m=r===void 0?p:(0,O.jsx)(v,{content:r,children:p}),h=r===void 0||f?t:(0,O.jsx)(v,{content:r,children:t});if(u===`grid`){let e=l?.nameWidth??ve(c);return(0,O.jsxs)(`div`,{role:`group`,"aria-labelledby":d,"data-testid":o,style:_e(c,e),children:[m,(0,O.jsx)(`span`,{style:xe,children:h})]})}return s===`above`?(0,O.jsxs)(`div`,{"data-testid":o,style:be(c),children:[m,h]}):(0,O.jsxs)(`div`,{"data-testid":o,style:ge(c),children:[m,h]})}var Ce,O;function k(){return(k=e((()=>{Ce=t(),_(),w(),E(),S(),O=n(),D.__docgenInfo={description:`A name, its help, and the control they belong to.

Every control of this domain is one of these, which is the whole reason a
picker and a stepper standing side by side in a card line up on the same
baseline and answer to the same measurements. A caller writing a control
this package does not have reaches for it too, rather than approximating the
geometry and landing half a pixel out.

The help hangs off the name rather than off a question mark beside it. Five
controls each with a glyph put five question marks in a column down the left
edge of a panel, and the eye reads that column before it reads a single
word; a dotted underline says the same thing and costs nothing. The name is
reachable by tab for the same reason the glyph was, so the explanation is
not reserved to whoever is holding a pointer, and it carries the class
\`help-name\` — the counterpart of the glyph's \`help-icon\` — so that whatever
used to look for the glyph has something to look for. In a panel the name
also names its row out loud, since a name a whole column away from its
control is not associated with it by proximity alone.
@param props - See {@link OverlayRowProps}.
@returns The row.`,methods:[],displayName:`OverlayRow`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},children:{required:!0,tsType:{name:`ReactNode`},description:`The control itself.`},labelPlacement:{required:!1,tsType:{name:`union`,raw:`'inline' | 'above'`,elements:[{name:`literal`,value:`'inline'`},{name:`literal`,value:`'above'`}]},description:`Whether the name sits in front of the control or above it. Above once the
names are long enough to push the card past a third of the figure. Only
consulted on a bar; a panel row is always two columns.
@default 'inline'`},layout:{required:!1,tsType:{name:`union`,raw:`'row' | 'grid'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'grid'`}]},description:"Whether the row is a line on a bar or a cell in a panel's grid.\n@default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else"}}}})))()}function we(e){let{text:t,onClick:n,icon:r,intent:i=`none`,help:o,disabled:s=!1,testId:c}=e,{metrics:l}=b();return(0,Te.jsx)(D,{label:t,help:o,hideLabel:!0,disabled:s,children:(0,Te.jsx)(a,{variant:`minimal`,size:l.blueprintSize,intent:i,icon:r,text:t,disabled:s,"data-testid":c,onClick:n})})}var Te;function Ee(){return(Ee=e((()=>{o(),k(),S(),Te=n(),we.__docgenInfo={description:`The one control here that does something rather than changing something.

It carries no caption of its own because its words already are one — a verb
and its object — and a caption in front of a button that reads \`Zoom to
selection\` says the same thing twice in a card that has room for neither.
@param props - See {@link OverlayActionProps}.
@returns The button, with its help.`,methods:[],displayName:`OverlayAction`,props:{text:{required:!0,tsType:{name:`string`},description:"What the button reads: a verb and its object, `Zoom to selection`."},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed.`},icon:{required:!1,tsType:{name:`IconName`},description:`A glyph before the text. Never instead of it: an icon-only control in a
floating card is a control nobody presses.
@default undefined`},intent:{required:!1,tsType:{name:`Intent`},description:`What the button means, which is not whether it is pressed.
@default 'none'`}},composes:[`Omit`]}})))()}function De(e){return{width:1,alignSelf:`stretch`,minHeight:e.controlHeight-8,background:`var(--border)`,margin:`0 ${Math.max(2,e.gap-4)}px`}}function Oe(e){return{display:`inline-block`,width:10,height:10,borderRadius:2,background:e,boxShadow:`inset 0 0 0 1px var(--border)`}}function ke(e,t){return{display:`inline-flex`,flexDirection:t,flexWrap:`nowrap`,alignItems:t===`row`?`center`:`flex-start`,gap:e.gap}}function Ae(e){return{display:`inline-flex`,alignItems:`center`,gap:4,color:`var(--text-faint)`,fontSize:Math.max(9,e.labelSize-2),fontWeight:600,letterSpacing:`0.06em`,textTransform:`uppercase`,whiteSpace:`nowrap`}}function je(e,t){let{hovered:n=!1,active:r=!1,disabled:i=!1}=t,a=!i&&(n||r);return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:2,minWidth:e.buttonSize,height:e.buttonSize,padding:`0 ${Ne}px`,border:`none`,borderRadius:e.controlRadius+1,background:a?`var(--surface-sunken)`:`transparent`,color:Me(r&&!i,a),font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:i?`default`:`pointer`,opacity:i?.6:1}}function Me(e,t){return e?`var(--text)`:t?`var(--text-muted)`:`var(--text-faint)`}var Ne;function A(){return(A=e((()=>{Ne=2})))()}function Pe(e){let{icon:t,label:n,value:r,active:a=!1,disabled:o=!1}=e,{disabledReason:s,opensMenu:c=!1,onClick:l,testId:u}=e,{metrics:d}=b(),[f,p]=(0,Ie.useState)(!1),m=r===void 0?n:`${n} — ${r}`;return(0,Le.jsx)(`button`,{type:`button`,title:o&&s!==void 0?s:m,"aria-label":m,"aria-haspopup":c?`menu`:void 0,"aria-expanded":c?a:void 0,"aria-pressed":c?void 0:a,disabled:o,"data-testid":u,style:je(d,{hovered:f,active:a,disabled:o}),onClick:l,onPointerEnter:()=>p(!0),onPointerLeave:()=>p(!1),onFocus:()=>p(!0),onBlur:()=>p(!1),children:typeof t==`string`?(0,Le.jsx)(i,{icon:t,size:Fe(d.buttonSize)}):t})}function Fe(e){return Math.max(12,Math.round(e*.55))}var Ie,Le;function Re(){return(Re=e((()=>{r(),Ie=t(),A(),S(),Le=n(),Pe.__docgenInfo={description:`One setting reduced to its glyph.

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
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}function ze(e){let{children:t,placement:n,label:r,icon:i,padded:a=!0}=e,{metrics:o}=b(),[s,c]=(0,Be.useState)(!1);return(0,j.jsx)(m,{placement:Ve[n],onInteraction:e=>c(e),content:a?(0,j.jsx)(`div`,{style:y(o),children:t}):(0,j.jsx)(j.Fragment,{children:t}),children:(0,j.jsx)(Pe,{icon:i,label:r,active:s,opensMenu:!0})})}var Be,j,Ve;function He(){return(He=e((()=>{p(),Be=t(),Re(),x(),S(),j=n(),Ve={"top-left":`bottom-start`,"top-right":`bottom-end`,"bottom-left":`top-start`,"bottom-right":`top-end`,above:`bottom-end`,below:`top-end`,stretch:`bottom-end`},ze.__docgenInfo={description:`The button at the end of a bar, and the panel behind it.

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
@default true`}}}})))()}function Ue(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d,restingOpacity:f}=e,{metrics:p,awake:m,busy:h}=b(),g=u||a!==void 0?(0,M.jsxs)(ze,{placement:o,label:s,icon:c,padded:l,children:[u?t:null,a]}):null;return(0,M.jsxs)(`div`,{style:ie(o,p),"data-testid":d,children:[(0,M.jsx)(`div`,{style:te(m?1:se(f),h)}),u?(0,M.jsx)(`div`,{style:ne(p),children:g}):(0,M.jsxs)(`div`,{role:`group`,"aria-label":s,style:ne(p),children:[t,n,r,i,g]})]})}var M;function We(){return(We=e((()=>{He(),x(),S(),M=n(),Ue.__docgenInfo={description:`The small card of controls floating in a corner of a figure.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"},restingOpacity:{required:!0,tsType:{name:`number`},description:`How opaque the ground is while nothing is pointing at the figure.`}}}})))()}function Ge(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d}=e,{metrics:f}=b(),p=a!==void 0||u&&n!==void 0;return(0,N.jsxs)(`div`,{style:ie(o,f),"data-testid":d,children:[(0,N.jsx)(`div`,{style:re}),(0,N.jsxs)(`div`,{style:ee(f),children:[(0,N.jsx)(`div`,{style:ae(f),children:t}),(0,N.jsxs)(`div`,{role:`group`,"aria-label":s,style:ae(f),children:[u?null:n,r,i,p?(0,N.jsxs)(ze,{placement:o,label:s,icon:c,padded:l,children:[u?n:null,a]}):null]})]})]})}var N;function Ke(){return(Ke=e((()=>{He(),x(),S(),N=n(),Ge.__docgenInfo={description:`The bar that spans the width of the figure, its two ends pushed apart.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"}}}})))()}function qe(e,t){return!Number.isFinite(e)||e<=0||!Number.isFinite(t)?!1:e<t}function Je(e){let{collapsed:t,startedFolded:n,width:r,collapseBelow:i}=e;return t??(n||qe(r,i))}function Ye(e,t){let n=(0,P.useRef)(t),r=(0,P.useRef)(e);(0,P.useEffect)(()=>{n.current=t}),(0,P.useEffect)(()=>{r.current!==e&&(r.current=e,n.current?.(e))},[e])}var P;function Xe(){return(Xe=e((()=>{P=t()})))()}function Ze(e){let{children:t,end:n,tools:r,info:i,more:a}=e,{placement:o=`top-right`}=e,{label:s=`Options`,restingOpacity:c=oe}=e,{collapsed:l,defaultCollapsed:u=!1,onCollapsedChange:d}=e,{collapseBelow:f=420,moreIcon:p=`cog`,testId:m}=e,{morePadded:h=!0}=e,{width:g}=b(),[_]=(0,Qe.useState)(u),v=Je({collapsed:l,startedFolded:_,width:g,collapseBelow:f});return Ye(v,l===void 0?d:void 0),o===`stretch`?(0,$e.jsx)(Ge,{end:n,tools:r,info:i,more:a,placement:o,label:s,moreIcon:p,morePadded:h,folded:v,testId:m,children:t}):(0,$e.jsx)(Ue,{end:n,tools:r,info:i,more:a,placement:o,label:s,moreIcon:p,morePadded:h,folded:v,restingOpacity:c,testId:m,children:t})}var Qe,$e;function et(){return(et=e((()=>{Qe=t(),We(),Ke(),Xe(),x(),S(),$e=n(),Ze.__docgenInfo={description:`The controls of a figure: a small card floating in one of its corners, or
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
@default 0.74`},collapsed:{required:!1,tsType:{name:`boolean`},description:`Whether the bar is reduced to a button opening the same controls in a
popover. Left out, it folds on its own once the figure is narrower than
\`collapseBelow\`.
@default undefined — the bar decides from the figure's width`},defaultCollapsed:{required:!1,tsType:{name:`boolean`},description:`Whether it starts folded, for a bar the reader may open and close.
@default false`},onCollapsedChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(collapsed: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`collapsed`}],return:{name:`void`}}},description:`Called when the reader opens or closes it.
@default undefined`},collapseBelow:{required:!1,tsType:{name:`number`},description:`Figure width, in pixels, under which the bar folds on its own.
@default 420`},moreIcon:{required:!1,tsType:{name:`IconName`},description:`Blueprint glyph of the button that opens the rest. A cog rather than an
ellipsis, because once the bar folds that button holds every control and
not only the second tier.
@default 'cog'`},morePadded:{required:!1,tsType:{name:`boolean`},description:`Whether what opens behind that button is drawn with the card's own padding
around it. Turn it off when \`more\` is an {@link OverlayPanel}, which
brings its own: nested inside a padded surface a panel's header rule stops
short of both edges and reads as a mis-drawn line rather than as a header.
@default true`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card, for the end-to-end tests.\n@default undefined"}}}})))()}function tt(e,t){return{display:`block`,maxWidth:`100%`,padding:`${e.paddingY}px ${e.paddingX}px`,color:t===`strong`?`var(--text)`:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:t===`strong`?600:400,lineHeight:1.35,textWrap:`pretty`}}function nt(e){return{position:`relative`,display:`flex`,flexDirection:`column`,gap:Math.max(2,e.gap-4),padding:`${e.paddingY}px ${e.paddingX}px`,color:`var(--text)`,fontSize:e.labelSize,lineHeight:1.3}}function rt(e){return{marginBottom:2,color:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:600,whiteSpace:`nowrap`}}function it(e){return{position:`absolute`,zIndex:2,display:`flex`,flexDirection:`column`,gap:2,maxWidth:280,padding:`${e.paddingY}px ${e.paddingX}px`,borderRadius:`var(--radius)`,border:`1px solid var(--border)`,background:`var(--surface)`,boxShadow:`var(--shadow-md)`,color:`var(--text)`,fontSize:e.labelSize,lineHeight:1.35,pointerEvents:`none`}}var at;function F(){return(F=e((()=>{at={display:`inline-flex`,alignItems:`center`,gap:6,border:`none`,background:`none`,color:`inherit`,font:`inherit`,padding:0,textAlign:`left`}})))()}function ot(e){let{children:t,placement:n=`over`,edge:r=`bottom`}=e,{tone:i=`quiet`,live:a=!1}=e,{metrics:o}=b();return(0,ct.jsx)(`div`,{style:n===`below`?dt:st(r,o),children:(0,ct.jsx)(`span`,{style:tt(o,i),"aria-live":a?`polite`:void 0,"aria-atomic":a?!0:void 0,children:t})})}function st(e,t){return{position:`absolute`,left:0,right:0,top:e===`top`?0:void 0,bottom:e===`bottom`?0:void 0,display:`flex`,alignItems:`center`,padding:`${t.paddingY}px ${t.inset}px`,background:`linear-gradient(to ${e===`bottom`?`top`:`bottom`}, ${lt}, ${lt} 45%, ${ut})`,pointerEvents:`none`}}var ct,lt,ut,dt;function ft(){return(ft=e((()=>{F(),S(),ct=n(),lt=`color-mix(in srgb, var(--surface) 86%, transparent)`,ut=`color-mix(in srgb, var(--surface) 0%, transparent)`,dt={display:`flex`,alignItems:`center`},ot.__docgenInfo={description:`The band across a figure that says, in one sentence, what it is showing.

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
@default false`}}}})))()}function pt(e){let{colors:t}=e,{metrics:n}=b(),r=t.length>_t?_t-1:t.length,i=t.length-r,a=gt(n),o=[];for(let e=0;e<r;e++){let n=t[e];n!==void 0&&o.push((0,I.jsx)(`span`,{style:mt(n,a)},`${e}:${n}`))}return(0,I.jsxs)(`span`,{"aria-hidden":`true`,style:vt,children:[o,i>0?(0,I.jsx)(`span`,{style:ht(n),children:`+${i}`}):null]})}function mt(e,t){return{display:`inline-block`,width:t,height:t,borderRadius:`50%`,background:e,boxShadow:t>=6?`inset 0 0 0 1px var(--border)`:void 0}}function ht(e){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:600,lineHeight:1}}function gt(e){return Math.max(4,Math.round(e.buttonSize/6))}var I,_t,vt;function L(){return(L=e((()=>{S(),I=n(),_t=4,vt={display:`inline-flex`,alignItems:`center`,gap:2},pt.__docgenInfo={description:`The colours of a figure, as the glyph of the control that changes them.

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
reader recognises the plot in it without being taught anything.`}}}})))()}function yt(e,t){let{hovered:n=!1,focused:r=!1,active:i=!1}=t,{disabled:a=!1}=t,o=!a&&(n||i);return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:R,minWidth:e.buttonSize,height:e.controlHeight,padding:`0 ${e.paddingX}px`,border:`none`,borderRadius:e.controlRadius+1,background:o?`var(--surface-sunken)`:`transparent`,color:`var(--text)`,font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:a?`default`:`pointer`,opacity:a?.6:1,...Tt(r&&!a)}}function bt(e,t){let{hovered:n=!1,focused:r=!1,active:i=!1}=t,{disabled:a=!1}=t,o=!a&&(n||i);return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:R,minWidth:e.buttonSize,height:e.controlHeight,padding:`0 ${e.paddingX+2}px`,border:`none`,borderRadius:e.controlHeight/2,background:`var(--surface-sunken)`,color:`var(--text)`,boxShadow:o?`inset 0 0 0 1px var(--border)`:void 0,font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:a?`default`:`pointer`,opacity:a?.6:1,...Tt(r&&!a)}}function xt(){return{color:`var(--text)`,fontWeight:600}}function St(){return{color:`var(--text-muted)`,fontWeight:500}}function Ct(e){return{width:1,height:Math.max(10,e.controlHeight-14),background:`var(--border)`,margin:`0 ${R}px`}}function wt(){return{display:`inline-flex`,color:`var(--text-faint)`}}function Tt(e){return e?{outline:`2px solid var(--accent, var(--text))`,outlineOffset:1}:{}}var R;function Et(){return(Et=e((()=>{R=4})))()}function Dt(e){let{label:t,settings:n,children:r,disabled:a=!1}=e,{placement:o=`bottom-end`,testId:s}=e,{metrics:c}=b(),l=(0,z.useId)(),[u,d]=(0,z.useState)(!1),[f,p]=(0,z.useState)(!1),[h,g]=(0,z.useState)(!1),_=kt(n),v=Ot(n);return(0,B.jsx)(m,{isOpen:u,disabled:a,placement:o,onInteraction:e=>d(e),content:(0,B.jsxs)(`div`,{role:`group`,"aria-labelledby":l,style:y(c),children:[(0,B.jsx)(`span`,{id:l,style:Ae(c),children:t}),r]}),children:(0,B.jsxs)(`button`,{type:`button`,title:v,"aria-label":v,"aria-haspopup":`menu`,"aria-expanded":u,disabled:a,"data-testid":s,style:bt(c,{hovered:f,focused:h,active:u,disabled:a}),onPointerEnter:()=>p(!0),onPointerLeave:()=>p(!1),onFocus:()=>g(!0),onBlur:()=>g(!1),children:[_===void 0?null:(0,B.jsx)(pt,{colors:_}),n.map((e,t)=>(0,B.jsxs)(z.Fragment,{children:[t===0?null:(0,B.jsx)(`span`,{"aria-hidden":`true`,style:Ct(c)}),(0,B.jsx)(`span`,{style:xt(),children:e.value})]},e.label)),(0,B.jsx)(`span`,{"aria-hidden":`true`,style:wt(),children:(0,B.jsx)(i,{icon:`caret-down`,size:c.fontSize+2})})]})})}function Ot(e){let t=``;for(let n of e)t!==``&&(t+=`, `),t+=`${n.label} — ${n.value}`;return t}function kt(e){for(let t of e){let{swatches:e}=t;if(e!==void 0&&e.length>0)return e}}var z,B;function At(){return(At=e((()=>{r(),p(),z=t(),L(),A(),x(),S(),Et(),B=n(),Dt.__docgenInfo={description:`Several settings gathered into one rounded chip that still reads them out.

This is what a narrow bar folds its settings into, and the whole argument
for it is that it is not a cog. A cog says only that there are settings; a
reader looking at a scatter of coloured dots on a phone wants to know what
the colours mean and how wide the outlines are drawn, and \`Species · 95%\`
answers both without being opened. What the fold actually buys is one
button's padding and one caret per setting swallowed — which is why the
words survive it and only the boxes around them go.
@param props - See {@link OverlayChipProps}.
@returns The chip and its panel.`,methods:[],displayName:`OverlayChip`,props:{label:{required:!0,tsType:{name:`string`},description:`What the settings are called together, written over the panel it opens.`},settings:{required:!0,tsType:{name:`unknown`},description:`The settings it reads out, in the order they are written.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The controls behind it, each with its own caption — the same controls the
bar holds when it has room for them, rather than a reduced set.`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether none of the settings can be reached.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextPlacement`},description:`Which way the panel opens.
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the chip.\n@default undefined"}}}})))()}function jt(e){return{display:`flex`,flexDirection:`column`,minWidth:Bt,color:`var(--text)`,fontSize:e.fontSize,lineHeight:1.2}}function Mt(e){return{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:e.gap,padding:`${e.gap+5}px ${e.gap+8}px ${e.gap+4}px`,borderBottom:`1px solid var(--border)`}}function Nt(e){return{display:`inline-flex`,alignItems:`center`,gap:4,minWidth:0,color:`var(--text)`,fontSize:e.fontSize,fontWeight:600,whiteSpace:`nowrap`}}function Pt(e,t){return{flex:`none`,padding:0,border:`none`,background:`transparent`,color:t?`var(--accent)`:`var(--text-faint)`,font:`inherit`,fontSize:Math.max(10,e.labelSize+1),lineHeight:1,textDecoration:t?`underline`:`none`,cursor:`pointer`}}function Ft(e){return{display:`flex`,flexDirection:`column`,rowGap:e.gap+3,padding:`${e.gap+4}px ${e.gap+8}px ${e.gap+7}px`}}function It(e){return{margin:0,paddingTop:e.paddingY,color:`var(--text-faint)`,fontSize:Math.max(10,e.labelSize),lineHeight:1.45}}function Lt(e){return{display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:e.gap,padding:`${e.gap+4}px ${e.gap+8}px ${e.gap+5}px`,borderTop:`1px solid var(--border)`}}function Rt(e){return{display:`flex`,flexDirection:`column`,rowGap:e.gap+3}}function zt(e,t){let{divider:n=!0,help:r=!1}=t;return{display:`inline-flex`,alignItems:`center`,gap:4,marginTop:n?e.paddingY:0,paddingTop:n?e.gap+5:0,borderTop:n?`1px solid var(--border)`:void 0,color:`var(--text-faint)`,fontSize:Math.max(10,e.labelSize-1),fontWeight:700,letterSpacing:`0.07em`,textTransform:`uppercase`,whiteSpace:`nowrap`,...r?T:void 0}}var Bt;function Vt(){return(Vt=e((()=>{E(),Bt=208})))()}function Ht(e){let{children:t,label:n,help:r,divider:i=!0,direction:a=`row`}=e,{metrics:o}=b(),s=C(),c=(0,Wt.useId)();if(s!==void 0)return n===void 0?(0,V.jsx)(`div`,{style:Rt(o),children:t}):(0,V.jsxs)(`div`,{role:`group`,"aria-labelledby":c,style:Rt(o),children:[(0,V.jsx)(Ut,{help:r,children:(0,V.jsx)(`span`,{id:c,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:zt(o,{divider:i,help:r!==void 0}),children:n})}),t]});let l=(0,V.jsx)(`div`,{style:ke(o,a),children:t});return n===void 0?l:(0,V.jsxs)(`div`,{role:`group`,"aria-labelledby":c,style:be(o),children:[(0,V.jsx)(Ut,{help:r,children:(0,V.jsx)(`span`,{id:c,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:r===void 0?Ae(o):{...Ae(o),...T},children:n})}),l]})}function Ut(e){let{help:t,children:n}=e;return t===void 0?(0,V.jsx)(V.Fragment,{children:n}):(0,V.jsx)(v,{content:t,children:n})}var Wt,V;function Gt(){return(Gt=e((()=>{Wt=t(),_(),A(),w(),Vt(),E(),S(),V=n(),Ht.__docgenInfo={description:`Controls that answer one question, kept together.

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
@default 'row'`}}}})))()}function Kt(e){let{children:t,label:n=`What am I looking at?`}=e,{placement:r=`bottom-end`,testId:i}=e,{metrics:a}=b(),[o,s]=(0,Jt.useState)(!1);return(0,H.jsx)(m,{placement:r,onInteraction:e=>s(e),content:(0,H.jsx)(`div`,{style:qt(a),children:t}),children:(0,H.jsx)(Pe,{icon:`help`,label:n,active:o,testId:i,opensMenu:!0})})}function qt(e){return{maxWidth:320,padding:`${e.paddingY+4}px ${e.paddingX+4}px`,color:`var(--text)`,fontSize:e.labelSize+1,lineHeight:1.4,textWrap:`pretty`}}var Jt,H;function Yt(){return(Yt=e((()=>{p(),Jt=t(),Re(),S(),H=n(),Kt.__docgenInfo={description:`The question mark that hands the figure's own explanation back on request.

A figure embedded in somebody else's page cannot spend three lines of that
page standing a paragraph under itself, and a paragraph deleted for room is
a reader left to guess what they are looking at. So the sentence is kept and
the vertical space is not: it waits behind one glyph in the bar, where a
reader who wants it can open it and everybody else never pays for it.

The glyph is the domain's own icon button, the same one the cog beside it
is, so the two read as a pair of marks on the bar rather than as two
buttons from different families that happen to sit next to each other.
@param props - See {@link OverlayInfoProps}.
@returns The glyph and its explanation.`,methods:[],displayName:`OverlayInfo`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The explanation, in the reader's own words: what a mark is before what an
axis is, one short paragraph rather than a manual.`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader. Phrase
it as the question the reader has, not as the name of a feature.
@default 'What am I looking at?'`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Which side the explanation opens on.
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"}}}})))()}function Xt(e){return e===`dot`||e===`square`}var Zt;function Qt(){return(Qt=e((()=>{Zt=[`dot`,`ring`,`square`,`line`,`dashed`,`cross`]})))()}function $t(e){let{color:t,shape:n=`dot`,size:r=12,muted:i=!1}=e,a=Xt(n);return(0,U.jsx)(`svg`,{width:r,height:r,viewBox:`0 0 12 12`,"aria-hidden":`true`,focusable:`false`,style:{display:`block`,flex:`none`,opacity:i?tn:1},children:(0,U.jsx)(`g`,{fill:a?t:`none`,stroke:a?`none`:t,strokeLinecap:`round`,children:en[n]})})}var U,en,tn;function nn(){return(nn=e((()=>{Qt(),U=n(),en={dot:(0,U.jsx)(`circle`,{cx:`6`,cy:`6`,r:`4.2`}),ring:(0,U.jsx)(`circle`,{cx:`6`,cy:`6`,r:`3.4`,strokeWidth:`2.2`}),square:(0,U.jsx)(`rect`,{x:`2`,y:`2`,width:`8`,height:`8`,rx:`1.5`}),line:(0,U.jsx)(`line`,{x1:`0.5`,y1:`6`,x2:`11.5`,y2:`6`,strokeWidth:`2.8`}),dashed:(0,U.jsx)(`line`,{x1:`0.5`,y1:`6`,x2:`11.5`,y2:`6`,strokeWidth:`2.8`,strokeDasharray:`3.4 2.6`}),cross:(0,U.jsx)(`path`,{d:`M2.2 2.2 L9.8 9.8 M9.8 2.2 L2.2 9.8`,strokeWidth:`2.4`})},tn=.35,$t.__docgenInfo={description:`The small picture of a mark, in front of what the mark means.

The strokes are heavier than the geometry would suggest: a hairline rule
beside a filled dot of the same width reads as a paler colour rather than as
a different shape, and a reader comparing the two then believes the series
is drawn in two colours. It carries no label of its own — the entry beside it
is the label — so a screen reader is told to skip it rather than to announce
an image with no name.
@param props - See {@link OverlayLegendMarkProps}.
@returns The mark.`,methods:[],displayName:`OverlayLegendMark`,props:{color:{required:!0,tsType:{name:`string`},description:`The colour the mark carries on the figure.`},shape:{required:!1,tsType:{name:`union`,raw:`'dot' | 'ring' | 'square' | 'line' | 'dashed' | 'cross'`,elements:[{name:`literal`,value:`'dot'`},{name:`literal`,value:`'ring'`},{name:`literal`,value:`'square'`},{name:`literal`,value:`'line'`},{name:`literal`,value:`'dashed'`},{name:`literal`,value:`'cross'`}]},description:`Which mark it is.
@default 'dot'`},size:{required:!1,tsType:{name:`number`},description:`Side of the square the mark is drawn in, in pixels.
@default 12`},muted:{required:!1,tsType:{name:`boolean`},description:`Whether it is drawn faint, which is what a switched-off entry looks like.
@default false`}}}})))()}function rn(e){let{title:t,entries:n,placement:r=`bottom-left`,onToggle:i,maxEntries:a=8,testId:o}=e,{metrics:s,awake:c,busy:l}=b(),u=(0,cn.useId)(),d=Math.max(1,a),f=n.length>d?n.length-(d-1):0,p=f===0?n:n.slice(0,d-1);return(0,W.jsxs)(`div`,{style:ie(r,s),"data-figure":`legend`,"data-testid":o,children:[(0,W.jsx)(`div`,{style:te(c?1:ln,l)}),(0,W.jsxs)(`div`,{role:`group`,"aria-labelledby":u,style:nt(s),children:[(0,W.jsx)(`div`,{id:u,style:rt(s),children:t}),p.map(e=>(0,W.jsx)(an,{entry:e,onToggle:i},e.id)),f===0?null:(0,W.jsx)(`span`,{style:sn(s),children:`+ ${f} more`})]})]})}function an(e){let{entry:t,onToggle:n}=e,r=t.muted??!1,i={...at,alignItems:t.note===void 0?`center`:`flex-start`},a=(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)($t,{color:t.color,shape:t.shape,muted:r}),(0,W.jsxs)(`span`,{style:un,children:[(0,W.jsx)(`span`,{style:r?fn:dn,children:on(t)}),t.note===void 0?null:(0,W.jsx)(`span`,{style:pn,children:t.note})]})]});return n===void 0?(0,W.jsx)(`span`,{style:i,children:a}):(0,W.jsx)(`button`,{type:`button`,"aria-pressed":!r,style:{...i,cursor:`pointer`},onClick:()=>{n(t.id)},children:a})}function on(e){return e.count===void 0?e.label:`${e.label} (${e.count.toLocaleString()})`}function sn(e){return{color:`var(--text-muted)`,paddingLeft:e.gap+12}}var cn,W,ln,un,dn,fn,pn;function mn(){return(mn=e((()=>{cn=t(),nn(),F(),x(),S(),W=n(),ln=.74,un={display:`inline-flex`,flexDirection:`column`,gap:1,minWidth:0},dn={color:`var(--text)`},fn={color:`var(--text-faint)`,textDecoration:`line-through`},pn={color:`var(--text-faint)`,fontSize:`0.9em`},rn.__docgenInfo={description:`The card that says what colour and shape mean on a figure.
@param props - See {@link OverlayLegendProps}.
@returns The legend.`,methods:[],displayName:`OverlayLegend`,props:{title:{required:!0,tsType:{name:`string`},description:"The sentence over the entries, naming what the colour means on this\nfigure: `Colour = species`, `Colour = component`. It has no default on\npurpose — a legend that does not name its encoding is how a reader carries\nthe wrong meaning from one tab to the next."},entries:{required:!0,tsType:{name:`unknown`},description:`The entries, in the order they are drawn.`},placement:{required:!1,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where it sits.
@default 'bottom-left'`},onToggle:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:`Called with an entry's id when it is pressed, which is what makes the
legend a filter. Left out, the entries are text rather than buttons.
@default undefined`},maxEntries:{required:!1,tsType:{name:`number`},description:"The most entries written before the rest fold into `+ 7 more`.\n@default 8"},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card.\n@default undefined"}}}})))()}function hn(e){return{display:`inline-flex`,alignItems:`center`,gap:0,height:e.controlHeight,padding:2,borderRadius:e.controlRadius,background:`var(--surface-sunken)`}}function gn(e,t){let n=e.controlHeight-4;return{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:n,height:n,padding:0,border:`none`,borderRadius:Math.max(3,e.controlRadius-2),background:`transparent`,color:t?`var(--text-faint)`:`var(--text-muted)`,font:`inherit`,fontSize:e.fontSize+1,lineHeight:1,cursor:t?`default`:`pointer`,opacity:t?.45:1}}function _n(e,t){return{minWidth:Math.max(e.fontSize,Math.ceil(t*e.fontSize*vn)),padding:`0 3px`,color:`var(--text)`,fontSize:e.fontSize,fontVariantNumeric:`tabular-nums`,textAlign:`center`,userSelect:`none`}}var vn;function yn(){return(yn=e((()=>{vn=.6})))()}function bn(e){let{value:t,min:n,max:r,onChange:i,label:a,help:o,hideLabel:s=!1,disabled:c=!1,testId:l,step:u=1,digits:d=0,unit:f=``}=e,{metrics:p}=b();function m(e){let a=Sn(t+e*u,n,r);a!==t&&i(a)}function h(e){let t=wn.get(e.key);t===void 0||c||(e.preventDefault(),m(t))}return(0,G.jsx)(D,{label:a,help:o,hideLabel:s,disabled:c,children:(0,G.jsxs)(`span`,{style:hn(p),"data-testid":l,children:[(0,G.jsx)(`button`,{type:`button`,style:gn(p,c||t<=n),disabled:c||t<=n,"aria-label":`Decrease ${a}`,onClick:()=>m(-1),onKeyDown:h,children:`−`}),(0,G.jsx)(`span`,{style:_n(p,xn(e)),"aria-live":`polite`,children:`${t.toFixed(d)}${f}`}),(0,G.jsx)(`button`,{type:`button`,style:gn(p,c||t>=r),disabled:c||t>=r,"aria-label":`Increase ${a}`,onClick:()=>m(1),onKeyDown:h,children:`+`})]})})}function xn(e){let{min:t,max:n,digits:r=0,unit:i=``}=e;return Math.max(t.toFixed(r).length,n.toFixed(r).length)+i.length}function Sn(e,t,n){let r=Math.round(e*Cn)/Cn;return r<t?t:r>n?n:r}var G,Cn,wn;function Tn(){return(Tn=e((()=>{k(),yn(),S(),G=n(),Cn=1e10,wn=new Map([[`ArrowUp`,1],[`ArrowRight`,1],[`ArrowDown`,-1],[`ArrowLeft`,-1]]),bn.__docgenInfo={description:`A value the reader nudges up and down.

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
@default 0`},unit:{required:!1,tsType:{name:`string`},description:"Written after the value, e.g. `px`.\n@default '' — no unit is written"}}}})))()}function En(e){let{title:t,children:n,onReset:r,resetLabel:i=`Reset`,help:a}=e,{actions:o,hint:s=Dn,nameWidth:c,testId:l}=e,{metrics:u}=b(),d=(0,K.useId)(),[f,p]=(0,K.useState)(!1),m=c??ve(u),h=(0,K.useMemo)(()=>({nameWidth:m}),[m]);return(0,q.jsxs)(`div`,{role:`group`,"aria-labelledby":d,"data-testid":l,style:jt(u),children:[(0,q.jsxs)(`div`,{style:Mt(u),children:[(0,q.jsxs)(`span`,{style:Nt(u),children:[(0,q.jsx)(`span`,{id:d,children:t}),a===void 0?null:(0,q.jsx)(le,{content:a,size:u.fontSize})]}),r===void 0?null:(0,q.jsx)(`button`,{type:`button`,style:Pt(u,f),onClick:r,onPointerEnter:()=>p(!0),onPointerLeave:()=>p(!1),onFocus:()=>p(!0),onBlur:()=>p(!1),children:i})]}),(0,q.jsxs)(`div`,{style:Ft(u),children:[(0,q.jsx)(he.Provider,{value:h,children:n}),s===``?null:(0,q.jsx)(`p`,{style:It(u),children:s})]}),o===void 0?null:(0,q.jsx)(`div`,{style:Lt(u),children:o})]})}var K,q,Dn;function On(){return(On=e((()=>{K=t(),ce(),w(),Vt(),E(),S(),q=n(),Dn=`Hover a name for what it does.`,En.__docgenInfo={description:`The settings behind a figure's cog.

The four panels of a viewer cannot be allowed to drift apart, so the parts
that are the same in all of them — the title, the way back, the grid the
rows sit in, the sentence teaching the help convention, the commands kept
out of the settings — are settled once here rather than assembled per
figure. What a panel is handed is its rows; everything around them it draws
itself.

It brings its own padding, so it belongs in a popover or a card that has
none. Nested inside a padded surface its header rule stops short of both
edges, which reads as a mis-drawn line rather than as a header.
@param props - See {@link OverlayPanelProps}.
@returns The panel.`,methods:[],displayName:`OverlayPanel`,props:{title:{required:!0,tsType:{name:`string`},description:"Which figure these settings belong to: `Map`, `What differs`. A viewer\nshows four figures behind one cog, and a panel that never names itself\nleaves the reader guessing which of them they are about to change."},children:{required:!0,tsType:{name:`ReactNode`},description:`The rows and sections, each an {@link OverlayRow} or an {@link OverlayGroup}.`},onReset:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the reader asks for the settings the figure came with. There
has to be a way back from a configuration nobody understands any more.
@default undefined — no way back is offered`},resetLabel:{required:!1,tsType:{name:`string`},description:`What that way back reads.
@default 'Reset'`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the whole figure is, in a sentence, behind a question mark beside the
title. This is the one glyph the domain still allows, because the figure
has no name of its own in the panel to hang its explanation off — every
control below does, and none of them may have one.
@default undefined`},actions:{required:!1,tsType:{name:`ReactNode`},description:`What the figure can be *told to do*, drawn at the foot under a hairline —
\`Clear selection\`, \`Zoom to selection\`, each an {@link OverlayAction}.

Commands are not settings and must never be given a row. A row says what
the figure currently is; a command changes it once and leaves nothing
behind, and a reader running down a column of settings takes anything in
that column for one — which is how \`Clear selection\` gets pressed by
somebody who was only reading.
@default undefined — no footer is drawn`},hint:{required:!1,tsType:{name:`string`},description:`The line at the foot of the body that teaches the convention. Nothing in
the panel says that the dotted names are offering anything, so one
sentence says it once. Pass \`''\` for a panel whose names carry no help at
all, where the line would be a promise the panel does not keep.
@default 'Hover a name for what it does.'`},nameWidth:{required:!1,tsType:{name:`number`},description:`Width of the name column, in pixels. Widen it here rather than per row,
for a panel whose names are longer than eight characters.
@default derived from the type size — 88 at the compact size`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the panel.\n@default undefined"}}}})))()}function kn(e,t){de({key:An[e.key]??e.key,target:e.target,preventDefault:()=>e.preventDefault()},t)}var An;function jn(){return(jn=e((()=>{ue(),An={ArrowLeft:`ArrowUp`,ArrowRight:`ArrowDown`}})))()}function Mn(e,t=`strip`){return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:Rn,height:Fn(e,t),padding:J,borderRadius:In(e),background:`var(--surface-sunken)`}}function Nn(e,t){let{selected:n,disabled:r=!1,size:i=`strip`}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:4,height:Fn(e,i)-J*2,padding:`0 ${Ln(e,i)}px`,border:`none`,borderRadius:In(e)-J,background:n?`var(--surface)`:`transparent`,color:n?`var(--text)`:`var(--text-muted)`,boxShadow:n?`var(--shadow-sm)`:void 0,font:`inherit`,fontSize:e.fontSize,fontWeight:n?600:500,lineHeight:1,whiteSpace:`nowrap`,cursor:r?`default`:`pointer`,opacity:r?.6:1}}function Pn(e,t){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:500,opacity:t?.85:.75}}function Fn(e,t){return t===`strip`?e.controlHeight:Math.max(20,e.controlHeight-4)}function In(e){return e.controlRadius+2}function Ln(e,t){return t===`strip`?e.paddingX+2:e.paddingX}var J,Rn;function zn(){return(zn=e((()=>{J=2,Rn=2})))()}function Bn(e){let{value:t,options:n,onChange:r,label:i,role:a=`tablist`}=e,{panelId:o,baseId:s,size:c=`strip`,disabled:l=!1,testId:u}=e,{metrics:d}=b(),f=(0,Vn.useId)(),p=(0,Vn.useRef)([]),m=a===`tablist`,h=s??f,g=-1;for(let e=0;e<n.length;e++)n[e]?.value===t&&(g=e);return(0,Hn.jsx)(`div`,{role:a,"aria-label":i,"data-testid":u,style:Mn(d,c),onKeyDown:e=>{kn(e,{length:n.length,selectedIndex:g,onSelect:e=>{let t=n[e];t!==void 0&&t.disabled!==!0&&(p.current[e]?.focus(),r(t.value))}})},children:n.map((e,n)=>{let i=e.value===t,a=l||e.disabled===!0;return(0,Hn.jsxs)(`button`,{ref:e=>{p.current[n]=e},type:`button`,role:m?`tab`:`radio`,id:m?`${h}-${e.value}`:void 0,"aria-selected":m?i:void 0,"aria-checked":m?void 0:i,"aria-controls":m?o:void 0,title:e.title,disabled:a,tabIndex:n===Math.max(g,0)?0:-1,style:Nn(d,{selected:i,disabled:a,size:c}),onClick:()=>r(e.value),children:[e.label,e.count===void 0?null:(0,Hn.jsx)(`span`,{style:Pn(d,i),children:e.count})]},e.value)})})}var Vn,Hn;function Un(){return(Un=e((()=>{Vn=t(),jn(),zn(),S(),Hn=n(),Bn.__docgenInfo={description:`A row of choices in a sunken track, the one in force lifted out of it.

It is the package's one segmented control, used both as a figure's tab strip
and as a setting inside a card, because a reader who has learned to press
one of them has learned to press the other. Only one segment is in the tab
order — the one in force — and the arrows move between them from there, so
a strip of six views costs a reader walking the page one stop rather than
six.
@param props - See {@link OverlayPillsProps}.
@returns The group.`,methods:[],displayName:`OverlayPills`,props:{value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayPillOption`,elements:[{name:`TValue`}],raw:`OverlayPillOption<TValue>`}],raw:`ReadonlyArray<OverlayPillOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},label:{required:!0,tsType:{name:`string`},description:`What the group is called, for a reader arriving by keyboard.`},role:{required:!1,tsType:{name:`union`,raw:`'tablist' | 'radiogroup'`,elements:[{name:`literal`,value:`'tablist'`},{name:`literal`,value:`'radiogroup'`}]},description:`What the group is: a strip moving between the views of one figure, or a
set of choices for one setting. The look is the same either way — it is
the announcement and the shape of the keyboard that differ.
@default 'tablist'`},size:{required:!1,tsType:{name:`union`,raw:`'strip' | 'setting'`,elements:[{name:`literal`,value:`'strip'`},{name:`literal`,value:`'setting'`}]},description:`How big it is drawn: the figure's own tab bar, or one question inside a
card, which is a little smaller.
@default 'strip'`},panelId:{required:!1,tsType:{name:`string`},description:`The \`id\` of the panel a tab strip drives, so a screen reader can walk from
a tab to what it shows. One panel is normally shared, since only the tab
in force is ever rendered.
@default undefined`},baseId:{required:!1,tsType:{name:`string`},description:`Stem of the \`id\` every tab carries, for a panel that names the tab it
belongs to. Left out, one is generated.
@default undefined — a generated id`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the whole group is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the group.\n@default undefined"}}}})))()}function Wn(e){let{pointerX:t,pointerY:n,cardWidth:r,cardHeight:i,boxWidth:a,boxHeight:o,offset:s=Kn}=e,c=t+s+r>a,l=n+s+i>o;return{left:Gn(c?t-s-r:t+s,a-r),top:Gn(l?n-s-i:n+s,o-i),flippedX:c,flippedY:l}}function Gn(e,t){return Number.isFinite(e)?Math.max(0,Math.min(e,Number.isFinite(t)?Math.max(0,t):0)):0}var Kn;function qn(){return(qn=e((()=>{Kn=14})))()}function Jn(e){let{x:t,y:n,boxWidth:r,boxHeight:i,title:o,rows:s,maxRows:c=12,pinned:l=!1,onUnpin:u,testId:d}=e,{metrics:f}=b(),p=(0,Qn.useRef)(null),m=fe(p),h=Math.max(1,c),g=l?0:Math.max(0,s.length-h),_=g===0?s:s.slice(0,h),v=_.length+(g===0?1:2),y=Wn({pointerX:t,pointerY:n,cardWidth:m.width>0?m.width:$n,cardHeight:m.height>0?m.height:Xn(v),boxWidth:r,boxHeight:i});return(0,Y.jsxs)(`div`,{ref:p,"data-testid":d,role:l?`group`:`tooltip`,"aria-label":l?o:void 0,style:{...it(f),left:y.left,top:y.top,...l?Zn(i,f):null},children:[(0,Y.jsxs)(`div`,{style:rr,children:[(0,Y.jsx)(`span`,{children:o}),l&&u!==void 0?(0,Y.jsx)(a,{variant:`minimal`,size:`small`,icon:`cross`,"aria-label":`Dismiss`,onClick:u}):null]}),Yn(_),g===0?null:(0,Y.jsx)(`div`,{style:cr,children:`+ ${g} more — click to keep this open`})]})}function Yn(e){let t=[],n=new Map;for(let r of e){let e=n.get(r.label)??0;n.set(r.label,e+1),t.push((0,Y.jsxs)(`div`,{style:ir,children:[r.color===void 0?null:(0,Y.jsx)(`span`,{style:{...sr,background:r.color}}),(0,Y.jsx)(`span`,{style:ar,children:r.label}),(0,Y.jsx)(`span`,{style:or,children:r.value})]},e===0?r.label:`${r.label} ${String(e)}`))}return t}function Xn(e){return tr+e*er}function Zn(e,t){return{pointerEvents:`auto`,userSelect:`text`,maxHeight:Math.max(nr,e-t.inset*2),overflowY:`auto`}}var Qn,Y,$n,er,tr,nr,rr,ir,ar,or,sr,cr;function lr(){return(lr=e((()=>{Qn=t(),o(),pe(),qn(),F(),S(),Y=n(),$n=220,er=18,tr=16,nr=80,rr={display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:8,fontWeight:600},ir={display:`flex`,alignItems:`baseline`,gap:6},ar={color:`var(--text-muted)`},or={marginLeft:`auto`,fontVariantNumeric:`tabular-nums`,whiteSpace:`nowrap`},sr={alignSelf:`center`,flex:`none`,width:8,height:8,borderRadius:2},cr={marginTop:2,paddingTop:2,borderTop:`1px solid var(--border)`,color:`var(--text-faint)`},Jn.__docgenInfo={description:`The card that follows the pointer and says everything known about the mark
under it.

It follows the pointer rather than anchoring to the mark, because a
nearest-within-radius hit test changes which mark it names while the pointer
keeps moving, and an anchored card would then teleport. Pinned, it stops
following and becomes readable and selectable.
@param props - See {@link OverlayReadoutProps}.
@returns The card.`,methods:[],displayName:`OverlayReadout`,props:{x:{required:!0,tsType:{name:`number`},description:`Where the pointer is, in pixels from the figure's left.`},y:{required:!0,tsType:{name:`number`},description:`Where the pointer is, in pixels from the figure's top.`},boxWidth:{required:!0,tsType:{name:`number`},description:`Width of the figure, so the card can be flipped rather than clipped.`},boxHeight:{required:!0,tsType:{name:`number`},description:`Height of the figure.`},title:{required:!0,tsType:{name:`string`},description:`The first line, in bold — normally what the reader pointed at.`},rows:{required:!0,tsType:{name:`unknown`},description:`Everything the caller knows about it, in the caller's own order.`},maxRows:{required:!1,tsType:{name:`number`},description:`The most rows shown before a \`+ 7 more — click to keep this open\` footer.
A card taller than the figure is a fault, not a feature.
@default 12`},pinned:{required:!1,tsType:{name:`boolean`},description:`Whether the card stays until it is dismissed, in which case it scrolls its
own rows and lets the reader select their text.
@default false`},onUnpin:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the reader dismisses a pinned card.
@default undefined`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card.\n@default undefined"}}}})))()}function ur(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:c}=e;return(0,dr.jsx)(D,{label:i,help:a,hideLabel:o,disabled:s,children:(0,dr.jsx)(Bn,{role:`radiogroup`,size:`setting`,label:i,value:t,options:n,disabled:s,testId:c,onChange:r})})}var dr;function fr(){return(fr=e((()=>{Un(),k(),dr=n(),ur.__docgenInfo={description:`The row of segments a card uses while every choice still fits on one line.

Its choices are readable without being opened, which is worth the width up
to about four of them: a reader who can see that a second view exists asks
for it, and a reader looking at a closed picker does not.

It is the same sunken track a figure's tab strip is made of, one size down,
so a reader meets one device in a viewer rather than two that happen to both
be rows of choices. The segments carry the caption's own name, because a
bare row of buttons over a figure is announced as nothing at all to a reader
arriving by keyboard.
@param props - See {@link OverlaySegmentedProps}.
@returns The caption, its help, and the segments.`,methods:[],displayName:`OverlaySegmented`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`}}}})))()}function pr(e){let{label:t,value:n,keyWord:r=t,showKey:a=!0,swatches:o}=e,{active:s=!1,disabled:c=!1,disabledReason:l}=e,{opensMenu:u=!1,onClick:d,testId:f}=e,{metrics:p}=b(),[m,h]=(0,hr.useState)(!1),[g,_]=(0,hr.useState)(!1),v=`${t} — ${n}`;return(0,X.jsxs)(`button`,{type:`button`,title:c&&l!==void 0?l:v,"aria-label":v,"aria-haspopup":u?`menu`:void 0,"aria-expanded":u?s:void 0,disabled:c,"data-testid":f,style:yt(p,{hovered:m,focused:g,active:s,disabled:c}),onClick:d,onPointerEnter:()=>h(!0),onPointerLeave:()=>h(!1),onFocus:()=>_(!0),onBlur:()=>_(!1),children:[o===void 0||o.length===0?null:(0,X.jsx)(pt,{colors:o}),a?(0,X.jsx)(`span`,{style:St(),children:r}):null,(0,X.jsx)(`span`,{style:xt(),children:n}),(0,X.jsx)(`span`,{"aria-hidden":`true`,style:wt(),children:(0,X.jsx)(i,{icon:`caret-down`,size:mr(p.fontSize)})})]})}function mr(e){return e+2}var hr,X;function gr(){return(gr=e((()=>{r(),hr=t(),L(),S(),Et(),X=n(),pr.__docgenInfo={description:`A setting written as its own value, with a caret saying it can be changed.

It replaces the two idioms a bar used to hold for the same job — a caption
beside an outlined segmented control, and a caption beside a native select —
with one that costs no box at all. The reader scans the bar and reads
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
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}function _r(e){let{label:t,value:n,options:r,onChange:i,keyWord:a,showKey:o}=e,{swatches:s,disabled:c=!1,disabledReason:l}=e,{placement:u=`bottom-end`,testId:p}=e,{metrics:h}=b(),_=(0,vr.useId)(),[v,y]=(0,vr.useState)(!1),x=n;for(let e of r)e.value===n&&(x=e.label);return(0,Z.jsx)(m,{isOpen:v,disabled:c,placement:u,onInteraction:e=>y(e),content:(0,Z.jsxs)(d,{role:`listbox`,"aria-labelledby":_,size:h.blueprintSize,style:yr,children:[(0,Z.jsx)(g,{title:t,titleId:_}),r.map(e=>(0,Z.jsx)(f,{roleStructure:`listoption`,selected:e.value===n,text:e.label,htmlTitle:e.title,disabled:e.disabled,onClick:()=>i(e.value)},e.value))]}),children:(0,Z.jsx)(pr,{label:t,value:x,keyWord:a,showKey:o,swatches:s,active:v,disabled:c,disabledReason:l,testId:p,opensMenu:!0})})}var vr,Z,yr;function br(){return(br=e((()=>{l(),h(),u(),p(),vr=t(),gr(),S(),Z=n(),yr={minWidth:168},_r.__docgenInfo={description:`A setting written as its value, whose choices are a menu behind it.

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
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"}}}})))()}function xr(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:l}=e,{metrics:u}=b(),d=C(),{appearance:f=d===void 0?`field`:`quiet`}=e;return f===`quiet`?(0,Q.jsx)(D,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Q.jsx)(_r,{label:i,value:t,options:n,onChange:r,showKey:!1,disabled:s,testId:l})}):(0,Q.jsx)(D,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Q.jsx)(c,{value:t,disabled:s,large:u.blueprintSize===`large`,"aria-label":i,"data-testid":l,onChange:e=>r(e.currentTarget.value),children:n.map(e=>(0,Q.jsx)(`option`,{value:e.value,title:e.title,disabled:e.disabled,children:e.label},e.value))})})}var Q;function Sr(){return(Sr=e((()=>{s(),k(),br(),w(),S(),Q=n(),xr.__docgenInfo={description:`The picker a card reaches for once the choices stop fitting side by side.

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
@default 'quiet' inside an OverlayPanel, 'field' anywhere else`}}}})))()}function Cr(e){let t=Math.round(e.controlHeight*.75/2)*2,n=Math.round(t*5/3),r=t-4;return{width:n,height:t,knob:r,inset:2,travel:n-r-4}}function wr(e,t,n){return{display:`inline-flex`,alignItems:`center`,minWidth:t.width,height:e.controlHeight,padding:0,border:`none`,background:`transparent`,cursor:n?`default`:`pointer`,opacity:n?.6:1}}function Tr(e,t){return{position:`relative`,display:`inline-block`,width:e.width,height:e.height,borderRadius:999,background:t?`var(--accent)`:`var(--border-strong)`,transition:`background ${Dr}ms ease`}}function Er(e,t){return{position:`absolute`,top:e.inset,left:t?e.inset+e.travel:e.inset,width:e.knob,height:e.knob,borderRadius:`50%`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,transition:`left ${Dr}ms ease`}}var Dr;function Or(){return(Or=e((()=>{Dr=150})))()}function kr(e){let{checked:t,onChange:n,label:r,help:i,hideLabel:o=!1,disabled:s=!1,testId:c,swatch:l,icon:u}=e,{metrics:d}=b(),f=C();if((e.appearance??(f===void 0?`button`:`switch`))===`switch`){let e=Cr(d);return(0,$.jsx)(D,{label:r,help:i,hideLabel:o,disabled:s,children:(0,$.jsx)(`button`,{type:`button`,"aria-pressed":t,"aria-label":r,disabled:s,"data-testid":c,style:wr(d,e,s),onClick:()=>n(!t),children:(0,$.jsx)(`span`,{style:Tr(e,t),children:(0,$.jsx)(`span`,{style:Er(e,t)})})})})}return(0,$.jsx)(D,{label:r,help:i,hideLabel:!0,disabled:s,children:(0,$.jsx)(a,{variant:`minimal`,size:d.blueprintSize,active:t,disabled:s,"aria-pressed":t,"aria-label":r,title:o?r:void 0,icon:l===void 0?u:(0,$.jsx)(`span`,{style:Oe(l)}),text:o?void 0:r,"data-testid":c,onClick:()=>n(!t)})})}var $;function Ar(){return(Ar=e((()=>{o(),k(),A(),w(),S(),Or(),$=n(),kr.__docgenInfo={description:`One thing on the figure turned on and off.

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
@default undefined`}}}})))()}export{ot as A,D as B,Kt as C,Dt as D,Gt as E,Re as F,A as I,De as L,Ze as M,et as N,At as O,Pe as P,we as R,Qt as S,Ht as T,k as V,Tn as _,_r as a,nn as b,ur as c,lr as d,Bn as f,bn as g,On as h,Sr as i,ft as j,L as k,fr as l,En as m,Ar as n,br as o,Un as p,xr as r,gr as s,kr as t,Jn as u,rn as v,Yt as w,Zt as x,mn as y,Ee as z};