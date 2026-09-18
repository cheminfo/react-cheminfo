import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-q9lSOsQA.js";import{i as n,t as r}from"./chartScale-Cx3ulN9E.js";import{A as i,E as a,N as o,d as s,g as c,h as l,n as u,o as d,r as f,s as p}from"./projectionFixtures-CiYcRfZJ.js";import{n as m,t as h}from"./ChartFrame-BMShYII6.js";import{n as g,t as _}from"./OverlayCaption-DIchZe_5.js";import{n as v,t as y}from"./OverlayLegend-d5VSmnAl.js";function b(e){let t=[];for(let n=0;n<d.length;n++){let i=u[f[n]??-1];t.push((0,C.jsx)(`circle`,{cx:r(e.x,d[n]??0),cy:r(e.y,p[n]??0),r:3.5,fill:i?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${n}`))}return(0,C.jsx)(`g`,{children:t})}function x(e){let t=[];for(let n=0;n<E.rows;n++)t.push((0,C.jsx)(`circle`,{cx:r(e.x,E.get(n,0)),cy:r(e.y,E.get(n,1)),r:3.5,fill:u[0]?.color??`var(--text-muted)`,fillOpacity:.75},`petal-${n}`));return(0,C.jsx)(`g`,{children:t})}function S(){let e=[];for(let t=0;t<s.length;t++){if(f[t]!==0)continue;let n=s[t];if(n===void 0)continue;let r=n[2]??0,i=n[3]??0;e.push([r*w,r*i*T])}return a(e)}var C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{o(),n(),m(),g(),v(),l(),C=t(),w=.01,T=1e-4,E=S(),D=i(E,0,{padding:.06}),O=i(E,1,{padding:.06}),k=u.map(e=>({...e})),A={title:`Chart/ChartFrame`,component:h,args:{width:720,height:420,x:c(0),y:c(1),label:`One dot per iris flower, on the first two principal components.`,children:b},parameters:{layout:`padded`,docs:{description:{component:`The frame every figure in the family is drawn in: a plot rectangle, two niced axes, a clip, and a layer of floating chrome over the top. Reach for it when you are drawing marks of your own and want them to sit in the same grid, at the same weights, as every other chart here — it hands your function the rectangle and the two scales, and draws nothing inside it itself.`}}}},j={},M={args:{x:{domain:[D.min,D.max],label:`Petal length (m)`},y:{domain:[O.min,O.max],label:`Petal area (m²)`},label:`The fifty setosa flowers, their petals measured in metres.`,children:x}},N={args:{overlay:(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(y,{placement:`bottom-left`,title:`Colour = species`,entries:k}),(0,C.jsx)(_,{edge:`top`,children:`The first two components carry 96 % of what separates the flowers.`})]})}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source},description:{story:`Two linear axes over the iris map. The grid goes down before the caller's
marks and the axes go over them, so a rule never crosses a point and a tick
is never buried under one.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    x: {
      domain: [SETOSA_LENGTH.min, SETOSA_LENGTH.max],
      label: 'Petal length (m)'
    },
    y: {
      domain: [SETOSA_AREA.min, SETOSA_AREA.max],
      label: 'Petal area (m²)'
    },
    label: 'The fifty setosa flowers, their petals measured in metres.',
    children: setosaCloud
  }
}`,...M.parameters?.docs?.source},description:{story:`The same fifty flowers with their petals measured in metres, which is where
the labels would otherwise read \`0.00002\`. A common power of ten is lifted
out of them and written into the axis title, and only where that actually
shortens the labels: the length axis beside it keeps its digits.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    overlay: <>
        <OverlayLegend placement="bottom-left" title="Colour = species" entries={SPECIES} />
        <OverlayCaption edge="top">
          The first two components carry 96 % of what separates the flowers.
        </OverlayCaption>
      </>
  }
}`,...N.parameters?.docs?.source},description:{story:`The overlay slot in use. What it holds is HTML rather than SVG, so it is
neither clipped to the plot nor scaled with it, and every pointer event
passes through it except on the cards themselves — a lasso started under the
legend still starts.`,...N.parameters?.docs?.description}}},P=[`Default`,`TinyNumbers`,`WithOverlay`]})))()}F();export{j as Default,M as TinyNumbers,N as WithOverlay,P as __namedExportsOrder,A as default};