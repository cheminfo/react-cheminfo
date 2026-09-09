import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-D72pBctd.js";import{St as n,h as r,j as i,lt as a,m as o,n as s,o as c,pt as l,r as u,s as d,st as f,u as p}from"./projectionFixtures-DkPtYRxh.js";import{t as m}from"./ui-CENo30q1.js";import{A as h,v as g}from"./OverlayToggle-CENyE56L.js";import{t as _}from"./ui-CJ2GDaC3.js";function v(e){let t=[];for(let n=0;n<c.length;n++){let r=s[u[n]??-1];t.push((0,x.jsx)(`circle`,{cx:l(e.x,c[n]??0),cy:l(e.y,d[n]??0),r:3.5,fill:r?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${n}`))}return(0,x.jsx)(`g`,{children:t})}function y(e){let t=[];for(let n=0;n<w.rows;n++)t.push((0,x.jsx)(`circle`,{cx:l(e.x,w.get(n,0)),cy:l(e.y,w.get(n,1)),r:3.5,fill:s[0]?.color??`var(--text-muted)`,fillOpacity:.75},`petal-${n}`));return(0,x.jsx)(`g`,{children:t})}function b(){let e=[];for(let t=0;t<p.length;t++){if(u[t]!==0)continue;let n=p[t];if(n===void 0)continue;let r=n[2]??0,i=n[3]??0;e.push([r*S,r*i*C])}return a(e)}var x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{f(),m(),_(),o(),x=t(),S=.01,C=1e-4,w=b(),T=n(w,0,{padding:.06}),E=n(w,1,{padding:.06}),D=s.map(e=>({...e})),O={title:`Chart/ChartFrame`,component:i,args:{width:720,height:420,x:r(0),y:r(1),label:`One dot per iris flower, on the first two principal components.`,children:v},parameters:{layout:`padded`,docs:{description:{component:`The frame every figure in the family is drawn in: a plot rectangle, two niced axes, a clip, and a layer of floating chrome over the top. Reach for it when you are drawing marks of your own and want them to sit in the same grid, at the same weights, as every other chart here — it hands your function the rectangle and the two scales, and draws nothing inside it itself.`}}}},k={},A={args:{x:{domain:[T.min,T.max],label:`Petal length (m)`},y:{domain:[E.min,E.max],label:`Petal area (m²)`},label:`The fifty setosa flowers, their petals measured in metres.`,children:y}},j={args:{overlay:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(g,{placement:`bottom-left`,title:`Colour = species`,entries:D}),(0,x.jsx)(h,{edge:`top`,children:`The first two components carry 96 % of what separates the flowers.`})]})}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source},description:{story:`Two linear axes over the iris map. The grid goes down before the caller's
marks and the axes go over them, so a rule never crosses a point and a tick
is never buried under one.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`The same fifty flowers with their petals measured in metres, which is where
the labels would otherwise read \`0.00002\`. A common power of ten is lifted
out of them and written into the axis title, and only where that actually
shortens the labels: the length axis beside it keeps its digits.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    overlay: <>
        <OverlayLegend placement="bottom-left" title="Colour = species" entries={SPECIES} />
        <OverlayCaption edge="top">
          The first two components carry 96 % of what separates the flowers.
        </OverlayCaption>
      </>
  }
}`,...j.parameters?.docs?.source},description:{story:`The overlay slot in use. What it holds is HTML rather than SVG, so it is
neither clipped to the plot nor scaled with it, and every pointer event
passes through it except on the cards themselves — a lasso started under the
legend still starts.`,...j.parameters?.docs?.description}}},M=[`Default`,`TinyNumbers`,`WithOverlay`]})))()}N();export{k as Default,A as TinyNumbers,j as WithOverlay,M as __namedExportsOrder,O as default};