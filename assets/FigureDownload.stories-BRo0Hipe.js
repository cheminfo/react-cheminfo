import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-DmsZCiF9.js";import{i as r,t as i}from"./chartScale-vVT3dZMc.js";import{_ as a,g as o,h as s,n as c,o as l,r as u,s as d}from"./projectionFixtures-Cb1PHCfE.js";import{n as f,t as p}from"./OverlayLayer-Yclfvioe.js";import{n as m,t as h}from"./OverlayLegend-DCQjTZpk.js";import{n as g,t as _}from"./useContainerSize-wDTu3DRi.js";import{n as v,t as y}from"./ChartFrame-BSmIJmBq.js";import{n as b,t as x}from"./FigureDownload-ChuvpfrH.js";function S(){let e=(0,D.useRef)(null),{width:t,height:n}=g(e);return(0,O.jsx)(`div`,{ref:e,style:U,children:t>0&&n>0?(0,O.jsx)(C,{width:t,height:n}):null})}function C(e){let{width:t=k.width,height:n=k.height}=e,{across:r=0,up:i=1,legend:a=!1}=e;return(0,O.jsx)(y,{width:t,height:n,x:o(r),y:o(i),label:j,overlay:a?(0,O.jsx)(p,{width:t,children:(0,O.jsx)(h,{title:`Colour = species.`,entries:c,placement:`top-right`})}):void 0,children:e=>E(e,r,i)})}function w(e){let{caption:t,children:n}=e;return(0,O.jsxs)(`div`,{style:z,children:[(0,O.jsx)(`p`,{style:B,children:t}),n]})}function T(e){return(0,O.jsx)(`div`,{style:V,children:e.children})}function E(e,t,n){let r=t===0?l:a(t),o=n===1?d:a(n),s=[];for(let t=0;t<r.length;t++){let n=c[u[t]??-1];s.push((0,O.jsx)(`circle`,{cx:i(e.x,r[t]??0),cy:i(e.y,o[t]??0),r:3,fill:n?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${t}`))}return(0,O.jsx)(`g`,{children:s})}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{D=t(),r(),v(),b(),_(),f(),m(),s(),O=n(),k={width:720,height:380},A={width:340,height:260},j=`One dot per iris flower, on the first two principal components.`,M={title:`Download/FigureDownload`,component:x,args:{targetId:`iris-figure`,fileName:`iris-map`},parameters:{layout:`padded`,docs:{description:{component:"The glyph that takes a figure off the page as a file. It is given the `id` of the box the figure sits in, so it can stand anywhere — in the bar above the picture, in a toolbar, in a menu — without the component that drew the figure handing anything over. What is saved is everything drawn inside that box, at the resolution the reader picks; the controls floating over the picture are left behind."}}},render:e=>(0,O.jsxs)(w,{caption:`Press the glyph, pick a format and a resolution, then save.`,children:[(0,O.jsx)(T,{children:(0,O.jsx)(x,{...e})}),(0,O.jsx)(`div`,{id:`iris-figure`,children:(0,O.jsx)(C,{})})]})},N={},P={render:e=>(0,O.jsxs)(w,{caption:`The key is not saved; the chart under it is.`,children:[(0,O.jsx)(T,{children:(0,O.jsx)(x,{...e})}),(0,O.jsx)(`div`,{id:`iris-figure`,children:(0,O.jsx)(C,{legend:!0})})]})},F={args:{targetId:`grid-figure`,fileName:`iris-pairs`},render:e=>(0,O.jsxs)(w,{caption:`Four charts in one box, saved as one picture.`,children:[(0,O.jsx)(T,{children:(0,O.jsx)(x,{...e})}),(0,O.jsxs)(`div`,{id:`grid-figure`,style:W,children:[(0,O.jsx)(C,{...A,across:0,up:1}),(0,O.jsx)(C,{...A,across:0,up:2}),(0,O.jsx)(C,{...A,across:1,up:2}),(0,O.jsx)(C,{...A,across:2,up:3})]})]})},I={args:{background:`transparent`,defaultFormat:`svg`}},L={args:{defaultFormat:`svg`,renderFigure:e=>(0,O.jsx)(C,{width:e.width,height:e.height})},render:e=>(0,O.jsxs)(w,{caption:`Pick a size, then save: the chart is drawn again at that shape.`,children:[(0,O.jsx)(T,{children:(0,O.jsx)(x,{...e})}),(0,O.jsx)(`div`,{id:`iris-figure`,children:(0,O.jsx)(C,{})})]})},R={args:{targetId:`filling-figure`,defaultFormat:`svg`,renderFigure:()=>(0,O.jsx)(S,{})},render:e=>(0,O.jsxs)(w,{caption:`Resize the chart from its corner, pick a size, then save.`,children:[(0,O.jsx)(T,{children:(0,O.jsx)(x,{...e})}),(0,O.jsx)(`div`,{id:`filling-figure`,style:H,children:(0,O.jsx)(S,{})})]})},z={display:`flex`,flexDirection:`column`,gap:8,alignItems:`flex-start`},B={margin:0,color:`var(--text-muted)`,fontSize:12},V={display:`flex`,justifyContent:`flex-end`,width:`100%`},H={width:k.width,height:k.height,minWidth:240,minHeight:160,overflow:`hidden`,resize:`both`,border:`1px dashed var(--border-strong)`},U={width:`100%`,height:`100%`},W={display:`grid`,gridTemplateColumns:`repeat(2, ${A.width}px)`,gap:12},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{}`,...N.parameters?.docs?.source},description:{story:`One chart, saved as a PNG at twice the size it is drawn — which is what a
slide wants — or as an SVG, which is what a paper wants.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => <Panel caption="The key is not saved; the chart under it is.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure legend />
      </div>
    </Panel>
}`,...P.parameters?.docs?.source},description:{story:`The key floating in the corner of the picture is chrome rather than data, so
it is left out of the file: its glyphs are \`<svg>\` like any chart, and a cog
saved into the middle of a scatter plot is the bug this avoids. Anything the
figure must carry — the names of the groups, here — belongs on the picture.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`A view that is really four charts is still one figure: each is placed back
where the reader saw it, so the file is the grid rather than its first cell.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    background: 'transparent',
    defaultFormat: 'svg'
  }
}`,...I.parameters?.docs?.source},description:{story:`A figure going onto a coloured slide wants no ground of its own, so the
white behind it can be left unpainted. Everything else is unchanged.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    defaultFormat: 'svg',
    renderFigure: size => <Figure width={size.width} height={size.height} />
  },
  render: args => <Panel caption="Pick a size, then save: the chart is drawn again at that shape.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure />
      </div>
    </Panel>
}`,...L.parameters?.docs?.source},description:{story:`A figure that can be drawn again is saved at the shape the reader picks: as
shown, 4:3 or 16:9 for a slide, a journal's 8.5 cm column, or a size typed
in. The chart is laid out again at that size, off the page, so its axes and
labels fit the shape rather than being stretched into it. That is what lets
an SVG, which has no resolution, still change shape.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    targetId: 'filling-figure',
    defaultFormat: 'svg',
    renderFigure: () => <FillingFigure />
  },
  render: args => <Panel caption="Resize the chart from its corner, pick a size, then save.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="filling-figure" style={RESIZABLE_STYLE}>
        <FillingFigure />
      </div>
    </Panel>
}`,...R.parameters?.docs?.source},description:{story:`A chart that measures its own box rather than being told a size. The copy
drawn for the file measures the box it is given, draws once it knows, and is
saved only once it has stopped moving. Drag the corner to change the chart
on screen, which is what \`As shown\` saves.`,...R.parameters?.docs?.description}}},G=[`Default`,`WithFloatingChrome`,`SeveralCharts`,`NoBackground`,`AnySize`,`FillsItsBox`]})))()}K();export{L as AnySize,N as Default,R as FillsItsBox,I as NoBackground,F as SeveralCharts,P as WithFloatingChrome,G as __namedExportsOrder,M as default};