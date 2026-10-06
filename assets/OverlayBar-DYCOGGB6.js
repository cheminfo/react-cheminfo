import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CP1pcUc9.js";import{n as r,t as i}from"./useT-DkVHsVes.js";import{i as a,r as o}from"./popoverNextMigrationUtils-BqfpyWLP.js";import{i as s,n as c}from"./overlaySurface-CD9WRJ-B.js";import{a as l,c as u,d,f,i as p,l as m,o as h,r as g,s as _,u as v}from"./OverlayLayer-BhTMAsJW.js";import{n as y,t as b}from"./OverlayIconButton-XFF2nHws.js";function x(e,t){return!Number.isFinite(e)||e<=0||!Number.isFinite(t)?!1:e<t}function S(e){let{collapsed:t,startedFolded:n,width:r,collapseBelow:i}=e;return t??(n||x(r,i))}function C(e){let{children:t,placement:n,label:r,icon:i,padded:a=!0}=e,{metrics:c}=s(),[l,u]=(0,w.useState)(!1);return(0,T.jsx)(o,{placement:E[n],onInteraction:e=>u(e),content:a?(0,T.jsx)(`div`,{style:d(c),children:t}):(0,T.jsx)(T.Fragment,{children:t}),children:(0,T.jsx)(b,{icon:i,label:r,active:l,opensMenu:!0})})}var w,T,E;function D(){return(D=e((()=>{a(),w=t(),y(),l(),c(),T=n(),E={"top-left":`bottom-start`,"top-right":`bottom-end`,"bottom-left":`top-start`,"bottom-right":`top-end`,above:`bottom-end`,below:`top-end`,stretch:`bottom-end`},C.__docgenInfo={description:`The button at the end of a bar, and the panel behind it.

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
@default true`}}}})))()}function O(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:c}=e,{moreIcon:l,morePadded:d,folded:p,testId:h,restingOpacity:g}=e,{metrics:_,awake:y,busy:b}=s(),x=p||a!==void 0?(0,k.jsxs)(C,{placement:o,label:c,icon:l,padded:d,children:[p?t:null,a]}):null;return(0,k.jsxs)(`div`,{style:u(o,_),"data-testid":h,children:[(0,k.jsx)(`div`,{style:v(y?1:f(g),b)}),p?(0,k.jsx)(`div`,{style:m(_),children:x}):(0,k.jsxs)(`div`,{role:`group`,"aria-label":c,style:m(_),children:[t,n,r,i,x]})]})}var k;function A(){return(A=e((()=>{D(),l(),c(),k=n(),O.__docgenInfo={description:`The small card of controls floating in a corner of a figure.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"},restingOpacity:{required:!0,tsType:{name:`number`},description:`How opaque the ground is while nothing is pointing at the figure.`}}}})))()}function j(e){let{children:t,end:n,tools:r,info:i,more:a,placement:o,label:c}=e,{moreIcon:l,morePadded:d,folded:f,testId:p}=e,{metrics:m}=s(),v=a!==void 0||f&&n!==void 0;return(0,M.jsxs)(`div`,{style:u(o,m),"data-testid":p,children:[(0,M.jsx)(`div`,{style:g}),(0,M.jsxs)(`div`,{style:h(m),children:[(0,M.jsx)(`div`,{style:_(m),children:t}),(0,M.jsxs)(`div`,{role:`group`,"aria-label":c,style:_(m),children:[f?null:n,r,i,v?(0,M.jsxs)(C,{placement:o,label:c,icon:l,padded:d,children:[f?n:null,a]}):null]})]})]})}var M;function N(){return(N=e((()=>{D(),l(),c(),M=n(),j.__docgenInfo={description:`The bar that spans the width of the figure, its two ends pushed apart.

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
@default undefined — nothing but whatever has folded away`},placement:{required:!0,tsType:{name:`union`,raw:`OverlayCorner | 'above' | 'below' | 'stretch'`,elements:[{name:`union`,raw:`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,elements:[{name:`literal`,value:`'top-left'`},{name:`literal`,value:`'top-right'`},{name:`literal`,value:`'bottom-left'`},{name:`literal`,value:`'bottom-right'`}]},{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'stretch'`}]},description:`Where the bar sits.`},label:{required:!0,tsType:{name:`string`},description:`What the group of controls is called.`},moreIcon:{required:!0,tsType:{name:`IconName`},description:`Glyph of the button that opens the rest.`},morePadded:{required:!0,tsType:{name:`boolean`},description:`Whether that button's panel is drawn with the card's own padding.`},folded:{required:!0,tsType:{name:`boolean`},description:`Whether the bar has folded its controls away behind that button.`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the bar.\n@default undefined"}}}})))()}function P(e){let{children:t,end:n,tools:i,info:a,more:o}=e,{placement:c=`top-right`}=e,{label:l,restingOpacity:u=p}=e,d=r(),f=l??d(`overlay.options`),{collapsed:m,defaultCollapsed:h=!1}=e,{collapseBelow:g=420,moreIcon:_=`cog`,testId:v}=e,{morePadded:y=!0}=e,{width:b}=s(),[x]=(0,F.useState)(h),C=S({collapsed:m,startedFolded:x,width:b,collapseBelow:g});return c===`stretch`?(0,I.jsx)(j,{end:n,tools:i,info:a,more:o,placement:c,label:f,moreIcon:_,morePadded:y,folded:C,testId:v,children:t}):(0,I.jsx)(O,{end:n,tools:i,info:a,more:o,placement:c,label:f,moreIcon:_,morePadded:y,folded:C,restingOpacity:u,testId:v,children:t})}var F,I;function L(){return(L=e((()=>{F=t(),i(),A(),N(),l(),c(),I=n(),P.__docgenInfo={description:`The controls of a figure: a small card floating in one of its corners, or
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
@default true`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card, for the end-to-end tests.\n@default undefined"}}}})))()}export{L as n,P as t};