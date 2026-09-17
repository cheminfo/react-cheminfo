import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CrDw_Dpt.js";import{g as r,h as i,n as a,t as o}from"./OverlaySegmented-Cxu6Nxxd.js";import{i as s,t as c}from"./chartScale-CW5Od2vP.js";import{g as l,h as u,n as d,o as f,r as ee,s as te}from"./projectionFixtures-CiYcRfZJ.js";import{n as ne,t as re}from"./ChartFrame-DLFhpPCX.js";import{n as ie,t as ae}from"./OverlayLayer-Cwdq1s5i.js";import{c as oe,d as p,f as m,i as h,n as g,r as _,s as se,t as ce}from"./OverlayToggle-Cqdv9zci.js";import{n as v,t as le}from"./OverlayDivider-BhthoLhg.js";function y(e){let{children:t,width:n=D.width,height:r=D.height}=e,{density:i=`comfortable`,awake:a}=e;return(0,E.jsxs)(`div`,{style:{position:`relative`,width:n,height:r},children:[(0,E.jsx)(re,{width:n,height:r,x:l(0),y:l(1),label:A,children:C}),(0,E.jsx)(ae,{width:n,density:i,awake:a,children:t})]})}function ue(){let[e,t]=(0,T.useState)(`species`),[n,r]=(0,T.useState)(`coverage`);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(o,{label:`Colour by`,help:j,value:e,options:N,onChange:t}),(0,E.jsx)(_,{label:`Group outlines`,help:M,value:n,options:P,onChange:r})]})}function b(){let[e,t]=(0,T.useState)(`species`);return(0,E.jsx)(o,{label:`Colour by`,help:j,value:e,options:N,onChange:t})}function x(){let[e,t]=(0,T.useState)(`0`),[n,r]=(0,T.useState)(`1`),[a,s]=(0,T.useState)(3.5),[c,l]=(0,T.useState)(!1),[u,d]=(0,T.useState)(`replace`);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(_,{label:`Across`,value:e,options:I,onChange:t}),(0,E.jsx)(_,{label:`Up`,value:n,options:I,onChange:r}),(0,E.jsx)(se,{label:`Dot size`,value:a,min:1,max:12,step:.5,digits:1,unit:`px`,onChange:s}),(0,E.jsx)(ce,{label:`Group means`,checked:c,onChange:l}),(0,E.jsx)(le,{}),(0,E.jsx)(o,{label:`Dragging`,value:u,options:F,onChange:d}),(0,E.jsx)(i,{text:`Reset view`,icon:`reset`,onClick:w})]})}function S(e){return(0,E.jsxs)(`figure`,{style:Y,children:[e.children,(0,E.jsx)(`figcaption`,{style:Z,children:e.caption})]})}function C(e){let t=[];for(let n=0;n<f.length;n++){let r=d[ee[n]??-1];t.push((0,E.jsx)(`circle`,{cx:c(e.x,f[n]??0),cy:c(e.y,te[n]??0),r:3,fill:r?.color??`var(--text-muted)`,fillOpacity:.75},`flower-${n}`))}return(0,E.jsx)(`g`,{children:t})}function w(){}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{T=t(),s(),ne(),r(),m(),v(),ie(),oe(),a(),h(),g(),u(),E=n(),D={width:720,height:400},O={width:420,height:260},k={width:360,height:320},A=`One dot per iris flower, on the first two principal components.`,j={title:`Colour by`,body:`What the colour of a dot stands for. Turned off, every flower is drawn in one ink and the map is read for its shape alone.`},M={title:`Group outlines`,body:`The ring drawn around each species, sized so that it covers the share of that species you ask for.`,example:{code:`95% of samples`,note:`Nineteen flowers in twenty fall inside the ring.`}},N=[{value:`species`,label:`Species`},{value:`none`,label:`Nothing`}],P=[{value:`none`,label:`None`},{value:`sd1`,label:`1 SD`},{value:`coverage`,label:`95% of samples`}],F=[{value:`replace`,label:`Replace`},{value:`add`,label:`Add`},{value:`remove`,label:`Remove`}],I=[0,1,2,3].map(e=>({value:String(e),label:l(e).label??``})),L=[`top-left`,`top-right`,`bottom-left`,`bottom-right`],R={title:`Overlay/OverlayBar`,component:p,args:{label:`Options`,placement:`top-right`,children:(0,E.jsx)(ue,{})},parameters:{layout:`padded`,docs:{description:{component:`The small card of controls a figure is driven from. Reach for it when the reader has to change what a picture shows without leaving it: it rests at three quarters strength over the figure, wakes when the pointer arrives or a control takes the focus, and folds into a cog once the figure is too narrow to carry a strip.`}}},render:e=>(0,E.jsx)(y,{children:(0,E.jsx)(p,{...e})})},z={},B={args:{more:(0,E.jsx)(x,{})}},V={args:{children:(0,E.jsx)(b,{})},render:e=>(0,E.jsx)(`div`,{style:K,children:L.map(t=>(0,E.jsx)(S,{caption:t,children:(0,E.jsx)(y,{...O,children:(0,E.jsx)(p,{...e,placement:t})})},t))})},H={render:e=>(0,E.jsxs)(`div`,{style:J,children:[(0,E.jsxs)(S,{caption:`above`,children:[(0,E.jsx)(`div`,{style:X,children:(0,E.jsx)(p,{...e,placement:`above`})}),(0,E.jsx)(y,{width:D.width,height:260})]}),(0,E.jsxs)(S,{caption:`below`,children:[(0,E.jsx)(y,{width:D.width,height:260}),(0,E.jsx)(`div`,{style:X,children:(0,E.jsx)(p,{...e,placement:`below`})})]})]})},U={args:{children:(0,E.jsx)(b,{})},render:e=>(0,E.jsxs)(`div`,{style:q,children:[(0,E.jsx)(S,{caption:`compact`,children:(0,E.jsx)(y,{...O,density:`compact`,children:(0,E.jsx)(p,{...e})})}),(0,E.jsx)(S,{caption:`comfortable`,children:(0,E.jsx)(y,{...O,children:(0,E.jsx)(p,{...e})})})]})},W={args:{children:(0,E.jsx)(b,{})},render:e=>(0,E.jsxs)(`div`,{style:q,children:[(0,E.jsx)(S,{caption:`resting — nothing is pointing at the figure`,children:(0,E.jsx)(y,{...O,awake:!1,children:(0,E.jsx)(p,{...e})})}),(0,E.jsx)(S,{caption:`awake — the pointer is over the figure`,children:(0,E.jsx)(y,{...O,awake:!0,children:(0,E.jsx)(p,{...e})})})]})},G={render:e=>(0,E.jsx)(y,{...k,children:(0,E.jsx)(p,{...e,more:(0,E.jsx)(x,{})})})},K={display:`grid`,gridTemplateColumns:`repeat(2, max-content)`,gap:16},q={display:`flex`,flexWrap:`wrap`,gap:16},J={display:`flex`,flexDirection:`column`,gap:20},Y={display:`flex`,flexDirection:`column`,margin:0,gap:6},X={display:`flex`,width:D.width,justifyContent:`flex-end`},Z={color:`var(--text-muted)`,fontSize:13},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{}`,...z.parameters?.docs?.source},description:{story:`Two controls over the map, in the corner the flowers leave emptiest. Move
the pointer onto the figure and the card comes up to full strength; move it
away and the ground fades back while every word on it stays readable.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    more: <MoreControls />
  }
}`,...B.parameters?.docs?.source},description:{story:`The same strip with everything else behind the cog: the axes, the dot size,
what a drag does, and the two buttons that act rather than change. That is
the whole design — a reader who has never met a component still has an
opinion about the two on the strip, and nothing else belongs on the picture.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    children: <ColourControl />
  },
  render: args => <div style={GRID_STYLE}>
      {CORNERS.map(corner => <Panel key={corner} caption={corner}>
          <Figure {...HALF}>
            <OverlayBar {...args} placement={corner} />
          </Figure>
        </Panel>)}
    </div>
}`,...V.parameters?.docs?.source},description:{story:"Each corner in turn. Pick the one the data leaves emptiest, which `emptiestCorner` answers from the points themselves.",...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => <div style={STACK_STYLE}>
      <Panel caption="above">
        <div style={DOCK_STYLE}>
          <OverlayBar {...args} placement="above" />
        </div>
        <Figure width={FIGURE.width} height={260} />
      </Panel>
      <Panel caption="below">
        <Figure width={FIGURE.width} height={260} />
        <div style={DOCK_STYLE}>
          <OverlayBar {...args} placement="below" />
        </div>
      </Panel>
    </div>
}`,...H.parameters?.docs?.source},description:{story:`The escape hatch for a figure whose data reaches all four corners: the card
leaves the picture entirely and is laid out above or below it, keeping its
shape and losing only its translucency.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    children: <ColourControl />
  },
  render: args => <div style={ROW_STYLE}>
      <Panel caption="compact">
        <Figure {...HALF} density="compact">
          <OverlayBar {...args} />
        </Figure>
      </Panel>
      <Panel caption="comfortable">
        <Figure {...HALF}>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
    </div>
}`,...U.parameters?.docs?.source},description:{story:`How tightly the layer packs the controls. A finger overrides both, whatever the figure asked for.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    children: <ColourControl />
  },
  render: args => <div style={ROW_STYLE}>
      <Panel caption="resting — nothing is pointing at the figure">
        <Figure {...HALF} awake={false}>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
      <Panel caption="awake — the pointer is over the figure">
        <Figure {...HALF} awake>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
    </div>
}`,...W.parameters?.docs?.source},description:{story:`The two strengths side by side, held rather than watched, so the difference
can be seen without chasing it with the pointer. Only the ground moves: the
captions and the values are at full strength in both.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => <Figure {...NARROW}>
      <OverlayBar {...args} more={<MoreControls />} />
    </Figure>
}`,...G.parameters?.docs?.source},description:{story:`Under 420 px the strip would take a third of the picture, so the card folds
itself into a cog. Press it: folded, that one button holds the strip and the
second tier alike, so no control is lost with the room to write it.`,...G.parameters?.docs?.description}}},Q=[`Default`,`SecondTier`,`EveryCorner`,`Docked`,`Density`,`RestingAndAwake`,`Collapsed`]})))()}$();export{G as Collapsed,z as Default,U as Density,H as Docked,V as EveryCorner,W as RestingAndAwake,B as SecondTier,Q as __namedExportsOrder,R as default};