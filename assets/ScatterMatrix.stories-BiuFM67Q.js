import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-t3BKuE7o.js";import{n as r,t as i}from"./ScatterMatrix-DyxBD4sq.js";import{_ as a,g as o,h as s,n as c,r as l,u}from"./projectionFixtures-CiYcRfZJ.js";import{n as d,t as f}from"./OverlayLegend-131xv3LZ.js";import{i as p,n as m,r as h,t as g}from"./projectionCopy-BLFVN6OM.js";import{n as _,t as v}from"./ScatterPlot-DPe_PczW.js";function y(e){let[t,n]=(0,b.useState)({x:0,y:1}),r=(0,b.useMemo)(()=>a(t.x),[t.x]),s=(0,b.useMemo)(()=>a(t.y),[t.y]);return(0,x.jsxs)(`div`,{style:A,children:[(0,x.jsx)(i,{...e,onSelectPair:(e,t)=>{n({x:e,y:t})}}),(0,x.jsx)(v,{x:r,y:s,width:e.width,height:360,xAxis:o(t.x),yAxis:o(t.y),groupOf:e.groupOf,groups:e.groups,overlay:(0,x.jsx)(f,{title:S,entries:C})})]})}var b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{b=t(),d(),m(),p(),r(),_(),s(),x=n(),S=h(g.legend.pairs,{groups:`species`}),C=c,w=Array.from({length:50},(e,t)=>t),T={title:`Scatter/ScatterMatrix`,component:i,args:{scores:u.scores,axes:u.axes,width:760,groupOf:l,groups:c},parameters:{layout:`padded`,docs:{description:{component:`The same map drawn for every pair of axes, sharing one scale per axis, so a grouping the first two components miss can be found in another pair. The diagonal draws each axis’ own distribution split by group rather than the line y = x, which is identical in every grid ever drawn and reads to an end user as a correlation.`}}},render:e=>(0,x.jsxs)(`div`,{children:[(0,x.jsx)(i,{...e}),(0,x.jsx)(f,{placement:`below`,title:S,entries:C})]})},E={},D={render:e=>(0,x.jsx)(y,{...e})},O={args:{width:260}},k={args:{selected:w}},A={display:`flex`,flexDirection:`column`,gap:16},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source},description:{story:`All four components of the iris model. The third and fourth carry three per
cent of the differences between the flowers between them, and the grid is
where that is seen rather than read: their cells are a cloud with no
structure in it.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => <PromotionDemo {...args} />
}`,...D.parameters?.docs?.source},description:{story:`Clicking a cell hands its pair to whatever is showing the map — here, the
plot underneath.

A cell on the diagonal offers itself against its neighbour, because a
reader who clicked the third component's distribution meant "show me this
one", not "show me it against itself".`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260
  }
}`,...O.parameters?.docs?.source},description:{story:`The same call in a narrow column. Four axes would leave cells too small to
read, so one is dropped and nine larger cells are drawn instead of sixteen
unreadable ones.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    selected: SETOSA_ROWS
  }
}`,...k.parameters?.docs?.source},description:{story:`The rows a lasso picked out elsewhere, drawn at full strength while the rest
go faint — how the grid answers "where else do these fifty sit?".`,...k.parameters?.docs?.description}}},j=[`FourComponents`,`PromotesAPair`,`Narrow`,`WithSelection`]})))()}M();export{E as FourComponents,O as Narrow,D as PromotesAPair,k as WithSelection,j as __namedExportsOrder,T as default};