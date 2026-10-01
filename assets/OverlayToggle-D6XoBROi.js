import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-D6L6Qsmh.js";import{n as r,t as i}from"./useT-YCV5JKSb.js";import{o as a,t as o}from"./components-DOSsfD-t.js";import{i as s,r as c}from"./popoverNextMigrationUtils-CMCmJ3Wq.js";import{O as l,S as u,k as d,x as f}from"./OverlaySelect-D1yJvD2F.js";import{i as p,n as m}from"./overlaySurface-_xoMwQnT.js";import{t as h}from"./clamp-M7_x50VL.js";import{a as g,t as _}from"./numbers-BxzU8aH2.js";import{n as v,t as y}from"./roundTo-BbWJSCmm.js";import{a as b,c as x,d as ee,f as te,i as ne,l as S,o as re,r as ie,s as C,u as ae}from"./OverlayLayer-I8ViJKVb.js";import{n as oe,r as se,s as w,t as ce}from"./OverlayIconButton-BKiVF_sa.js";function le(e,t){return!Number.isFinite(e)||e<=0||!Number.isFinite(t)?!1:e<t}function ue(e){let{collapsed:t,startedFolded:n,width:r,collapseBelow:i}=e;return t??(n||le(r,i))}function T(e){let{children:t,placement:n,label:r,icon:i,padded:a=!0}=e,{metrics:o}=p(),[s,l]=(0,E.useState)(!1);return(0,D.jsx)(c,{placement:O[n],onInteraction:e=>l(e),content:a?(0,D.jsx)(`div`,{style:ee(o),children:t}):(0,D.jsx)(D.Fragment,{children:t}),children:(0,D.jsx)(ce,{icon:i,label:r,active:s,opensMenu:!0})})}var E,D,O;function k(){return(k=e((()=>{s(),E=t(),oe(),b(),m(),D=n(),O={"top-left":`bottom-start`,"top-right":`bottom-end`,"bottom-left":`top-start`,"bottom-right":`top-end`,above:`bottom-end`,below:`top-end`,stretch:`bottom-end`},T.__docgenInfo={description:`The button at the end of a bar, and the panel behind it.

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
@default true`}}}})))()}function A(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d,restingOpacity:f}=e,{metrics:m,awake:h,busy:g}=p(),_=u||a!==void 0?(0,j.jsxs)(T,{placement:o,label:s,icon:c,padded:l,children:[u?t:null,a]}):null;return(0,j.jsxs)(`div`,{style:x(o,m),"data-testid":d,children:[(0,j.jsx)(`div`,{style:ae(h?1:te(f),g)}),u?(0,j.jsx)(`div`,{style:S(m),children:_}):(0,j.jsxs)(`div`,{role:`group`,"aria-label":s,style:S(m),children:[t,n,r,i,_]})]})}var j;function M(){return(M=e((()=>{k(),b(),m(),j=n(),A.__docgenInfo={description:`The small card of controls floating in a corner of a figure.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"},restingOpacity:{required:!0,tsType:{name:`number`},description:`How opaque the ground is while nothing is pointing at the figure.`}}}})))()}function N(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:s}=e,{moreIcon:c,morePadded:l,folded:u,testId:d}=e,{metrics:f}=p(),m=a!==void 0||u&&n!==void 0;return(0,P.jsxs)(`div`,{style:x(o,f),"data-testid":d,children:[(0,P.jsx)(`div`,{style:ie}),(0,P.jsxs)(`div`,{style:re(f),children:[(0,P.jsx)(`div`,{style:C(f),children:t}),(0,P.jsxs)(`div`,{role:`group`,"aria-label":s,style:C(f),children:[u?null:n,r,i,m?(0,P.jsxs)(T,{placement:o,label:s,icon:c,padded:l,children:[u?n:null,a]}):null]})]})]})}var P;function F(){return(F=e((()=>{k(),b(),m(),P=n(),N.__docgenInfo={description:`The bar that spans the width of the figure, its two ends pushed apart.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"}}}})))()}function I(e){let{children:t,end:n,tools:i,info:a,more:o}=e,{placement:s=`top-right`}=e,{label:c,restingOpacity:l=ne}=e,u=r(),d=c??u(`overlay.options`),{collapsed:f,defaultCollapsed:m=!1}=e,{collapseBelow:h=420,moreIcon:g=`cog`,testId:_}=e,{morePadded:v=!0}=e,{width:y}=p(),[b]=(0,L.useState)(m),x=ue({collapsed:f,startedFolded:b,width:y,collapseBelow:h});return s===`stretch`?(0,R.jsx)(N,{end:n,tools:i,info:a,more:o,placement:s,label:d,moreIcon:g,morePadded:v,folded:x,testId:_,children:t}):(0,R.jsx)(A,{end:n,tools:i,info:a,more:o,placement:s,label:d,moreIcon:g,morePadded:v,folded:x,restingOpacity:l,testId:_,children:t})}var L,R;function z(){return(z=e((()=>{L=t(),i(),M(),F(),b(),m(),R=n(),I.__docgenInfo={description:`The controls of a figure: a small card floating in one of its corners, or
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
@default the chrome's own word for it, in the language of the page`},restingOpacity:{required:!1,tsType:{name:`number`},description:`How opaque the bar is while nothing is pointing at the figure. Never below
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
@default true`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card, for the end-to-end tests.\n@default undefined"}}}})))()}function de(e){return{display:`inline-flex`,alignItems:`center`,gap:0,height:e.controlHeight,padding:2,borderRadius:e.controlRadius,background:`var(--surface-sunken)`}}function B(e,t){let n=e.controlHeight-4;return{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:n,height:n,padding:0,border:`none`,borderRadius:Math.max(3,e.controlRadius-2),background:`transparent`,color:t?`var(--text-faint)`:`var(--text-muted)`,font:`inherit`,fontSize:e.fontSize+1,lineHeight:1,cursor:t?`default`:`pointer`,opacity:t?.45:1}}function fe(e,t){return{minWidth:Math.max(e.fontSize,Math.ceil(t*e.fontSize*V)),padding:`0 3px`,color:`var(--text)`,fontSize:e.fontSize,fontVariantNumeric:`tabular-nums`,textAlign:`center`,userSelect:`none`}}var V;function H(){return(H=e((()=>{V=.6})))()}function U(e){let{value:t,min:n,max:r,onChange:i,label:a,help:o,hideLabel:s=!1,disabled:c=!1,testId:l,step:u=1,digits:d=0,unit:m=``}=e,{metrics:h}=p();function g(e){let a=me(t+e*u,n,r);a!==t&&i(a)}function v(e){let t=K.get(e.key);t===void 0||c||(e.preventDefault(),g(t))}return(0,W.jsx)(f,{label:a,help:o,hideLabel:s,disabled:c,children:(0,W.jsxs)(`span`,{style:de(h),"data-testid":l,children:[(0,W.jsx)(`button`,{type:`button`,style:B(h,c||t<=n),disabled:c||t<=n,"aria-label":`Decrease ${a}`,onClick:()=>g(-1),onKeyDown:v,children:`−`}),(0,W.jsx)(`span`,{style:fe(h,pe(e)),"aria-live":`polite`,children:`${_(t,d)}${m}`}),(0,W.jsx)(`button`,{type:`button`,style:B(h,c||t>=r),disabled:c||t>=r,"aria-label":`Increase ${a}`,onClick:()=>g(1),onKeyDown:v,children:`+`})]})})}function pe(e){let{min:t,max:n,digits:r=0,unit:i=``}=e;return Math.max(_(t,r).length,_(n,r).length)+i.length}function me(e,t,n){return h(v(e,G),t,n)}var W,G,K;function q(){return(q=e((()=>{g(),y(),u(),H(),m(),W=n(),G=10,K=new Map([[`ArrowUp`,1],[`ArrowRight`,1],[`ArrowDown`,-1],[`ArrowLeft`,-1]]),U.__docgenInfo={description:`A value the reader nudges up and down.

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
@default 0`},unit:{required:!1,tsType:{name:`string`},description:"Written after the value, e.g. `px`.\n@default '' — no unit is written"}}}})))()}function he(e){let t=Math.round(e.controlHeight*.75/2)*2,n=Math.round(t*5/3),r=t-4;return{width:n,height:t,knob:r,inset:2,travel:n-r-4}}function ge(e,t,n){return{display:`inline-flex`,alignItems:`center`,minWidth:t.width,height:e.controlHeight,padding:0,border:`none`,background:`transparent`,cursor:n?`default`:`pointer`,opacity:n?.6:1}}function _e(e,t){return{position:`relative`,display:`inline-block`,width:e.width,height:e.height,borderRadius:999,background:t?`var(--accent)`:`var(--border-strong)`,transition:`background ${Y}ms ease`}}function J(e,t){return{position:`absolute`,top:e.inset,left:t?e.inset+e.travel:e.inset,width:e.knob,height:e.knob,borderRadius:`50%`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,transition:`left ${Y}ms ease`}}var Y;function X(){return(X=e((()=>{Y=150})))()}function Z(e){let{checked:t,onChange:n,label:r,help:i,hideLabel:o=!1,disabled:s=!1,testId:c,swatch:l,icon:u}=e,{metrics:m}=p(),h=d();if((e.appearance??(h===void 0?`button`:`switch`))===`switch`){let e=he(m);return(0,Q.jsx)(f,{label:r,help:i,hideLabel:o,disabled:s,children:(0,Q.jsx)(`button`,{type:`button`,"aria-pressed":t,"aria-label":r,disabled:s,"data-testid":c,style:ge(m,e,s),onClick:()=>n(!t),children:(0,Q.jsx)(`span`,{style:_e(e,t),children:(0,Q.jsx)(`span`,{style:J(e,t)})})})})}return(0,Q.jsx)(f,{label:r,help:i,hideLabel:!0,disabled:s,children:(0,Q.jsx)(a,{variant:`minimal`,size:m.blueprintSize,active:t,disabled:s,"aria-pressed":t,"aria-label":r,title:o?r:void 0,icon:l===void 0?u:(0,Q.jsx)(`span`,{style:w(l)}),text:o?void 0:r,"data-testid":c,onClick:()=>n(!t)})})}var Q;function $(){return($=e((()=>{o(),u(),se(),l(),m(),X(),Q=n(),Z.__docgenInfo={description:`One thing on the figure turned on and off.

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
@default undefined`}}}})))()}export{I as a,q as i,$ as n,z as o,U as r,Z as t};