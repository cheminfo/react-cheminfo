import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-D72pBctd.js";import{N as n,g as r,h as i,j as a,m as o,n as s,o as c,pt as l,r as u,s as d,st as f}from"./projectionFixtures-DkPtYRxh.js";import{t as p}from"./ui-CENo30q1.js";import{v as m}from"./OverlayToggle-CENyE56L.js";import{t as h}from"./ui-CJ2GDaC3.js";import{n as g,r as _,t as v}from"./FigureDownload-CFtaBwYB.js";function y(){return(y=e((()=>{g(),_()})))()}function b(e){let{width:t=T.width,height:r=T.height}=e,{across:o=0,up:c=1,legend:l=!1}=e;return(0,w.jsx)(a,{width:t,height:r,x:i(o),y:i(c),label:D,overlay:l?(0,w.jsx)(n,{width:t,children:(0,w.jsx)(m,{title:`Colour = species.`,entries:s,placement:`top-right`})}):void 0,children:e=>C(e,o,c)})}function x(e){let{caption:t,children:n}=e;return(0,w.jsxs)(`div`,{style:N,children:[(0,w.jsx)(`p`,{style:P,children:t}),n]})}function S(e){return(0,w.jsx)(`div`,{style:F,children:e.children})}function C(e,t,n){let i=t===0?c:r(t),a=n===1?d:r(n),o=[];for(let t=0;t<i.length;t++){let n=s[u[t]??-1];o.push((0,w.jsx)(`circle`,{cx:l(e.x,i[t]??0),cy:l(e.y,a[t]??0),r:3,fill:n?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${t}`))}return(0,w.jsx)(`g`,{children:o})}var w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{f(),p(),y(),h(),o(),w=t(),T={width:720,height:380},E={width:340,height:260},D=`One dot per iris flower, on the first two principal components.`,O={title:`Download/FigureDownload`,component:v,args:{targetId:`iris-figure`,fileName:`iris-map`},parameters:{layout:`padded`,docs:{description:{component:"The glyph that takes a figure off the page as a file. It is given the `id` of the box the figure sits in, so it can stand anywhere — in the bar above the picture, in a toolbar, in a menu — without the component that drew the figure handing anything over. What is saved is everything drawn inside that box, at the resolution the reader picks; the controls floating over the picture are left behind."}}},render:e=>(0,w.jsxs)(x,{caption:`Press the glyph, pick a format and a resolution, then save.`,children:[(0,w.jsx)(S,{children:(0,w.jsx)(v,{...e})}),(0,w.jsx)(`div`,{id:`iris-figure`,children:(0,w.jsx)(b,{})})]})},k={},A={render:e=>(0,w.jsxs)(x,{caption:`The key is not saved; the chart under it is.`,children:[(0,w.jsx)(S,{children:(0,w.jsx)(v,{...e})}),(0,w.jsx)(`div`,{id:`iris-figure`,children:(0,w.jsx)(b,{legend:!0})})]})},j={args:{targetId:`grid-figure`,fileName:`iris-pairs`},render:e=>(0,w.jsxs)(x,{caption:`Four charts in one box, saved as one picture.`,children:[(0,w.jsx)(S,{children:(0,w.jsx)(v,{...e})}),(0,w.jsxs)(`div`,{id:`grid-figure`,style:I,children:[(0,w.jsx)(b,{...E,across:0,up:1}),(0,w.jsx)(b,{...E,across:0,up:2}),(0,w.jsx)(b,{...E,across:1,up:2}),(0,w.jsx)(b,{...E,across:2,up:3})]})]})},M={args:{background:`transparent`,defaultFormat:`svg`}},N={display:`flex`,flexDirection:`column`,gap:8,alignItems:`flex-start`},P={margin:0,color:`var(--text-muted)`,fontSize:12},F={display:`flex`,justifyContent:`flex-end`,width:`100%`},I={display:`grid`,gridTemplateColumns:`repeat(2, ${E.width}px)`,gap:12},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source},description:{story:`One chart, saved as a PNG at twice the size it is drawn — which is what a
slide wants — or as an SVG, which is what a paper wants.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => <Panel caption="The key is not saved; the chart under it is.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure legend />
      </div>
    </Panel>
}`,...A.parameters?.docs?.source},description:{story:`The key floating in the corner of the picture is chrome rather than data, so
it is left out of the file: its glyphs are \`<svg>\` like any chart, and a cog
saved into the middle of a scatter plot is the bug this avoids. Anything the
figure must carry — the names of the groups, here — belongs on the picture.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`A view that is really four charts is still one figure: each is placed back
where the reader saw it, so the file is the grid rather than its first cell.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    background: 'transparent',
    defaultFormat: 'svg'
  }
}`,...M.parameters?.docs?.source},description:{story:`A figure going onto a coloured slide wants no ground of its own, so the
white behind it can be left unpainted. Everything else is unchanged.`,...M.parameters?.docs?.description}}},L=[`Default`,`WithFloatingChrome`,`SeveralCharts`,`NoBackground`]})))()}R();export{k as Default,M as NoBackground,j as SeveralCharts,A as WithFloatingChrome,L as __namedExportsOrder,O as default};