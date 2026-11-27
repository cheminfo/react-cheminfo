import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Ds1Hj5zQ.js";import{n as r,t as i}from"./useT-C0futuDT.js";import{n as a,t as o}from"./popoverNext-uzTkCHmy.js";import{i as s,n as c}from"./overlaySurface-C4bzX0GG.js";import{a as l,c as u,i as d,l as f,o as p,r as m,s as h}from"./OverlayLayer-CqFo9nzH.js";import{n as g,t as _}from"./OverlayIconButton-B6MoCdkj.js";function v(e,t){return!Number.isFinite(e)||e<=0||!Number.isFinite(t)?!1:e<t}function y(e){let{collapsed:t,startedFolded:n,width:r,collapseBelow:i}=e;return t??(n||v(r,i))}function b(e){let{children:t,placement:n,label:r,icon:i,padded:a=!0}=e,{metrics:c}=s(),[l,d]=(0,x.useState)(!1);return(0,S.jsx)(o,{isOpen:l,placement:C[n],onInteraction:e=>d(e),content:a?(0,S.jsx)(`div`,{style:u(c),children:t}):(0,S.jsx)(S.Fragment,{children:t}),children:(0,S.jsx)(_,{icon:i,label:r,active:l,opensMenu:!0})})}var x,S,C;function w(){return(w=e((()=>{a(),x=t(),g(),d(),c(),S=n(),C={"top-left":`bottom-start`,"top-right":`bottom-end`,"bottom-left":`top-start`,"bottom-right":`top-end`,above:`bottom-end`,below:`top-end`,stretch:`bottom-end`},b.__docgenInfo={description:`The button at the end of a bar, and the panel behind it.

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
@default true`}}}})))()}function T(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:c}=e,{moreIcon:u,morePadded:d,folded:m,testId:g,restingOpacity:_}=e,{metrics:v,awake:y,busy:x}=s(),S=m||a!==void 0?(0,E.jsxs)(b,{placement:o,label:c,icon:u,padded:d,children:[m?t:null,a]}):null;return(0,E.jsxs)(`div`,{style:l(o,v),"data-testid":g,children:[(0,E.jsx)(`div`,{style:h(y?1:f(_),x)}),m?(0,E.jsx)(`div`,{style:p(v),children:S}):(0,E.jsxs)(`div`,{role:`group`,"aria-label":c,style:p(v),children:[t,n,r,i,S]})]})}var E;function D(){return(D=e((()=>{w(),d(),c(),E=n(),T.__docgenInfo={description:`The small card of controls floating in a corner of a figure.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},rest:{required:!1,tsType:{name:`union`,raw:`'visible' | 'quiet' | 'hidden'`,elements:[{name:`literal`,value:`'visible'`},{name:`literal`,value:`'quiet'`},{name:`literal`,value:`'hidden'`}]},description:`How a stretched bar's controls are drawn while nothing points at the
figure.
@default 'visible'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"},restingOpacity:{required:!0,tsType:{name:`number`},description:`How opaque the ground is while nothing is pointing at the figure.`}}}})))()}function O(e){return{...p(e),flexWrap:`nowrap`,justifyContent:`space-between`,width:`100%`,minWidth:0}}function k(e,t){return e===`visible`?{}:{opacity:t?1:e===`quiet`?P:0,transition:`opacity 150ms ease-out`}}function A(e,t){return e===`visible`?N:{...N,opacity:t?1:F,transition:`opacity 150ms ease-out`}}function j(e){return{display:`flex`,flex:`1 1 auto`,alignItems:`center`,justifyContent:`space-between`,gap:e.gap,minWidth:0}}function M(e){return{display:`flex`,alignItems:`center`,gap:e.gap,minWidth:0}}var N,P,F;function I(){return(I=e((()=>{d(),N={position:`absolute`,inset:0,borderBottom:`1px solid var(--border)`,background:`var(--surface)`,pointerEvents:`none`},P=.45,F=.08})))()}function L(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:c}=e,{moreIcon:u,morePadded:d,folded:f,testId:p,rest:m=`visible`}=e,{metrics:h,awake:g}=s(),_=a!==void 0||f&&n!==void 0;return(0,R.jsxs)(`div`,{style:l(o,h),"data-testid":p,children:[(0,R.jsx)(`div`,{style:A(m,g)}),(0,R.jsxs)(`div`,{style:{...O(h),...k(m,g)},children:[t==null?null:(0,R.jsx)(`div`,{style:M(h),children:t}),(0,R.jsxs)(`div`,{role:`group`,"aria-label":c,style:j(h),children:[(0,R.jsx)(`div`,{style:M(h),children:f?null:n}),(0,R.jsxs)(`div`,{style:M(h),children:[r,i,_?(0,R.jsxs)(b,{placement:o,label:c,icon:u,padded:d,children:[f?n:null,a]}):null]})]})]})]})}var R;function z(){return(z=e((()=>{w(),I(),d(),c(),R=n(),L.__docgenInfo={description:`The bar that spans the width of the figure: the settings from the left edge,
the glyphs — help, saving, the button the rest folds into — at the right.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},rest:{required:!1,tsType:{name:`union`,raw:`'visible' | 'quiet' | 'hidden'`,elements:[{name:`literal`,value:`'visible'`},{name:`literal`,value:`'quiet'`},{name:`literal`,value:`'hidden'`}]},description:`How a stretched bar's controls are drawn while nothing points at the
figure.
@default 'visible'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"}}}})))()}function B(e){let{children:t,end:n,tools:i,info:a,more:o}=e,{placement:c=`top-right`}=e,{label:l,restingOpacity:u=m}=e,d=r(),f=l??d(`overlay.options`),{collapsed:p,defaultCollapsed:h=!1}=e,{collapseBelow:g=420,moreIcon:_=`cog`,testId:v}=e,{morePadded:b=!0,rest:x}=e,{width:S}=s(),[C]=(0,V.useState)(h),w=y({collapsed:p,startedFolded:C,width:S,collapseBelow:g});return c===`stretch`?(0,H.jsx)(L,{end:n,tools:i,info:a,more:o,placement:c,label:f,moreIcon:_,morePadded:b,folded:w,rest:x,testId:v,children:t}):(0,H.jsx)(T,{end:n,tools:i,info:a,more:o,placement:c,label:f,moreIcon:_,morePadded:b,folded:w,restingOpacity:u,testId:v,children:t})}var V,H;function U(){return(U=e((()=>{V=t(),i(),D(),z(),d(),c(),H=n(),B.__docgenInfo={description:`The controls of a figure: a small card floating in one of its corners, or
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
figure. A stretched bar holds its tab strip here, at the start of the row.`},end:{required:!1,tsType:{name:`ReactNode`},description:`The controls belonging to whatever the figure is currently showing. On a
card they close the row; on a stretched bar they follow the start, left
aligned, and only the glyphs keep the right edge. They are the first
thing to go when the figure is too narrow, folding in behind the button.
@default undefined — the bar holds only its start and its glyphs`},tools:{required:!1,tsType:{name:`ReactNode`},description:`The glyph-sized tools that act on the figure rather than change how it is
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
@default 0.74`},rest:{required:!1,tsType:{name:`union`,raw:`'visible' | 'quiet' | 'hidden'`,elements:[{name:`literal`,value:`'visible'`},{name:`literal`,value:`'quiet'`},{name:`literal`,value:`'hidden'`}]},description:`How a stretched bar's controls are drawn while nothing points at the
figure: at full strength, faded, or not at all. The bar keeps its height
whichever it is. A card ignores it: its rest is \`restingOpacity\`.
@default 'visible'`},collapsed:{required:!1,tsType:{name:`boolean`},description:"Whether the bar is reduced to a button opening the same controls in a\npopover. Left out, it folds on its own once the figure is narrower than\n`collapseBelow`. A caller that needs to know whether a bar left to decide\nhas folded asks `overlayBarFolded` with the width `useOverlaySurface`\nreads, which is the answer the bar itself draws from.\n@default undefined — the bar decides from the figure's width"},defaultCollapsed:{required:!1,tsType:{name:`boolean`},description:`Whether it starts folded, for a bar the reader may open and close.
@default false`},collapseBelow:{required:!1,tsType:{name:`number`},description:`Figure width, in pixels, under which the bar folds on its own.
@default 420`},moreIcon:{required:!1,tsType:{name:`IconName`},description:`Blueprint glyph of the button that opens the rest. A cog rather than an
ellipsis, because once the bar folds that button holds every control and
not only the second tier.
@default 'cog'`},morePadded:{required:!1,tsType:{name:`boolean`},description:`Whether what opens behind that button is drawn with the card's own padding
around it. Turn it off when \`more\` is an {@link OverlayPanel}, which
brings its own: nested inside a padded surface a panel's header rule stops
short of both edges and reads as a mis-drawn line rather than as a header.
@default true`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card, for the end-to-end tests.\n@default undefined"}}}})))()}export{U as n,B as t};