import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-kb3u72Oa.js";import{g as r,h as i,n as a,t as o}from"./OverlaySegmented-Cj6Sid7k.js";import{c as s,n as c,s as l,t as u}from"./OverlaySelect-CtnQklU7.js";import{n as ee,t as d}from"./OverlayBar-k8jlZfr4.js";import{g as f,h as te,n as p,o as m,r as h,s as g}from"./projectionFixtures-Cb1PHCfE.js";import{n as _,t as v}from"./OverlayDivider-DAlejt1d.js";import{n as y,t as b}from"./OverlayGroup-nEwefwTU.js";import{i as x,n as ne,r as S,t as re}from"./OverlayToggle-DysvDNlx.js";import{n as C,t as w}from"./ScatterPlot-LR_KbFB5.js";function T(e){return(0,P.jsx)(d,{placement:`below`,label:e.label,children:e.children})}function E(){let[e,t]=(0,N.useState)(`0`);return(0,P.jsx)(u,{label:`Across`,help:F,value:e,options:L,onChange:t})}function D(){let[e,t]=(0,N.useState)(`replace`);return(0,P.jsx)(o,{label:`Dragging`,value:e,options:B,onChange:t})}function ie(){let[e,t]=(0,N.useState)(new Set);return(0,P.jsx)(P.Fragment,{children:p.map(n=>(0,P.jsx)(re,{label:n.label,swatch:n.color,checked:!e.has(n.id),onChange:()=>{let r=new Set(e);r.delete(n.id)||r.add(n.id),t(r)}},n.id))})}function O(){let[e,t]=(0,N.useState)(3.5);return(0,P.jsx)(S,{label:`Dot size`,help:I,value:e,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:t})}function k(){let[e,t]=(0,N.useState)(`sd2`),[n,r]=(0,N.useState)(3);return(0,P.jsxs)(b,{label:`Group outlines`,children:[(0,P.jsx)(o,{label:`Size`,value:e,options:z,onChange:t}),(0,P.jsx)(S,{label:`Least samples`,value:n,min:2,max:20,onChange:r})]})}function A(){let[e,t]=(0,N.useState)(`0`);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(u,{label:`Across`,help:F,value:e,options:R,onChange:t}),(0,P.jsx)(S,{label:`Dot size`,value:3.5,min:1,max:12,step:.5,digits:1,unit:`px`,disabled:!0,onChange:M})]})}function j(){let[e,t]=(0,N.useState)(`species`),[n,r]=(0,N.useState)(3.5),[i,a]=(0,N.useState)(`replace`);return(0,P.jsx)(w,{x:m,y:g,width:720,height:420,xAxis:f(0),yAxis:f(1),groupOf:e===`species`?h:void 0,groups:e===`species`?p:void 0,pointRadius:n,overlay:(0,P.jsx)(d,{label:`Options`,more:(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(S,{label:`Dot size`,help:I,value:n,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:r}),(0,P.jsx)(v,{}),(0,P.jsx)(o,{label:`Dragging`,value:i,options:B,onChange:a}),(0,P.jsx)(l,{text:`Reset view`,icon:`reset`,onClick:M})]}),children:(0,P.jsx)(o,{label:`Colour by`,value:e,options:V,onChange:t})})})}function M(){}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{N=t(),s(),ee(),_(),y(),x(),r(),a(),c(),ne(),C(),te(),P=n(),F={title:`Across`,body:`Which component is drawn left to right. A component already on the other axis stays in the list, greyed, so the reader can see that it exists.`},I={title:`Dot size`,body:`The radius of one flower, in pixels. Grow it for a sparse map, shrink it once the middle of the cloud is solid ink.`},L=[0,1,2,3].map(e=>({value:String(e),label:f(e).label??``})),R=L.map(e=>e.value===`1`?{...e,disabled:!0,title:`Already drawn on the other axis.`}:e),z=[{value:`none`,label:`None`},{value:`sd1`,label:`1 SD`},{value:`sd2`,label:`2 SD`},{value:`coverage`,label:`95% of samples`}],B=[{value:`replace`,label:`Replace`},{value:`add`,label:`Add`},{value:`remove`,label:`Remove`}],V=[{value:`species`,label:`Species`},{value:`none`,label:`Nothing`}],H={title:`Overlay/OverlayControls`,component:i,args:{label:`Colour by`,children:null},parameters:{layout:`padded`,docs:{description:{component:"The controls a floating card is built from. Every one of them is an `OverlayRow` — a caption, its help and the control they belong to — which is why a picker and a stepper standing side by side line up on one baseline and answer to one set of measurements. Reach for `OverlayRow` directly when you write a control this package does not have."}}}},U={render:()=>(0,P.jsx)(T,{label:`Axes`,children:(0,P.jsx)(E,{})})},W={render:()=>(0,P.jsx)(T,{label:`Dragging`,children:(0,P.jsx)(D,{})})},G={render:()=>(0,P.jsx)(T,{label:`Species`,children:(0,P.jsx)(ie,{})})},K={render:()=>(0,P.jsx)(T,{label:`Dot size`,children:(0,P.jsx)(O,{})})},q={render:()=>(0,P.jsxs)(T,{label:`View`,children:[(0,P.jsx)(l,{text:`Zoom to selection`,icon:`zoom-to-fit`,onClick:M}),(0,P.jsx)(l,{text:`Reset view`,icon:`reset`,onClick:M})]})},J={render:()=>(0,P.jsx)(T,{label:`Outlines`,children:(0,P.jsx)(k,{})})},Y={render:()=>(0,P.jsxs)(T,{label:`Options`,children:[(0,P.jsx)(D,{}),(0,P.jsx)(v,{}),(0,P.jsx)(O,{})]})},X={render:()=>(0,P.jsx)(T,{label:`Axes`,children:(0,P.jsx)(A,{})})},Z={render:()=>(0,P.jsx)(j,{})},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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