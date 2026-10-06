import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CP1pcUc9.js";import{n,t as r}from"./menuItem-B_l5XKuJ.js";import{n as i,t as a}from"./menuDivider-CmZNgqF8.js";import{c as o,l as s,n as c,o as l,r as u,s as d}from"./chromeFixtures-CYrliO2c.js";import{n as f,r as p}from"./headerButton-DRQf5QD1.js";import{n as m,t as h}from"./NavMenuButton-BWOdKfsF.js";async function g(e){e.canvasElement.querySelector(`button`)?.click(),await new Promise(e=>{setTimeout(e,50)});let t=document.activeElement;t instanceof HTMLElement&&t.blur()}var _,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{i(),n(),s(),m(),l(),p(),_=t(),v={display:`flex`,height:`var(--header-height)`,alignItems:`center`,padding:`0 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.15rem`},y={title:`Chrome/NavMenuButton`,component:h,args:{label:`Learn`,items:u,icon:`learning`},argTypes:{label:{control:`text`},activeId:{control:`select`,options:u.map(e=>e.id)},placement:{control:`select`,options:f},items:{control:!1},children:{control:!1}},parameters:{docs:{description:{component:`The pages that do not need a place of their own in the bar, folded into one menu whose trigger is dressed as a bar item.`}}}},b={},x={parameters:{layout:`padded`},play:g},S={args:{activeId:`exercises`}},C={args:{children:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(a,{}),(0,_.jsx)(r,{icon:`reset`,text:`Clear all answers`,onClick:d})]})},parameters:{layout:`padded`},play:g},w={parameters:{layout:`padded`},render:e=>(0,_.jsxs)(`div`,{style:v,children:[(0,_.jsx)(o,{item:c,active:!0}),(0,_.jsx)(h,{...e})]})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  play: openMenu
}`,...x.parameters?.docs?.source},description:{story:`The menu as a reader needs to see it: opened on the pages it holds.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    activeId: 'exercises'
  }
}`,...S.parameters?.docs?.source},description:{story:`The trigger takes the brand tint when the page on show is one of its own, so
a folded page still says where you are.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        <MenuDivider />
        <MenuItem icon="reset" text="Clear all answers" onClick={noop} />
      </>
  },
  parameters: {
    layout: 'padded'
  },
  play: openMenu
}`,...C.parameters?.docs?.source},description:{story:`What the menu adds under the pages: a divider and an action of the site's.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={BAR_STYLE}>
      <NavLink item={DRAW_PAGE} active />
      <NavMenuButton {...args} />
    </div>
}`,...w.parameters?.docs?.source},description:{story:`In the bar it belongs to, beside the pages that kept a place of their own.`,...w.parameters?.docs?.description}}},T=[`Default`,`Opened`,`HoldsThePageOnShow`,`WithAction`,`InBar`]})))()}E();export{b as Default,S as HoldsThePageOnShow,w as InBar,x as Opened,C as WithAction,T as __namedExportsOrder,y as default};