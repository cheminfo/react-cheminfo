import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Gi02zF1q.js";import{a as r,i,l as a,n as o}from"./chartScale-Cx3ulN9E.js";import{A as s,C as c,E as l,M as u,S as d,T as f,_ as p,a as m,b as h,c as g,d as _,f as v,i as y,j as b,k as x,l as S,m as C,n as ee,o as te,p as ne,r as w,s as re,t as T,u as ie,v as E,w as D,x as O,y as k}from"./useScatterLabels-B71QS7yB.js";import{w as A}from"./projectionFixtures-CiYcRfZJ.js";import{n as j,t as ae}from"./ChartFrame-B1D_GfLV.js";function M(e){let{scores:t,groupOf:n,groups:r,axes:i}=e,{size:a=O,minimumPoints:o=3}=e;return{...l(t,n,r,i),standardDeviations:d(a),minimumPoints:o}}function N(e,t,n,r){let{standardDeviations:i,minimumPoints:a}=e;return D(e,{group:t,xAxis:n,yAxis:r,standardDeviations:i,minimumPoints:a})}function P(){return(P=e((()=>{c(),f()})))()}function oe(e,t,n){let r=Math.cos(e.angle),i=Math.sin(e.angle),a=e.rx*e.rx,o=e.ry*e.ry,s=a*r*r+o*i*i,c=(a-o)*r*i,l=a*i*i+o*r*r,u=t.factor*n.factor,d=x({xx:t.factor*t.factor*s,xy:u*c,yy:n.factor*n.factor*l}),f={cx:t.offset+e.cx*t.factor,cy:n.offset+e.cy*n.factor,rx:d.rx,ry:d.ry,angleDegrees:d.angle*F/Math.PI};return!Number.isFinite(f.cx)||!Number.isFinite(f.cy)||!Number.isFinite(f.rx)||!Number.isFinite(f.ry)||!Number.isFinite(f.angleDegrees)?null:f}function se(e,t=I){let n=Number.isFinite(t)?Math.max(L,Math.floor(t)):I,r=Math.cos(e.angle),i=Math.sin(e.angle),a=Array(n);for(let t=0;t<n;t++){let o=2*Math.PI*t/n,s=e.rx*Math.cos(o),c=e.ry*Math.sin(o);a[t]={x:e.cx+s*r-c*i,y:e.cy+s*i+c*r}}return a}var F,I,L;function R(){return(R=e((()=>{s(),F=180,I=64,L=3})))()}function z(e,t,n,r,i){let a=oe(t,n,r);return a===null?V(e,t,n,r,i):B(e,a,i)}function B(e,t,n){let{cx:r,cy:i,rx:a,ry:s,angleDegrees:c}=t,l={"data-group":e,opacity:n.opacity};if(s>0)return(0,U.jsx)(`ellipse`,{...l,...H(n),cx:o(r),cy:o(i),rx:o(a),ry:o(s),transform:`rotate(${o(c)} ${o(r)} ${o(i)})`},e);let u=c*Math.PI/G,d=a*Math.cos(u),f=a*Math.sin(u);return(0,U.jsx)(`line`,{...l,fill:`none`,stroke:n.color,strokeWidth:W,x1:o(r-d),y1:o(i-f),x2:o(r+d),y2:o(i+f)},e)}function V(e,t,n,r,i){let a=se(t),s=``;for(let e=0;e<a.length;e++){let t=a[e];if(t===void 0)continue;let i=o(n.offset+t.x*n.factor),c=o(r.offset+t.y*r.factor);s+=`${e===0?`M`:`L`}${i} ${c}`}return(0,U.jsx)(`path`,{"data-group":e,d:s===``?s:`${s}Z`,opacity:i.opacity,...H(i)},e)}function H(e){let t=e.fillOpacity??.1;return t>0?{fill:e.color,fillOpacity:t}:{fill:`none`}}var U,W,G;function K(){return(K=e((()=>{i(),R(),U=n(),W=1.5,G=180,z.__docgenInfo={description:`One group outline, mapped onto a plot and ready to be drawn.

The region is fill only, with no boundary drawn: a stroked edge reads as a
measured limit the ellipse never claims to be, and it competes with the dots
the reader is there to count. The fill is deliberately faint for the same
reason it is the whole shape — fills stack where groups overlap, and a tint
heavy enough to see on its own turns two overlapping species into a third
colour the reader then looks for in the legend.

