import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-vuJI5ajg.js";import{_ as r,g as i,h as a,n as o,t as s,v as c}from"./OverlaySegmented-Bvu8PDZy.js";import{g as l,h as u,n as d,o as ee,r as te,s as f}from"./projectionFixtures-CiYcRfZJ.js";import{c as p,d as m,f as h,i as g,n as _,r as v,s as y,t as b}from"./OverlayToggle-D08qr5nZ.js";import{n as x,t as S}from"./OverlayDivider-BvS-p9RA.js";import{n as ne,t as re}from"./OverlayGroup-DHqsF61P.js";import{n as C,t as ie}from"./ScatterPlot-DJbyIIp6.js";function w(e){return(0,P.jsx)(m,{placement:`below`,label:e.label,children:e.children})}function T(){let[e,t]=(0,N.useState)(`0`);return(0,P.jsx)(v,{label:`Across`,help:F,value:e,options:L,onChange:t})}function E(){let[e,t]=(0,N.useState)(`replace`);return(0,P.jsx)(s,{label:`Dragging`,value:e,options:B,onChange:t})}function D(){let[e,t]=(0,N.useState)(new Set);return(0,P.jsx)(P.Fragment,{children:d.map(n=>(0,P.jsx)(b,{label:n.label,swatch:n.color,checked:!e.has(n.id),onChange:()=>{let r=new Set(e);r.delete(n.id)||r.add(n.id),t(r)}},n.id))})}function O(){let[e,t]=(0,N.useState)(3.5);return(0,P.jsx)(y,{label:`Dot size`,help:I,value:e,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:t})}function k(){let[e,t]=(0,N.useState)(`sd2`),[n,r]=(0,N.useState)(3);return(0,P.jsxs)(re,{label:`Group outlines`,children:[(0,P.jsx)(s,{label:`Size`,value:e,options:z,onChange:t}),(0,P.jsx)(y,{label:`Least samples`,value:n,min:2,max:20,onChange:r})]})}function A(){let[e,t]=(0,N.useState)(`0`);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(v,{label:`Across`,help:F,value:e,options:R,onChange:t}),(0,P.jsx)(y,{label:`Dot size`,value:3.5,min:1,max:12,step:.5,digits:1,unit:`px`,disabled:!0,onChange:M})]})}function j(){let[e,t]=(0,N.useState)(`species`),[n,r]=(0,N.useState)(3.5),[i,o]=(0,N.useState)(`replace`);return(0,P.jsx)(ie,{x:ee,y:f,width:720,height:420,xAxis:l(0),yAxis:l(1),groupOf:e===`species`?te:void 0,groups:e===`species`?d:void 0,pointRadius:n,overlay:(0,P.jsx)(m,{label:`Options`,more:(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(y,{label:`Dot size`,help:I,value:n,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:r}),(0,P.jsx)(S,{}),(0,P.jsx)(s,{label:`Dragging`,value:i,options:B,onChange:o}),(0,P.jsx)(a,{text:`Reset view`,icon:`reset`,onClick:M})]}),children:(0,P.jsx)(s,{label:`Colour by`,value:e,options:V,onChange:t})})})}function M(){}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{N=t(),i(),h(),x(),ne(),p(),c(),o(),g(),_(),C(),u(),P=n(),F={title:`Across`,body:`Which component is drawn left to right. A component already on the other axis stays in the list, greyed, so the reader can see that it exists.`},I={title:`Dot size`,body:`The radius of one flower, in pixels. Grow it for a sparse map, shrink it once the middle of the cloud is solid ink.`},L=[0,1,2,3].map(e=>({value:String(e),label:l(e).label??``})),R=L.map(e=>e.value===`1`?{...e,disabled:!0,title:`Already drawn on the other axis.`}:e),z=[{value:`none`,label:`None`},{value:`sd1`,label:`1 SD`},{value:`sd2`,label:`2 SD`},{value:`coverage`,label:`95% of samples`}],B=[{value:`replace`,label:`Replace`},{value:`add`,label:`Add`},{value:`remove`,label:`Remove`}],V=[{value:`species`,label:`Species`},{value:`none`,label:`Nothing`}],H={title:`Overlay/OverlayControls`,component:r,args:{label:`Colour by`,children:null},parameters:{layout:`padded`,docs:{description:{component:"The controls a floating card is built from. Every one of them is an `OverlayRow` — a caption, its help and the control they belong to — which is why a picker and a stepper standing side by side line up on one baseline and answer to one set of measurements. Reach for `OverlayRow` directly when you write a control this package does not have."}}}},U={render:()=>(0,P.jsx)(w,{label:`Axes`,children:(0,P.jsx)(T,{})})},W={render:()=>(0,P.jsx)(w,{label:`Dragging`,children:(0,P.jsx)(E,{})})},G={render:()=>(0,P.jsx)(w,{label:`Species`,children:(0,P.jsx)(D,{})})},K={render:()=>(0,P.jsx)(w,{label:`Dot size`,children:(0,P.jsx)(O,{})})},q={render:()=>(0,P.jsxs)(w,{label:`View`,children:[(0,P.jsx)(a,{text:`Zoom to selection`,icon:`zoom-to-fit`,onClick:M}),(0,P.jsx)(a,{text:`Reset view`,icon:`reset`,onClick:M})]})},J={render:()=>(0,P.jsx)(w,{label:`Outlines`,children:(0,P.jsx)(k,{})})},Y={render:()=>(0,P.jsxs)(w,{label:`Options`,children:[(0,P.jsx)(E,{}),(0,P.jsx)(S,{}),(0,P.jsx)(O,{})]})},X={render:()=>(0,P.jsx)(w,{label:`Axes`,children:(0,P.jsx)(A,{})})},Z={render:()=>(0,P.jsx)(j,{})},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Axes">
      <SelectDemo />
    </Card>
}`,...U.parameters?.docs?.source},description:{story:`The picker, for once the choices stop fitting side by side — past about four.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Dragging">
      <SegmentedDemo />
    </Card>
}`,...W.parameters?.docs?.source},description:{story:`The row of segments, while every choice still fits on one line. A reader who can see that a second view exists asks for it.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Species">
      <ToggleDemo />
    </Card>
}`,...G.parameters?.docs?.source},description:{story:`One thing on the figure turned on and off. It is a pressed button rather
than a checkbox so that the same control works as a legend entry: give it
the series' own colour and a row of them becomes the figure's key.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Dot size">
      <NumberDemo />
    </Card>
}`,...K.parameters?.docs?.source},description:{story:`A value the reader nudges rather than types — over a figure they are hunting for the size that makes the picture read, not entering a number.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="View">
      <OverlayAction text="Zoom to selection" icon="zoom-to-fit" onClick={doNothing} />
      <OverlayAction text="Reset view" icon="reset" onClick={doNothing} />
    </Card>
}`,...q.parameters?.docs?.source},description:{story:`The one control that does something rather than changing something. Its words are its own caption, so it carries none.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Outlines">
      <GroupDemo />
    </Card>
}`,...J.parameters?.docs?.source},description:{story:`Controls that answer one question, kept together so they move as one unit as the card reflows.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Options">
      <SegmentedDemo />
      <OverlayDivider />
      <NumberDemo />
    </Card>
}`,...Y.parameters?.docs?.source},description:{story:`The hairline between two clusters. It is a real separator, so a reader arriving with a screen reader is told where one group ends.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <Card label="Axes">
      <DisabledDemo />
    </Card>
}`,...X.parameters?.docs?.source},description:{story:`Two shapes of "you cannot have this", both deliberate.

The stepper is greyed whole, because nothing is selected for it to act on.
The picker keeps every choice and greys the one already drawn on the other
axis, carrying a \`title\` that says why — rest on it and the sentence
appears. A choice that is removed instead is a choice the reader never
learns exists.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <MapDemo />
}`,...Z.parameters?.docs?.source},description:{story:`The realistic card: what the colour means and how the groups are ringed on
the strip, everything an expert changes behind the cog, over the figure they
all apply to.`,...Z.parameters?.docs?.description}}},Q=[`Select`,`Segmented`,`Toggle`,`Stepper`,`Action`,`Group`,`Divider`,`Disabled`,`OneCard`]})))()}$();export{q as Action,X as Disabled,Y as Divider,J as Group,Z as OneCard,W as Segmented,U as Select,K as Stepper,G as Toggle,Q as __namedExportsOrder,H as default};