import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bx_6GVVU.js";import{n as r,r as i}from"./buttons-BQEDOKXZ.js";import{n as a,t as o}from"./tag-CV7nSadN.js";import{n as s,t as c}from"./CollapsibleSection-CrungTPI.js";import{i as l,n as u,t as d}from"./moleculeFixtures-BmLC_E8B.js";function f(e){return(0,h.jsx)(`dl`,{style:E,children:e.properties.map(e=>(0,h.jsxs)(`div`,{style:D,children:[(0,h.jsx)(`dt`,{style:O,children:e.name}),(0,h.jsx)(`dd`,{style:k,children:e.value})]},e.name))})}function p(){let[e,t]=(0,m.useState)({caffeine:!0,aspirin:!1});function n(e){t(t=>({...t,[e]:t[e]!==!0}))}function i(e){t({caffeine:e,aspirin:e})}return(0,h.jsxs)(`div`,{style:w,children:[(0,h.jsxs)(`div`,{style:T,children:[(0,h.jsx)(r,{size:`small`,text:`Expand all`,onClick:()=>i(!0)}),(0,h.jsx)(r,{size:`small`,text:`Collapse all`,onClick:()=>i(!1)})]}),(0,h.jsx)(c,{title:`Caffeine`,icon:`lab-test`,isOpen:e.caffeine,onToggle:()=>n(`caffeine`),children:(0,h.jsx)(f,{properties:u})}),(0,h.jsx)(c,{title:`Aspirin`,icon:`lab-test`,isOpen:e.aspirin,onToggle:()=>n(`aspirin`),children:(0,h.jsx)(f,{properties:d})})]})}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{i(),a(),m=t(),s(),l(),h=n(),g=e=>(0,h.jsx)(`div`,{style:C,children:(0,h.jsx)(e,{})}),_={title:`Disclosure/CollapsibleSection`,component:c,decorators:[g],args:{title:`Caffeine`,defaultOpen:!0,children:(0,h.jsx)(f,{properties:u})},argTypes:{title:{control:`text`},defaultOpen:{control:`boolean`},id:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`A titled block of a panel that folds away when its heading is pressed.`}}}},v={},y={args:{defaultOpen:!1}},b={args:{icon:`lab-test`}},x={args:{title:`Predicted signals`,icon:`pulse`,rightElement:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(o,{minimal:!0,round:!0,children:`14`}),(0,h.jsx)(r,{variant:`minimal`,size:`small`,icon:`duplicate`})]}),children:(0,h.jsx)(f,{properties:u})}},S={render:()=>(0,h.jsx)(p,{})},C={width:`min(28rem, 90vw)`,padding:`0.75rem 1rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`},w={display:`flex`,flexDirection:`column`,gap:8},T={display:`flex`,gap:6},E={display:`flex`,flexDirection:`column`,margin:0,gap:2},D={display:`flex`,alignItems:`baseline`,gap:8},O={flex:`0 0 11rem`,color:`var(--text-muted)`,fontSize:13},k={margin:0,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:13,overflowWrap:`anywhere`},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: false
  }
}`,...y.parameters?.docs?.source},description:{story:`A section a page opens folded, so only its heading is offered at first.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'lab-test'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Predicted signals',
    icon: 'pulse',
    rightElement: <>
        <Tag minimal round>
          14
        </Tag>
        <Button variant="minimal" size="small" icon="duplicate" />
      </>,
    children: <PropertyList properties={CAFFEINE_PROPERTIES} />
  }
}`,...x.parameters?.docs?.source},description:{story:`The count and the button beside the heading sit outside it, so pressing
either leaves the section open.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ExpandAllDemo />
}`,...S.parameters?.docs?.source},description:{story:`Two sections a parent drives, which is what an "expand all" button needs.`,...S.parameters?.docs?.description}}},A=[`Default`,`Closed`,`WithIcon`,`WithRightElement`,`Controlled`]})))()}j();export{y as Closed,S as Controlled,v as Default,b as WithIcon,x as WithRightElement,A as __namedExportsOrder,_ as default};