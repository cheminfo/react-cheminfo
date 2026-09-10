import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CsLeyY0n.js";import{g as r,h as i,n as a,o,r as s,s as c}from"./projectionFixtures-C270vcgA.js";import{B as l,M as u,R as d,T as f,c as p,g as m,r as h,t as g}from"./OverlayToggle-BM9hXRtz.js";import{n as _,t as v}from"./ui-BmP4LS2T.js";import{t as y}from"./ScatterPlot-rH2axkPg.js";import{t as b}from"./ui-Cco4631J.js";function x(e){return(0,j.jsx)(u,{placement:`below`,label:e.label,children:e.children})}function S(){let[e,t]=(0,A.useState)(`0`);return(0,j.jsx)(h,{label:`Across`,help:M,value:e,options:P,onChange:t})}function C(){let[e,t]=(0,A.useState)(`replace`);return(0,j.jsx)(p,{label:`Dragging`,value:e,options:L,onChange:t})}function w(){let[e,t]=(0,A.useState)(new Set);return(0,j.jsx)(j.Fragment,{children:a.map(n=>(0,j.jsx)(g,{label:n.label,swatch:n.color,checked:!e.has(n.id),onChange:()=>{let r=new Set(e);r.delete(n.id)||r.add(n.id),t(r)}},n.id))})}function T(){let[e,t]=(0,A.useState)(3.5);return(0,j.jsx)(m,{label:`Dot size`,help:N,value:e,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:t})}function E(){let[e,t]=(0,A.useState)(`sd2`),[n,r]=(0,A.useState)(3);return(0,j.jsxs)(f,{label:`Group outlines`,children:[(0,j.jsx)(p,{label:`Size`,value:e,options:I,onChange:t}),(0,j.jsx)(m,{label:`Least samples`,value:n,min:2,max:20,onChange:r})]})}function D(){let[e,t]=(0,A.useState)(`0`);return(0,j.jsxs)(j.Fragment,{children:[(0,j.jsx)(h,{label:`Across`,help:M,value:e,options:F,onChange:t}),(0,j.jsx)(m,{label:`Dot size`,value:3.5,min:1,max:12,step:.5,digits:1,unit:`px`,disabled:!0,onChange:k})]})}function O(){let[e,t]=(0,A.useState)(`species`),[n,i]=(0,A.useState)(3.5),[l,f]=(0,A.useState)(`replace`);return(0,j.jsx)(y,{x:o,y:c,width:720,height:420,xAxis:r(0),yAxis:r(1),groupOf:e===`species`?s:void 0,groups:e===`species`?a:void 0,pointRadius:n,overlay:(0,j.jsx)(u,{label:`Options`,more:(0,j.jsxs)(j.Fragment,{children:[(0,j.jsx)(m,{label:`Dot size`,help:N,value:n,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:i}),(0,j.jsx)(_,{}),(0,j.jsx)(p,{label:`Dragging`,value:l,options:L,onChange:f}),(0,j.jsx)(d,{text:`Reset view`,icon:`reset`,onClick:k})]}),children:(0,j.jsx)(p,{label:`Colour by`,value:e,options:R,onChange:t})})})}function k(){}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{A=t(),v(),b(),i(),j=n(),M={title:`Across`,body:`Which component is drawn left to right. A component already on the other axis stays in the list, greyed, so the reader can see that it exists.`},N={title:`Dot size`,body:`The radius of one flower, in pixels. Grow it for a sparse map, shrink it once the middle of the cloud is solid ink.`},P=[0,1,2,3].map(e=>({value:String(e),label:r(e).label??``})),F=P.map(e=>e.value===`1`?{...e,disabled:!0,title:`Already drawn on the other axis.`}:e),I=[{value:`none`,label:`None`},{value:`sd1`,label:`1 SD`},{value:`sd2`,label:`2 SD`},{value:`coverage`,label:`95% of samples`}],L=[{value:`replace`,label:`Replace`},{value:`add`,label:`Add`},{value:`remove`,label:`Remove`}],R=[{value:`species`,label:`Species`},{value:`none`,label:`Nothing`}],z={title:`Overlay/OverlayControls`,component:l,args:{label:`Colour by`,children:null},parameters:{layout:`padded`,docs:{description:{component:"The controls a floating card is built from. Every one of them is an `OverlayRow` — a caption, its help and the control they belong to — which is why a picker and a stepper standing side by side line up on one baseline and answer to one set of measurements. Reach for `OverlayRow` directly when you write a control this package does not have."}}}},B={render:()=>(0,j.jsx)(x,{label:`Axes`,children:(0,j.jsx)(S,{})})},V={render:()=>(0,j.jsx)(x,{label:`Dragging`,children:(0,j.jsx)(C,{})})},H={render:()=>(0,j.jsx)(x,{label:`Species`,children:(0,j.jsx)(w,{})})},U={render:()=>(0,j.jsx)(x,{label:`Dot size`,children:(0,j.jsx)(T,{})})},W={render:()=>(0,j.jsxs)(x,{label:`View`,children:[(0,j.jsx)(d,{text:`Zoom to selection`,icon:`zoom-to-fit`,onClick:k}),(0,j.jsx)(d,{text:`Reset view`,icon:`reset`,onClick:k})]})},G={render:()=>(0,j.jsx)(x,{label:`Outlines`,children:(0,j.jsx)(E,{})})},K={render:()=>(0,j.jsxs)(x,{label:`Options`,children:[(0,j.jsx)(C,{}),(0,j.jsx)(_,{}),(0,j.jsx)(T,{})]})},q={render:()=>(0,j.jsx)(x,{label:`Axes`,children:(0,j.jsx)(D,{})})},J={render:()=>(0,j.jsx)(O,{})},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Axes">
      <SelectDemo />
    </Card>
}`,...B.parameters?.docs?.source},description:{story:`The picker, for once the choices stop fitting side by side — past about four.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Dragging">
      <SegmentedDemo />
    </Card>
}`,...V.parameters?.docs?.source},description:{story:`The row of segments, while every choice still fits on one line. A reader who can see that a second view exists asks for it.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Species">
      <ToggleDemo />
    </Card>
}`,...H.parameters?.docs?.source},description:{story:`One thing on the figure turned on and off. It is a pressed button rather
than a checkbox so that the same control works as a legend entry: give it
the series' own colour and a row of them becomes the figure's key.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Dot size">
      <NumberDemo />
    </Card>
}`,...U.parameters?.docs?.source},description:{story:`A value the reader nudges rather than types — over a figure they are hunting for the size that makes the picture read, not entering a number.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="View">
      <OverlayAction text="Zoom to selection" icon="zoom-to-fit" onClick={doNothing} />
      <OverlayAction text="Reset view" icon="reset" onClick={doNothing} />
    </Card>
}`,...W.parameters?.docs?.source},description:{story:`The one control that does something rather than changing something. Its words are its own caption, so it carries none.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Outlines">
      <GroupDemo />
    </Card>
}`,...G.parameters?.docs?.source},description:{story:`Controls that answer one question, kept together so they move as one unit as the card reflows.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Options">
      <SegmentedDemo />
      <OverlayDivider />
      <NumberDemo />
    </Card>
}`,...K.parameters?.docs?.source},description:{story:`The hairline between two clusters. It is a real separator, so a reader arriving with a screen reader is told where one group ends.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Axes">
      <DisabledDemo />
    </Card>
}`,...q.parameters?.docs?.source},description:{story:`Two shapes of "you cannot have this", both deliberate.

The stepper is greyed whole, because nothing is selected for it to act on.
The picker keeps every choice and greys the one already drawn on the other
axis, carrying a \`title\` that says why — rest on it and the sentence
appears. A choice that is removed instead is a choice the reader never
learns exists.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <MapDemo />
}`,...J.parameters?.docs?.source},description:{story:`The realistic card: what the colour means and how the groups are ringed on
the strip, everything an expert changes behind the cog, over the figure they
all apply to.`,...J.parameters?.docs?.description}}},Y=[`Select`,`Segmented`,`Toggle`,`Stepper`,`Action`,`Group`,`Divider`,`Disabled`,`OneCard`]})))()}X();export{W as Action,q as Disabled,K as Divider,G as Group,J as OneCard,V as Segmented,B as Select,U as Stepper,H as Toggle,Y as __namedExportsOrder,z as default};