A group whose points lie on a straight line is drawn as the segment it
actually is, and that one is stroked, since a shape of no height fills to
nothing: that a group is perfectly correlated in these two axes is a
finding, and dropping its outline would hide it.
@param group - Which group it belongs to, for the key and the attribute the tests read.
@param ellipse - The outline in data units, from \`confidenceEllipse\` or \`scatterPairEllipse\`.
@param scaleX - Data to pixels, horizontally.
@param scaleY - Data to pixels, vertically; its \`factor\` is negative.
@param ink - See {@link ScatterOutlineInk}.
@returns The element, keyed by group.`,methods:[],displayName:`scatterOutlineShape`}})))()}var q,J,Y;function X(){return(X=e((()=>{q=t(),c(),P(),K(),J=n(),Y=(0,q.memo)(function(e){let{x:t,y:n,groupOf:r,colors:i,scaleX:a,scaleY:o,size:s=O,minimumPoints:c=3,opacities:l,fillOpacity:u}=e,d=M({scores:A([t,n]),groupOf:r,groups:i.length,axes:2,size:s,minimumPoints:c}),f=[];for(let e=0;e<i.length;e++){let t=i[e];if(t===void 0)continue;let n=N(d,e,0,1);if(n===null)continue;let r={color:t,opacity:l?.[e],fillOpacity:u};f.push(z(e,n,a,o,r))}return(0,J.jsx)(`g`,{"data-layer":`ellipses`,children:f})}),Y.__docgenInfo={description:`One outline per group, drawn through both scales.

The outline is measured in the data's own units and drawn in pixels, and the
two axes almost never carry the same number of units per pixel — so scaling
the two radii and keeping the data-space angle would draw an ellipse of the
wrong shape at the wrong tilt. \`scatterOutlineShape\` transforms the spread
first and decomposes it after, which is exact on a linear axis.

The outlines are drawn under the dots, which is what lets the region be
filled at all: the fill says where a group sits without taking the dots the
reader is there to count.
@param props - See {@link ScatterEllipseLayerProps}.
@returns The outlines.`,methods:[],displayName:`ScatterEllipseLayer`,props:{x:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Horizontal coordinate of every point, in data units.`},y:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Vertical coordinate of every point, in the same order.`},groupOf:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:"Which group each point belongs to, as an index into `colors`. A point with\n`-1`, or an index outside the range, is left out of every outline."},colors:{required:!0,tsType:{name:`unknown`},description:`The colour of each group, in group order.`},scaleX:{required:!0,tsType:{name:`ChartScale`},description:`Data to pixels, horizontally.`},scaleY:{required:!0,tsType:{name:`ChartScale`},description:"Data to pixels, vertically; its `factor` is negative."},size:{required:!1,tsType:{name:`union`,raw:`EllipseCoverageSize | EllipseStandardDeviationSize`,elements:[{name:`EllipseCoverageSize`},{name:`EllipseStandardDeviationSize`}]},description:`How much of each group its outline holds.
@default { kind: 'coverage', probability: 0.95 }`},minimumPoints:{required:!1,tsType:{name:`number`},description:`How many points a group needs before it is outlined at all. Below it the
shape says more about the sample than about the group. A caption that has
to account for the groups left out reads them from \`scatterSkippedGroups\`,
over a \`scatterGroupSpread\` of the same points, size and minimum.
@default 3`},opacities:{required:!1,tsType:{name:`unknown`},description:`How strongly each outline is drawn, in group order.
@default undefined — every outline is drawn at full strength`},fillOpacity:{required:!1,tsType:{name:`number`},description:`How solid each region is; \`0\` draws nothing at all, since the fill is the
whole outline. Turn it down when many groups overlap, since the fills
compound.
@default SCATTER_OUTLINE_FILL_OPACITY`}}}})))()}function ce(e){let{x:t,y:n,width:r,height:i,xAxis:a,yAxis:o}=e,{viewport:s,onViewportChange:c,wheelZoom:l=!1}=e,{wheelZoomDelay:d}=e,[f,p]=(0,Z.useState)(null),m=s===void 0?f:s,g=(0,Z.useMemo)(()=>({x:le(a),y:le(o)}),[a,o]),_=(0,Z.useMemo)(()=>m===null?{x:a,y:o}:{x:{...a,domain:m.x,nice:!1},y:{...o,domain:m.y,nice:!1}},[m,a,o]),y=(0,Z.useMemo)(()=>v(t,n,r,i,_.x,_.y),[t,n,r,i,_]),b=(0,Z.useCallback)(e=>{s===void 0&&p(e),c?.(e)},[c,s]),x=(0,Z.useCallback)(()=>{m!==null&&b(null)},[b,m]),S=u({enabled:l,delay:d,onZoom:(e,t,n)=>{b(C(g,m,e,t,n))}}),ee=(0,Z.useMemo)(()=>{if(m===null)return;let{points:e,rect:t}=y;return h(e,{minX:t.x,minY:t.y,maxX:t.x+t.width,maxY:t.y+t.height})},[m,y]);return{...y,xAxis:_.x,yAxis:_.y,viewport:m,inside:ee,ref:S.ref,reset:x}}function le(e){return r(e.domain[0],e.domain[1],{count:e.tickCount,nice:e.nice}).domain}var Z;function ue(){return(ue=e((()=>{Z=t(),a(),b(),k(),S()})))()}function Q(e){let{x:t,y:n,width:r,height:i,xAxis:a,yAxis:o,groupOf:s,groups:c}=e,{mutedGroups:l,ellipse:u=null,ellipseMinimumPoints:d}=e,{ellipseFillOpacity:f,showGroupMeans:h,markers:g}=e,{pointRadius:v=3.5,outlinedFrom:b,pointLabels:x}=e,{showGroupLabels:S=!1,selected:C,defaultSelected:te}=e,{onSelectionChange:w,selectMode:T,onHoverChange:E,onPinChange:D}=e,{onPointDoubleClick:O,onLassoChange:k,touchLasso:A,viewport:j}=e,{onViewportChange:M,wheelZoom:N,wheelZoomDelay:P,overlay:oe}=e,{label:se,className:F,testId:I}=e,L=ce({x:t,y:n,width:r,height:i,xAxis:a,yAxis:o,viewport:j,onViewportChange:M,wheelZoom:N,wheelZoomDelay:P}),{points:R,rect:z,toX:B,toY:V,inside:H,geometry:U}=L,{ref:W,reset:G}=L,K=(0,de.useMemo)(()=>ie(c,l),[c,l]),q=ee(R,{pointLabels:x,showGroupLabels:S,groups:c,groupOf:s,colors:K.colors,radius:v,bounds:z}),J=y({points:R,originX:z.x,originY:z.y,selected:C,defaultSelected:te,onSelectionChange:w,selectMode:T,touchLasso:A,included:H,hoverRadius:v+8,onHoverChange:E,onPinChange:D,onLassoChange:k});function X(e){let t=J.openAt(e);if(t===null||O===void 0){G();return}O(t)}return(0,$.jsx)(ae,{width:r,height:i,x:L.xAxis,y:L.yAxis,geometry:U,busy:J.lasso.drawing,overlay:oe,className:F,testId:I,label:se??ne(a,o,R.x.length),children:()=>(0,$.jsxs)($.Fragment,{children:[u===null||s===void 0?null:(0,$.jsx)(Y,{x:t,y:n,groupOf:s,colors:K.colors,opacities:K.opacities,scaleX:B,scaleY:V,size:u,minimumPoints:d,fillOpacity:f}),(0,$.jsx)(m,{points:R,groupOf:s,colors:K.colors,opacities:K.opacities,radius:v,outlinedFrom:b}),(0,$.jsx)(p,{points:R,selected:J.selection.mask,hovered:J.hover.hovered,focused:J.keyboard.cursor,radius:v,groupOf:s,colors:K.colors,showGroupMeans:h,marks:_(g,B,V)}),(0,$.jsx)(re,{labels:q,radius:v,lassoPath:J.lasso.pathData}),(0,$.jsx)(`rect`,{...z,ref:W,fill:`transparent`,tabIndex:0,onKeyDown:J.keyboard.onKeyDown,onDoubleClick:X,...J.surface})]})})}var de,$;function fe(){return(fe=e((()=>{de=t(),j(),X(),E(),g(),te(),S(),ue(),w(),T(),$=n(),Q.__docgenInfo={description:`A cloud of points with a lasso, group outlines and a hover card.

It knows nothing about what produced the coordinates, so the same component
draws a scores map, a k-means result and a UMAP embedding. The point layer
carries no event handlers at all — one transparent rectangle takes every
gesture and the hit tests run over a coordinate array — which is what keeps
two thousand dots inside a frame and what would let a canvas replace the
layer without touching anything else.
@param props - See {@link ScatterPlotProps}.
@returns The plot.`,methods:[],displayName:`ScatterPlot`,props:{groupOf:{required:!1,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:"Which group each point belongs to, as an index into `groups`. A point with\n`-1`, `NaN`, or an index outside the range, is drawn in the muted ink and\nleft out of every outline.\n@default undefined — every point is one crowd"},groups:{required:!1,tsType:{name:`unknown`},description:`The groups, in the order they are coloured and listed.
@default undefined`},mutedGroups:{required:!1,tsType:{name:`ReadonlySet`,elements:[{name:`string`}],raw:`ReadonlySet<string>`},description:`Which groups are drawn faint, by id — what a legend entry switches.
@default undefined — every group is drawn in full`},pointRadius:{required:!1,tsType:{name:`number`},description:`Radius of a dot, in pixels. A cloud draws the dot at the middle of its box
at this size, one at the front larger and one at the back smaller.
@default 3.5`},outlinedFrom:{required:!1,tsType:{name:`number`},description:`The index from which points are drawn as outlines rather than filled.

It is how a sample the model was built from is told from one placed into
it afterwards: the first kind helped choose where the axes point and is
bound to sit somewhere reasonable, while the second can land anywhere.
Points before it are filled, points from it on are hollow.
@default undefined — every point is filled`},pointLabels:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]}],raw:`ReadonlyArray<string | undefined>`},description:`What each point is called, written beside its own dot. A point whose entry
is \`undefined\` is left unnamed, so a caller may label the twenty samples
it cares about and leave the crowd alone.

Names are placed so that no two overlap: one that cannot be fitted near
its own dot is moved aside with a line back to it, and one with nowhere
left to go is dropped rather than written over another.
@default undefined — no point is named`},showGroupLabels:{required:!1,tsType:{name:`boolean`},description:"Whether each group's name is written once, over the middle of that group.\nIt needs `groupOf` and `groups`, since it is their names it writes. They\nare placed like `pointLabels`, biggest group first, so the name that\nspeaks for the most samples keeps the middle of its own crowd.\n@default false"},selected:{required:!1,tsType:{name:`unknown`},description:`The selected rows. Present, the caller owns the selection; the outline
drawn while a lasso is being dragged stays inside the component either
way, so a controlled parent is never asked to re-render sixty times a
second.
@default undefined — the figure keeps its own`},defaultSelected:{required:!1,tsType:{name:`unknown`},description:`The rows selected before the reader touches anything.
@default undefined — nothing is selected`},onSelectionChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(change: SelectionChange) => void`,signature:{arguments:[{type:{name:`SelectionChange`},name:`change`}],return:{name:`void`}}},description:`Called when a lasso is released, a dot is clicked, or the keyboard commits
— never while a lasso is being drawn, and never while a cloud is turned.
@default undefined`},selectMode:{required:!1,tsType:{name:`union`,raw:`'replace' | 'add' | 'remove'`,elements:[{name:`literal`,value:`'replace'`},{name:`literal`,value:`'add'`},{name:`literal`,value:`'remove'`}]},description:`What a gesture does to the selection when no modifier is held. Shift
always adds and Alt always removes, whatever this says.
@default 'replace'`},onHoverChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:`Called with the row under the pointer, or \`-1\` when the pointer is on
none.
@default undefined`},onPinChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:"Called with the row whose card the reader pinned, or `-1`.\n@default undefined"},onPointDoubleClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(point: ScatterPointOpen) => void`,signature:{arguments:[{type:{name:`ScatterPointOpen`},name:`point`}],return:{name:`void`}}},description:`Called when the reader double-clicks a point: the gesture for "tell me
more about this one", or "let me change it".

