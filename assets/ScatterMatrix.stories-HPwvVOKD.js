import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-D72pBctd.js";import{_ as r,g as i,h as a,l as o,m as s,n as c,r as l}from"./projectionFixtures-DkPtYRxh.js";import{n as u,t as d}from"./ScatterMatrix-3wmfdT_L.js";import{v as f}from"./OverlayToggle-CENyE56L.js";import{t as p}from"./ui-CJ2GDaC3.js";import{n as m,t as h}from"./projectionCopy-CY5UJ5rE.js";import{n as g,t as _}from"./ScatterPlot-v_Ruqsxt.js";function v(e){let[t,n]=(0,y.useState)({x:0,y:1}),r=(0,y.useMemo)(()=>i(t.x),[t.x]),o=(0,y.useMemo)(()=>i(t.y),[t.y]);return(0,b.jsxs)(`div`,{style:k,children:[(0,b.jsx)(d,{...e,onSelectPair:(e,t)=>{n({x:e,y:t})}}),(0,b.jsx)(_,{x:r,y:o,width:e.width,height:360,xAxis:a(t.x),yAxis:a(t.y),groupOf:e.groupOf,groups:e.groups,overlay:(0,b.jsx)(f,{title:x,entries:S})})]})}var y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{y=t(),p(),r(),u(),g(),s(),b=n(),x=m(h.legend.pairs,{groups:`species`}),S=c,C=Array.from({length:50},(e,t)=>t),w={title:`Scatter/ScatterMatrix`,component:d,args:{scores:o.scores,axes:o.axes,width:760,groupOf:l,groups:c},parameters:{layout:`padded`,docs:{description:{component:`The same map drawn for every pair of axes, sharing one scale per axis, so a grouping the first two components miss can be found in another pair. The diagonal draws each axis’ own distribution split by group rather than the line y = x, which is identical in every grid ever drawn and reads to an end user as a correlation.`}}},render:e=>(0,b.jsxs)(`div`,{children:[(0,b.jsx)(d,{...e}),(0,b.jsx)(f,{placement:`below`,title:x,entries:S})]})},T={},E={render:e=>(0,b.jsx)(v,{...e})},D={args:{width:260}},O={args:{selected:C}},k={display:`flex`,flexDirection:`column`,gap:16},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{}`,...T.parameters?.docs?.source},description:{story:`All four components of the iris model. The third and fourth carry three per
cent of the differences between the flowers between them, and the grid is
where that is seen rather than read: their cells are a cloud with no
structure in it.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <PromotionDemo {...args} />
}`,...E.parameters?.docs?.source},description:{story:`Clicking a cell hands its pair to whatever is showing the map — here, the
plot underneath.

A cell on the diagonal offers itself against its neighbour, because a
reader who clicked the third component's distribution meant "show me this
one", not "show me it against itself".`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260
  }
}`,...D.parameters?.docs?.source},description:{story:`The same call in a narrow column. Four axes would leave cells too small to
read, so one is dropped and nine larger cells are drawn instead of sixteen
unreadable ones.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selected: SETOSA_ROWS
  }
}`,...O.parameters?.docs?.source},description:{story:`The rows a lasso picked out elsewhere, drawn at full strength while the rest
go faint — how the grid answers "where else do these fifty sit?".`,...O.parameters?.docs?.description}}},A=[`FourComponents`,`PromotesAPair`,`Narrow`,`WithSelection`]})))()}j();export{T as FourComponents,D as Narrow,E as PromotesAPair,O as WithSelection,A as __namedExportsOrder,w as default};