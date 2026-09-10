import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CsLeyY0n.js";import{$ as r,K as i,Q as a,ht as o,pt as s,q as c}from"./projectionFixtures-C270vcgA.js";import{n as l,t as u}from"./ChartFrame-DEpkeZ0N.js";import{A as d,C as f,E as p,M as m,N as h,_ as g,b as _,d as v,f as y,g as b,h as ee,j as te,k as ne,l as re,m as x,n as ie,p as ae,t as S,u as oe,v as se,y as ce}from"./useScatterInteraction-8-8_KjXC.js";function le(e){return Number.isFinite(e)?e<=0?0:1-Math.exp(-(e*e)/2):+(e>0)}function ue(e){return!Number.isFinite(e)||e<=0?0:e>=1?1/0:Math.sqrt(-2*Math.log(1-e))}function C(){return(C=e((()=>{})))()}function de(e,t={}){let{size:n={kind:`coverage`,probability:.95},minimumPoints:r=3}=t,i=0,a=0,o=0;for(let t of e)!Number.isFinite(t.x)||!Number.isFinite(t.y)||(i++,a+=t.x,o+=t.y);if(i<Math.max(2,r))return null;let s=a/i,c=o/i,l=0,u=0,d=0;for(let t of e){if(!Number.isFinite(t.x)||!Number.isFinite(t.y))continue;let e=t.x-s,n=t.y-c;l+=e*e,u+=e*n,d+=n*n}let f=i-1,p={xx:l/f,xy:u/f,yy:d/f};if(!Number.isFinite(s)||!Number.isFinite(c)||!Number.isFinite(p.xx)||!Number.isFinite(p.xy)||!Number.isFinite(p.yy))return null;let{rx:m,ry:h,angle:g}=w(p,E(n));return!Number.isFinite(m)||!Number.isFinite(h)?null:{cx:s,cy:c,rx:m,ry:h,angle:g,count:i,covariance:p}}function w(e,t=1){let{xx:n,xy:r,yy:i}=e,a=(n+i)/2,o=(n-i)/2,s=Math.hypot(o,r),c=a+s,l=a-s;return l>c*D||(l=0),{rx:t*Math.sqrt(c),ry:t*Math.sqrt(l),angle:T(n,r,i,c)}}function T(e,t,n,r){if(t===0)return e>=n?0:Math.PI/2;let i=Math.atan2(r-e,t);return i>Math.PI/2?i-Math.PI:i}function E(e){return e.kind===`standardDeviations`?Math.max(e.standardDeviations,0):ue(e.probability)}var D;function O(){return(O=e((()=>{D=1e-12})))()}function fe(e,t,n){let r=Math.cos(e.angle),i=Math.sin(e.angle),a=e.rx*e.rx,o=e.ry*e.ry,s=a*r*r+o*i*i,c=(a-o)*r*i,l=a*i*i+o*r*r,u=t.factor*n.factor,d=w({xx:t.factor*t.factor*s,xy:u*c,yy:n.factor*n.factor*l}),f={cx:t.offset+e.cx*t.factor,cy:n.offset+e.cy*n.factor,rx:d.rx,ry:d.ry,angleDegrees:d.angle*k/Math.PI};return!Number.isFinite(f.cx)||!Number.isFinite(f.cy)||!Number.isFinite(f.rx)||!Number.isFinite(f.ry)||!Number.isFinite(f.angleDegrees)?null:f}function pe(e,t=A){let n=Number.isFinite(t)?Math.max(j,Math.floor(t)):A,r=Math.cos(e.angle),i=Math.sin(e.angle),a=Array(n);for(let t=0;t<n;t++){let o=2*Math.PI*t/n,s=e.rx*Math.cos(o),c=e.ry*Math.sin(o);a[t]={x:e.cx+s*r-c*i,y:e.cy+s*i+c*r}}return a}var k,A,j;function M(){return(M=e((()=>{O(),k=180,A=64,j=3})))()}function N(e,t,n,r,i){let a=fe(t,n,r);return a===null?F(e,t,n,r,i):P(e,a,i)}function P(e,t,n){let{cx:r,cy:i,rx:a,ry:o,angleDegrees:s}=t,c={"data-group":e,opacity:n.opacity};if(o>0)return(0,L.jsx)(`ellipse`,{...c,...I(n),cx:B(r),cy:B(i),rx:B(a),ry:B(o),transform:`rotate(${B(s)} ${B(r)} ${B(i)})`},e);let l=s*Math.PI/z,u=a*Math.cos(l),d=a*Math.sin(l);return(0,L.jsx)(`line`,{...c,fill:`none`,stroke:n.color,strokeWidth:R,x1:B(r-u),y1:B(i-d),x2:B(r+u),y2:B(i+d)},e)}function F(e,t,n,r,i){let a=pe(t),o=``;for(let e=0;e<a.length;e++){let t=a[e];if(t===void 0)continue;let i=B(n.offset+t.x*n.factor),s=B(r.offset+t.y*r.factor);o+=`${e===0?`M`:`L`}${i} ${s}`}return(0,L.jsx)(`path`,{"data-group":e,d:o===``?o:`${o}Z`,opacity:i.opacity,...I(i)},e)}function I(e){let t=e.fillOpacity??.1;return t>0?{fill:e.color,fillOpacity:t}:{fill:`none`}}var L,R,z,B;function V(){return(V=e((()=>{M(),L=n(),R=1.5,z=180,B=e=>Math.round(e*100)/100,N.__docgenInfo={description:`One group outline, mapped onto a plot and ready to be drawn.

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
@returns The element, keyed by group.`,methods:[],displayName:`scatterOutlineShape`}})))()}function H(e,t,n,r){let i=Array(r);for(let e=0;e<r;e++)i[e]=[];let a=Math.min(e.length,t.length,n.length);for(let o=0;o<a;o++){let a=n[o];if(a===void 0||a<0||a>=r)continue;let s=e[o],c=t[o];s!==void 0&&c!==void 0&&i[a]?.push({x:s,y:c})}return i}function U(e,t){let n=(0,W.useRef)(``),r=e.join(` `);(0,W.useEffect)(()=>{n.current!==r&&(n.current=r,t?.(e))})}var W,G,K,q;function J(){return(J=e((()=>{W=t(),O(),V(),G=n(),K=(0,W.memo)(function(e){let{x:t,y:n,groupOf:r,colors:i,scaleX:a,scaleY:o,size:s=q,minimumPoints:c=3,opacities:l,fillOpacity:u,onSkippedGroups:d}=e,f=H(t,n,r,i.length),p=[],m=[];for(let e=0;e<f.length;e++){let t=i[e],n=f[e];if(t===void 0||n===void 0)continue;let r=de(n,{size:s,minimumPoints:c});if(r===null){m.push(e);continue}let d={color:t,opacity:l?.[e],fillOpacity:u};p.push(N(e,r,a,o,d))}return U(m,d),(0,G.jsx)(`g`,{"data-layer":`ellipses`,children:p})}),q={kind:`coverage`,probability:.95},K.__docgenInfo={description:`One outline per group, drawn through both scales.

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
shape says more about the sample than about the group.
@default 3`},opacities:{required:!1,tsType:{name:`unknown`},description:`How strongly each outline is drawn, in group order.
@default undefined — every outline is drawn at full strength`},fillOpacity:{required:!1,tsType:{name:`number`},description:`How solid each region is; \`0\` draws nothing at all, since the fill is the
whole outline. Turn it down when many groups overlap, since the fills
compound.
@default SCATTER_OUTLINE_FILL_OPACITY`},onSkippedGroups:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(groups: readonly number[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`groups`}],return:{name:`void`}}},description:`Called with the groups too small to outline, as indices into \`colors\`,
whenever that set changes. An outline that quietly fails to appear reads
as a bug in the plot, so the caller is handed what its caption has to
account for.
@default undefined`}}}})))()}function me(e,t){return e===void 0||!Number.isFinite(e)?t:Math.max(0,Math.floor(e))}function he(e,t,n){let r=e?.length??0,i=[n],a=[void 0];for(let o=0;o<r;o++){i.push(e?.[o]??n);let r=t?.[o]??1;a.push(r===1?void 0:r)}return{colors:i,opacities:a}}var ge,Y,X,_e,ve;function ye(){return(ye=e((()=>{ge=t(),Y=n(),X=(0,ge.memo)(function(e){let{points:t,groupOf:n,colors:r,opacities:i,fallbackColor:a=`var(--text-faint)`,radius:o=3.5,outlinedFrom:s}=e,c=t.x,l=t.y,u=Math.min(c.length,l.length),d=me(s,u),f=he(r,i,a),p=[];for(let e=0;e<u;e++){let t=c[e],r=l[e];if(t===void 0||r===void 0)break;if(!Number.isFinite(t)||!Number.isFinite(r))continue;let i=(n?.[e]??-1)+1,s=f.colors[i]??a,u=e>=d;p.push((0,Y.jsx)(`circle`,{cx:ve(t),cy:ve(r),r:o,fill:u?`none`:s,stroke:u?s:void 0,strokeWidth:u?_e:void 0,opacity:f.opacities[i]},e))}return(0,Y.jsx)(`g`,{"data-layer":`points`,children:p})}),_e=1.5,ve=e=>Math.round(e*100)/100,X.__docgenInfo={description:`Every sample as one dot, and nothing else.

It carries no event handler, no closure per point and no state: the gestures
all land on one transparent rectangle above it and are answered from a
coordinate array. That is what keeps two thousand dots inside a frame, and
it is the whole reason this layer could be swapped for a canvas one day
without a single other file changing.

A hollow dot is the same dot at the same radius with its colour moved from
the fill to the stroke, so the two read as one kind of thing seen at two
levels of confidence rather than as two unrelated marks.
@param props - See {@link ScatterPointLayerProps}.
@returns The cloud.`,methods:[],displayName:`ScatterPointLayer`,props:{points:{required:!0,tsType:{name:`ScreenPoints`},description:`Where every point already sits, in the frame's pixels. The layer never
sees a data value, which is what lets a zoom, a resize and a change of
axis all arrive here as the same thing.`},groupOf:{required:!1,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:"Which group each point belongs to, as an index into `colors`. An entry of\n`-1`, or one outside the range, is a point in no group.\n@default undefined — every point is one crowd"},colors:{required:!1,tsType:{name:`unknown`},description:"The colour of each group, in the order the groups were given.\n@default undefined — every point takes `fallbackColor`"},opacities:{required:!1,tsType:{name:`unknown`},description:`How strongly each group is drawn, in the same order. This is what a
legend entry switching a group off actually changes — the dots stay where
they are, so the reader can still see the shape they are hiding.
@default undefined — every group is drawn at full strength`},fallbackColor:{required:!1,tsType:{name:`string`},description:`Colour of a point belonging to no group. It has to be the one ink on the
plot that names nothing, or a reader counts it as one more group.
@default 'var(--text-faint)'`},radius:{required:!1,tsType:{name:`number`},description:`Radius of a dot, in pixels.
@default 3.5`},outlinedFrom:{required:!1,tsType:{name:`number`},description:`The index from which points are drawn as outlines rather than filled.

It is how a sample the model was built from is told from one placed into
it afterwards: the first kind helped choose where the axes point and is
bound to sit somewhere reasonable, while the second can land anywhere.
Points before it are filled, points from it on are hollow.
@default undefined — every point is filled`}}}})))()}function be(e){let{x:t,y:n,width:r,height:i,xAxis:o,yAxis:s}=e,{viewport:l,onViewportChange:u,wheelZoom:d=!1}=e,{wheelZoomDelay:f}=e,[p,m]=(0,Z.useState)(null),h=l===void 0?p:l,g=(0,Z.useMemo)(()=>({x:xe(o),y:xe(s)}),[o,s]),_=(0,Z.useMemo)(()=>h===null?{x:o,y:s}:{x:{...o,domain:h.x,nice:!1},y:{...s,domain:h.y,nice:!1}},[h,o,s]),v=(0,Z.useMemo)(()=>x(t,n,r,i,_.x,_.y),[t,n,r,i,_]),y=(0,Z.useCallback)(e=>{l===void 0&&m(e),u?.(e)},[u,l]),b=(0,Z.useCallback)(()=>{h!==null&&y(null)},[y,h]),ee=c({enabled:d,delay:f,onZoom:(e,t,n)=>{let r=h??g;y(a(g,h,Se(r.x,e),Se(r.y,1-t),n))}}),te=(0,Z.useMemo)(()=>{if(h===null)return;let{points:e,rect:t}=v;return re(e,{minX:t.x,minY:t.y,maxX:t.x+t.width,maxY:t.y+t.height})},[h,v]);return{...v,xAxis:_.x,yAxis:_.y,viewport:h,inside:te,ref:ee.ref,reset:b}}function xe(e){return s(e.domain[0],e.domain[1],{count:e.tickCount,nice:e.nice}).domain}function Se(e,t){return e[0]+t*(e[1]-e[0])}var Z;function Ce(){return(Ce=e((()=>{Z=t(),o(),r(),i(),v()})))()}function we(e){let{x:t,y:n,width:r,height:i,xAxis:a,yAxis:o,groupOf:s,groups:c,mutedGroups:l,ellipse:d=null,ellipseMinimumPoints:f,ellipseFillOpacity:m,showGroupMeans:h,markers:v,pointRadius:b=3.5,outlinedFrom:re,pointLabels:x,showGroupLabels:S=!1,selected:ce,defaultSelected:le,onSelectionChange:ue,selectMode:C,onHoverChange:de,onPinChange:w,onPointDoubleClick:T,onLassoChange:E,touchLasso:D,viewport:O,onViewportChange:fe,wheelZoom:pe,wheelZoomDelay:k,overlay:A,label:j,testId:M}=e,N=be({x:t,y:n,width:r,height:i,xAxis:a,yAxis:o,viewport:O,onViewportChange:fe,wheelZoom:pe,wheelZoomDelay:k}),{points:P,rect:F,toX:I,toY:L,inside:R,ref:z,reset:B}=N,V=(0,Q.useMemo)(()=>y(c,l),[c,l]),H=(0,Q.useMemo)(()=>x===void 0?void 0:_(se(P,x,{groupOf:s,colors:V.colors}),{fontSize:10,radius:b,bounds:F}),[P,x,s,V.colors,b,F]),U=(0,Q.useMemo)(()=>S&&c!==void 0?_(g(P,c.map(e=>e.label),{groupOf:s,colors:V.colors}),{fontSize:12,bold:!0,centered:!0,radius:b,bounds:F}):void 0,[P,S,c,s,V.colors,b,F]),W=ie({points:P,originX:F.x,originY:F.y,selected:ce,defaultSelected:le,onSelectionChange:ue,selectMode:C,touchLasso:D,included:R,hoverRadius:b+8,onHoverChange:de,onPinChange:w});function G(e){let t=p(e,F.x,F.y),n=W.pointAt(t.x,t.y);if(n===-1||T===void 0){B();return}T({index:n,x:t.x,y:t.y,clientX:e.clientX,clientY:e.clientY})}let q=(0,Q.useRef)(E);(0,Q.useLayoutEffect)(()=>{q.current=E});let J=W.lasso.drawing;return(0,Q.useEffect)(()=>{q.current?.(J)},[J]),(0,$.jsx)(u,{width:r,height:i,x:N.xAxis,y:N.yAxis,busy:J,overlay:A,testId:M,label:j??ee(a,o,P.x.length),children:()=>(0,$.jsxs)($.Fragment,{children:[d===null||s===void 0?null:(0,$.jsx)(K,{x:t,y:n,groupOf:s,colors:V.colors,opacities:V.opacities,scaleX:I,scaleY:L,size:d,minimumPoints:f,fillOpacity:m}),(0,$.jsx)(X,{points:P,groupOf:s,colors:V.colors,opacities:V.opacities,radius:b,outlinedFrom:re}),(0,$.jsx)(ne,{points:P,selected:W.selection.mask,hovered:W.hover.hovered,focused:W.keyboard.cursor,radius:b,groupOf:s,colors:V.colors,showGroupMeans:h,marks:ae(v,I,L)}),H===void 0?null:(0,$.jsx)(te,{labels:H,radius:b}),U===void 0?null:(0,$.jsx)(te,{labels:U,radius:b,strong:!0}),W.lasso.pathData===``?null:(0,$.jsx)(`path`,{d:W.lasso.pathData,...oe}),(0,$.jsx)(`rect`,{...F,ref:z,fill:`transparent`,tabIndex:0,onKeyDown:W.keyboard.onKeyDown,onDoubleClick:G,...W.surface})]})})}var Q,$;function Te(){return(Te=e((()=>{Q=t(),l(),J(),m(),d(),ye(),f(),h(),ce(),b(),v(),Ce(),S(),$=n(),we.__docgenInfo={description:`A cloud of points with a lasso, group outlines and a hover card.

It knows nothing about what produced the coordinates, so the same component
draws a scores map, a k-means result and a UMAP embedding. The point layer
carries no event handlers at all — one transparent rectangle takes every
gesture and the hit tests run over a coordinate array — which is what keeps
two thousand dots inside a frame and what would let a canvas replace the
layer without touching anything else.
@param props - See {@link ScatterPlotProps}.
@returns The plot.`,methods:[],displayName:`ScatterPlot`,props:{x:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Horizontal coordinate of every point, in data units.`},y:{required:!0,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:`Vertical coordinate of every point, in the same order.`},width:{required:!0,tsType:{name:`number`},description:"Total width, in pixels, from `useContainerSize`."},height:{required:!0,tsType:{name:`number`},description:`Total height.`},xAxis:{required:!0,tsType:{name:`ChartAxisSpec`},description:`The horizontal axis.`},yAxis:{required:!0,tsType:{name:`ChartAxisSpec`},description:`The vertical axis.`},groupOf:{required:!1,tsType:{name:`ArrayLike`,elements:[{name:`number`}],raw:`ArrayLike<number>`},description:"Which group each point belongs to, as an index into `groups`. A point with\n`-1`, or an index outside the range, is drawn in the muted ink and left\nout of every outline.\n@default undefined — every point is one crowd"},groups:{required:!1,tsType:{name:`unknown`},description:`The groups, in the order they are coloured and listed.
@default undefined`},mutedGroups:{required:!1,tsType:{name:`ReadonlySet`,elements:[{name:`string`}],raw:`ReadonlySet<string>`},description:`Which groups are drawn faint, by id — what a legend entry switches.
@default undefined — every group is drawn in full`},ellipse:{required:!1,tsType:{name:`union`,raw:`EllipseSize | null`,elements:[{name:`union`,raw:`EllipseCoverageSize | EllipseStandardDeviationSize`,elements:[{name:`EllipseCoverageSize`},{name:`EllipseStandardDeviationSize`}]},{name:`null`}]},description:"How large the group outlines are, or `null` for none.\n@default null"},ellipseMinimumPoints:{required:!1,tsType:{name:`number`},description:`How many points a group needs before it is outlined at all. Below it the
shape says more about the sample than about the group.
@default 3`},ellipseFillOpacity:{required:!1,tsType:{name:`number`},description:`How solid each group outline is; \`0\` draws nothing at all, since the fill
is the whole outline. Turn it down when many groups overlap, since the
fills compound where two of them cross.
@default SCATTER_OUTLINE_FILL_OPACITY`},showGroupMeans:{required:!1,tsType:{name:`boolean`},description:`Whether each group's average is marked with a cross.
@default false`},markers:{required:!1,tsType:{name:`unknown`},description:`Points drawn over the cloud that are not samples.
@default undefined`},pointRadius:{required:!1,tsType:{name:`number`},description:`Radius of a dot, in pixels.
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
@default undefined — the plot keeps its own`},defaultSelected:{required:!1,tsType:{name:`unknown`},description:`The rows selected before the reader touches anything.
@default undefined — nothing is selected`},onSelectionChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(change: SelectionChange) => void`,signature:{arguments:[{type:{name:`SelectionChange`},name:`change`}],return:{name:`void`}}},description:`Called when a lasso is released, a dot is clicked, or the keyboard commits
— never while a lasso is being drawn.
@default undefined`},selectMode:{required:!1,tsType:{name:`union`,raw:`'replace' | 'add' | 'remove'`,elements:[{name:`literal`,value:`'replace'`},{name:`literal`,value:`'add'`},{name:`literal`,value:`'remove'`}]},description:`What a drag does to the selection when no modifier is held. Shift always
adds and Alt always removes, whatever this says.
@default 'replace'`},onHoverChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:`Called with the row under the pointer, or \`-1\` when the pointer is on
none.
@default undefined`},onPinChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:"Called with the row whose card the reader pinned, or `-1`.\n@default undefined"},onPointDoubleClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(point: ScatterPointOpen) => void`,signature:{arguments:[{type:{name:`ScatterPointOpen`},name:`point`}],return:{name:`void`}}},description:`Called when the reader double-clicks a point: the gesture for "tell me
more about this one", or "let me change it".

A double click is also two clicks, so the point is selected first and its
card pinned. That is deliberate: the alternative is to hold every single
click for the length of the double-click interval before acting on it, and
clicking a dot is the commonest gesture in the figure — making it feel
slow to save a redundant selection on the rarest one is the wrong trade.

A double click on empty ground is not this. It puts the frame back around
every point, which is the only way out of a zoom, and it keeps doing that
whether or not this is given.
@default undefined — a double click only ever resets the frame`},onLassoChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(drawing: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`drawing`}],return:{name:`void`}}},description:`Called when a lasso starts being drawn and again when it ends, and never
in between.

The floating chrome reads the drag from the overlay surface instead, which
costs the caller nothing. This is for the piece of chrome that has to say
what letting go will do while sitting *outside* the plot — a caption in the
flow beneath it, which cannot reach that surface and must not cover the
axis title to get at it.
@default undefined`},touchLasso:{required:!1,tsType:{name:`boolean`},description:`Whether a drag on a touch screen draws a lasso rather than scrolling the
page. Off, because a chart that traps the page scroll on a phone is a
worse fault than a missing gesture.
@default false`},viewport:{required:!1,tsType:{name:`union`,raw:`ChartViewport | null`,elements:[{name:`ChartViewport`},{name:`null`}]},description:`The frame the plot is zoomed into, in data units. Present, the caller owns
the zoom; \`null\` shows the whole of both axes. A frame reaching outside
the axes is pulled back inside them — the reader can never zoom out past
the picture they started with.
@default undefined — the plot keeps its own frame`},onViewportChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(viewport: ChartViewport | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`ChartViewport | null`,elements:[{name:`ChartViewport`},{name:`null`}]},name:`viewport`}],return:{name:`void`}}},description:`Called with the frame a wheel or a double click asks for, and with \`null\`
when it has reached back out to the whole of the data.
@default undefined`},wheelZoom:{required:!1,tsType:{name:`boolean`},description:`Whether the wheel zooms about the pointer, once the pointer has rested
over the plot for \`wheelZoomDelay\`. Off, because a figure set in a page of
prose must not take the reader's scroll on their way past it; a figure
given a panel of its own should turn it on.
@default false`},wheelZoomDelay:{required:!1,tsType:{name:`number`},description:`How long the pointer has to rest over the plot before the wheel is caught,
in milliseconds.
@default CHART_WHEEL_DWELL`},overlay:{required:!1,tsType:{name:`ReactNode`},description:`What floats over the plot — an \`OverlayBar\`, a legend, a caption, a
readout.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`What a screen reader is told the plot shows.
@default a sentence built from the two axis titles and the point count`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the wrapper.\n@default undefined"}}}})))()}export{J as a,w as c,le as d,C as f,ye as i,E as l,Te as n,V as o,Ce as r,N as s,we as t,O as u};