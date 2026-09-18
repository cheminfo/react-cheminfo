import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-X62GV0XO.js";import{i as n,t as r}from"./chartScale-Cx3ulN9E.js";import{_ as i,g as a,h as o,n as s,o as c,r as l,s as u}from"./projectionFixtures-CiYcRfZJ.js";import{n as d,t as f}from"./ChartFrame-CHF420uM.js";import{n as p,t as m}from"./OverlayLayer-DgOtKuo7.js";import{n as h,t as g}from"./OverlayLegend-BISPoPDs.js";import{n as _,t as v}from"./FigureDownload-C2gmPmJt.js";function y(e){let{width:t=w.width,height:n=w.height}=e,{across:r=0,up:i=1,legend:o=!1}=e;return(0,C.jsx)(f,{width:t,height:n,x:a(r),y:a(i),label:E,overlay:o?(0,C.jsx)(m,{width:t,children:(0,C.jsx)(g,{title:`Colour = species.`,entries:s,placement:`top-right`})}):void 0,children:e=>S(e,r,i)})}function b(e){let{caption:t,children:n}=e;return(0,C.jsxs)(`div`,{style:M,children:[(0,C.jsx)(`p`,{style:N,children:t}),n]})}function x(e){return(0,C.jsx)(`div`,{style:P,children:e.children})}function S(e,t,n){let a=t===0?c:i(t),o=n===1?u:i(n),d=[];for(let t=0;t<a.length;t++){let n=s[l[t]??-1];d.push((0,C.jsx)(`circle`,{cx:r(e.x,a[t]??0),cy:r(e.y,o[t]??0),r:3,fill:n?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${t}`))}return(0,C.jsx)(`g`,{children:d})}var C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{n(),d(),_(),p(),h(),o(),C=t(),w={width:720,height:380},T={width:340,height:260},E=`One dot per iris flower, on the first two principal components.`,D={title:`Download/FigureDownload`,component:v,args:{targetId:`iris-figure`,fileName:`iris-map`},parameters:{layout:`padded`,docs:{description:{component:"The glyph that takes a figure off the page as a file. It is given the `id` of the box the figure sits in, so it can stand anywhere — in the bar above the picture, in a toolbar, in a menu — without the component that drew the figure handing anything over. What is saved is everything drawn inside that box, at the resolution the reader picks; the controls floating over the picture are left behind."}}},render:e=>(0,C.jsxs)(b,{caption:`Press the glyph, pick a format and a resolution, then save.`,children:[(0,C.jsx)(x,{children:(0,C.jsx)(v,{...e})}),(0,C.jsx)(`div`,{id:`iris-figure`,children:(0,C.jsx)(y,{})})]})},O={},k={render:e=>(0,C.jsxs)(b,{caption:`The key is not saved; the chart under it is.`,children:[(0,C.jsx)(x,{children:(0,C.jsx)(v,{...e})}),(0,C.jsx)(`div`,{id:`iris-figure`,children:(0,C.jsx)(y,{legend:!0})})]})},A={args:{targetId:`grid-figure`,fileName:`iris-pairs`},render:e=>(0,C.jsxs)(b,{caption:`Four charts in one box, saved as one picture.`,children:[(0,C.jsx)(x,{children:(0,C.jsx)(v,{...e})}),(0,C.jsxs)(`div`,{id:`grid-figure`,style:F,children:[(0,C.jsx)(y,{...T,across:0,up:1}),(0,C.jsx)(y,{...T,across:0,up:2}),(0,C.jsx)(y,{...T,across:1,up:2}),(0,C.jsx)(y,{...T,across:2,up:3})]})]})},j={args:{background:`transparent`,defaultFormat:`svg`}},M={display:`flex`,flexDirection:`column`,gap:8,alignItems:`flex-start`},N={margin:0,color:`var(--text-muted)`,fontSize:12},P={display:`flex`,justifyContent:`flex-end`,width:`100%`},F={display:`grid`,gridTemplateColumns:`repeat(2, ${T.width}px)`,gap:12},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{}`,...O.parameters?.docs?.source},description:{story:`One chart, saved as a PNG at twice the size it is drawn — which is what a
slide wants — or as an SVG, which is what a paper wants.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => <Panel caption="The key is not saved; the chart under it is.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure legend />
      </div>
    </Panel>
}`,...k.parameters?.docs?.source},description:{story:`The key floating in the corner of the picture is chrome rather than data, so
it is left out of the file: its glyphs are \`<svg>\` like any chart, and a cog
saved into the middle of a scatter plot is the bug this avoids. Anything the
figure must carry — the names of the groups, here — belongs on the picture.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    targetId: 'grid-figure',
    fileName: 'iris-pairs'
  },
  render: args => <Panel caption="Four charts in one box, saved as one picture.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="grid-figure" style={GRID_STYLE}>
        <Figure {...HALF} across={0} up={1} />
        <Figure {...HALF} across={0} up={2} />
        <Figure {...HALF} across={1} up={2} />
        <Figure {...HALF} across={2} up={3} />
      </div>
    </Panel>
}`,...A.parameters?.docs?.source},description:{story:`A view that is really four charts is still one figure: each is placed back
where the reader saw it, so the file is the grid rather than its first cell.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    background: 'transparent',
    defaultFormat: 'svg'
  }
}`,...j.parameters?.docs?.source},description:{story:`A figure going onto a coloured slide wants no ground of its own, so the
white behind it can be left unpainted. Everything else is unchanged.`,...j.parameters?.docs?.description}}},I=[`Default`,`WithFloatingChrome`,`SeveralCharts`,`NoBackground`]})))()}L();export{O as Default,j as NoBackground,A as SeveralCharts,k as WithFloatingChrome,I as __namedExportsOrder,D as default};