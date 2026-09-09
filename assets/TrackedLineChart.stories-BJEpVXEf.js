import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-D72pBctd.js";import{f as r,gt as i,l as a,m as o,n as s,r as c,st as l,u}from"./projectionFixtures-DkPtYRxh.js";import{r as d}from"./TrackedStickChart-CT9eMuQO.js";import{t as f}from"./ui-CENo30q1.js";function p(e){let[t,n]=(0,_.useState)(null),[r,i]=(0,_.useState)(null);return(0,v.jsxs)(`div`,{style:O,children:[(0,v.jsx)(d,{...e,trackedIndex:t===null?r:t.index,onTrack:n,onSelect:i}),(0,v.jsxs)(`div`,{style:k,children:[(0,v.jsx)(`div`,{style:A,children:t===null?`Nothing is tracked — move the pointer across the plot.`:`Slot ${t.index} — ${t.label}, ${Math.round(t.x)} px from the left`}),t===null?null:t.values.map(e=>(0,v.jsxs)(`div`,{style:j,children:[(0,v.jsx)(`span`,{style:{...M,background:e.color},"aria-hidden":`true`}),(0,v.jsx)(`span`,{children:e.label}),(0,v.jsxs)(`span`,{style:N,children:[e.value.toFixed(2),` cm`]})]},e.id)),(0,v.jsx)(`div`,{style:P,children:r===null?`No slot is pinned. Click one, or tab to the plot and press Enter.`:`Pinned: ${S[r]??``}.`})]})]})}function m(e){let t=a.loadings?.weights,n=[];if(t===void 0)return n;for(let r=0;r<Math.min(e,t.rows);r++){let e=new Float64Array(t.columns);for(let n=0;n<t.columns;n++)e[n]=t.get(r,n);n.push({id:`component-${r}`,label:a.axes[r]?.name??``,values:e,color:i(r,`component`),kind:`bar`})}return n}function h(){let e=[];for(let t=0;t<s.length;t++){let n=[];for(let e=0;e<u.length;e++)c[e]===t&&n.push(u[e]?.[2]??0);let r=s[t];r!==void 0&&e.push({id:r.id,label:r.label,values:Float64Array.from(n.toSorted((e,t)=>e-t)),color:r.color})}return e}function g(){let e=Array(b);for(let t=0;t<e.length;t++)e[t]=String(t+1);return e}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{_=t(),l(),f(),o(),v=n(),y={width:720,height:340},b=50,x=m(1),S=g(),C=h(),w={title:`Chart/TrackedLineChart`,component:d,args:{categories:r.names,series:x,width:y.width,height:y.height,xLabel:r.label,y:{label:`Weight`},label:`What the first principal component makes of the four measurements.`},parameters:{layout:`padded`,docs:{description:{component:`One or more series over a shared list of slots, with a crosshair that reports what stands under the pointer. Reach for it whenever the horizontal axis is a list rather than a number line — the columns of a table, the measurements a model was fitted on, the points of a spectrum — because finding the slot under the pointer is then one division instead of a search.`}}}},T={},E={args:{categories:S,series:C,xLabel:`Flower, ranked within its species`,y:{label:`Petal length (cm)`},label:`The petal lengths of each species, smallest first.`,maxTickLabels:12}},D={args:{categories:S,series:C,xLabel:`Flower, ranked within its species`,y:{label:`Petal length (cm)`},label:`The petal lengths of each species, smallest first.`,maxTickLabels:12},render:e=>(0,v.jsx)(p,{...e})},O={display:`flex`,flexDirection:`column`,gap:10},k={display:`flex`,minHeight:96,width:y.width,flexDirection:`column`,padding:`0.5rem 0.75rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,gap:2,fontSize:13},A={fontWeight:600},j={display:`flex`,alignItems:`center`,gap:6},M={width:8,height:8,borderRadius:2},N={marginLeft:`auto`,fontVariantNumeric:`tabular-nums`},P={marginTop:4,color:`var(--text-muted)`},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{}`,...T.parameters?.docs?.source},description:{story:`Four named measurements, drawn as bars from the zero line. Bars because the
slots are names rather than a sequence: there is nothing between \`Sepal
width\` and \`Petal length\` for a line to cross, and the rule at zero is what
says which side of nothing a weight fell on. Rest on a bar and the crosshair
names the measurement under the pointer.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    categories: RANKS,
    series: CURVES,
    xLabel: 'Flower, ranked within its species',
    y: {
      label: 'Petal length (cm)'
    },
    label: 'The petal lengths of each species, smallest first.',
    maxTickLabels: 12
  }
}`,...E.parameters?.docs?.source},description:{story:`The same component drawn as lines over a continuous axis — the fifty flowers
of each species, smallest petal first. Past twenty-four slots only every nth
name is written so the labels cannot overlap; the ticks themselves all stay.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    categories: RANKS,
    series: CURVES,
    xLabel: 'Flower, ranked within its species',
    y: {
      label: 'Petal length (cm)'
    },
    label: 'The petal lengths of each species, smallest first.',
    maxTickLabels: 12
  },
  render: args => <TrackDemo {...args} />
}`,...D.parameters?.docs?.source},description:{story:`The tracking callback, held in state and written out under the chart.

Move the pointer across the plot: it fires only when the slot under the
pointer changes, and hands back the slot, its name, where its middle is in
pixels, and every visible series' value there. Click a slot — or reach it
with the keyboard and press Enter — and the crosshair stays on it after the
pointer has left.`,...D.parameters?.docs?.description}}},F=[`Default`,`Continuous`,`Tracked`]})))()}I();export{E as Continuous,T as Default,D as Tracked,F as __namedExportsOrder,w as default};