A double click is also two clicks, so the point is selected first and its
card pinned. That is deliberate: the alternative is to hold every single
click for the length of the double-click interval before acting on it, and
clicking a dot is the commonest gesture in the figure — making it feel
slow to save a redundant selection on the rarest one is the wrong trade.
On a cloud it fires whichever gesture a drag is set to, since a double
click is not a drag.
@default undefined`},onLassoChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(drawing: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`drawing`}],return:{name:`void`}}},description:`Called when a lasso starts being drawn and again when it ends, and never
in between.

The floating chrome reads the drag from the overlay surface instead, which
costs the caller nothing. This is for the piece of chrome that has to say
what letting go will do while sitting *outside* the figure — a caption in
the flow beneath it, which cannot reach that surface.
@default undefined`},wheelZoomDelay:{required:!1,tsType:{name:`number`},description:`How long the pointer has to rest over the figure before the wheel is
caught, in milliseconds.
@default CHART_WHEEL_DWELL`},overlay:{required:!1,tsType:{name:`ReactNode`},description:`What floats over the figure — an \`OverlayBar\`, a legend, a caption, a
readout.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`What a screen reader is told the figure shows.
@default a sentence built from the axis names and the point count`},className:{required:!1,tsType:{name:`string`},description:`A class for the figure's outermost element, for a site placing it.
@default undefined`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the wrapper.\n@default undefined"},x:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Horizontal coordinate of every point, in data units.`},y:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Vertical coordinate of every point, in the same order.`},width:{required:!0,tsType:{name:`number`},description:"Total width, in pixels, from `useContainerSize`."},height:{required:!0,tsType:{name:`number`},description:`Total height.`},xAxis:{required:!0,tsType:{name:`ChartAxisSpec`},description:`The horizontal axis.`},yAxis:{required:!0,tsType:{name:`ChartAxisSpec`},description:`The vertical axis.`},ellipse:{required:!1,tsType:{name:`union`,raw:`EllipseSize | null`,elements:[{name:`union`,raw:`EllipseCoverageSize | EllipseStandardDeviationSize`,elements:[{name:`EllipseCoverageSize`},{name:`EllipseStandardDeviationSize`}]},{name:`null`}]},description:"How large the group outlines are, or `null` for none.\n@default null"},ellipseMinimumPoints:{required:!1,tsType:{name:`number`},description:`How many points a group needs before it is outlined at all. Below it the
shape says more about the sample than about the group.
@default 3`},ellipseFillOpacity:{required:!1,tsType:{name:`number`},description:`How solid each group outline is; \`0\` draws nothing at all, since the fill
is the whole outline. Turn it down when many groups overlap, since the
fills compound where two of them cross.
@default SCATTER_OUTLINE_FILL_OPACITY`},showGroupMeans:{required:!1,tsType:{name:`boolean`},description:`Whether each group's average is marked with a cross.
@default false`},markers:{required:!1,tsType:{name:`unknown`},description:`Points drawn over the cloud that are not samples.
@default undefined`},touchLasso:{required:!1,tsType:{name:`boolean`},description:`Whether a drag on a touch screen draws a lasso rather than scrolling the
page. Off, because a chart that traps the page scroll on a phone is a
worse fault than a missing gesture.
@default false`},viewport:{required:!1,tsType:{name:`union`,raw:`ChartViewport | null`,elements:[{name:`ChartViewport`},{name:`null`}]},description:`The frame the plot is zoomed into, in data units. Present, the caller owns
the zoom; \`null\` shows the whole of both axes. A frame reaching outside
the axes is pulled back inside them — the reader can never zoom out past
the picture they started with. A double click on empty ground puts the
frame back around every point.
@default undefined — the plot keeps its own frame`},onViewportChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(viewport: ChartViewport | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`ChartViewport | null`,elements:[{name:`ChartViewport`},{name:`null`}]},name:`viewport`}],return:{name:`void`}}},description:`Called with the frame a wheel or a double click asks for, and with \`null\`
when it has reached back out to the whole of the data.
@default undefined`},wheelZoom:{required:!1,tsType:{name:`boolean`},description:`Whether the wheel zooms about the pointer, once the pointer has rested
over the plot for \`wheelZoomDelay\`. Off, because a figure set in a page of
prose must not take the reader's scroll on their way past it; a figure
given a panel of its own should turn it on.
@default false`}}}})))()}export{P as a,z as i,fe as n,M as o,K as r,N as s,Q as t};