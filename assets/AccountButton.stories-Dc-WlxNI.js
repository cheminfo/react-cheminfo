import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CW9L6ypY.js";import{c as n,l as r,o as i,s as a}from"./chromeFixtures-BEqQd889.js";import{n as o,t as s}from"./AccountButton-Z7D6Pks0.js";async function c(e){e.canvasElement.querySelector(`button`)?.click(),await new Promise(e=>{setTimeout(e,50)});let t=document.activeElement;t instanceof HTMLElement&&t.blur()}var l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{o(),r(),i(),l=t(),u={display:`flex`,height:`var(--header-height)`,alignItems:`center`,padding:`0 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.15rem`},d={title:`Chrome/AccountButton`,component:s,args:{identity:{name:`Ada Lovelace`,detail:`ada.lovelace@epfl.ch`},onSignIn:a,onSignOut:a,signInHref:`/login`},argTypes:{signInLabel:{control:`text`},loading:{control:`boolean`},identity:{control:!1},items:{control:!1}},parameters:{docs:{description:{component:`The utility that says who the site is answering to. The two states are told apart by whether an identity is on screen, never by the direction of an arrow: the invitation is written out in words, and being signed in is the person's own initials.`}}}},f={},p={parameters:{layout:`padded`},play:c},m={args:{identity:null}},h={args:{identity:null,signInLabel:`Teacher sign in`}},g={parameters:{layout:`padded`},args:{items:[{id:`settings`,label:`Settings`,href:`/settings`,icon:`cog`}]},play:c},_={parameters:{layout:`padded`},render:e=>(0,l.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,l.jsxs)(`div`,{style:u,className:`app-header-actions`,children:[(0,l.jsx)(n,{item:y}),(0,l.jsx)(s,{...e,identity:null})]}),(0,l.jsxs)(`div`,{style:u,className:`app-header-actions`,children:[(0,l.jsx)(n,{item:y}),(0,l.jsx)(s,{...e})]})]})},v={args:{loading:!0}},y={id:`about`,label:`About`,icon:`info-sign`,href:`/about`},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Somebody is signed in: their initials, and their name on hover.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  play: openMenu
}`,...p.parameters?.docs?.source},description:{story:`The menu the mark opens: who it belongs to, and the way out.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    identity: null
  }
}`,...m.parameters?.docs?.source},description:{story:`Nobody is signed in, and the bar says so in words no mark can impersonate.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    identity: null,
    signInLabel: 'Teacher sign in'
  }
}`,...h.parameters?.docs?.source},description:{story:`A site whose accounts are for one kind of person says so in the invitation.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  args: {
    items: [{
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: 'cog'
    }]
  },
  play: openMenu
}`,...g.parameters?.docs?.source},description:{story:`The account's own pages, listed above Sign out.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  }}>
      <div style={ACTIONS_STYLE} className="app-header-actions">
        <NavLink item={ABOUT} />
        <AccountButton {...args} identity={null} />
      </div>
      <div style={ACTIONS_STYLE} className="app-header-actions">
        <NavLink item={ABOUT} />
        <AccountButton {...args} />
      </div>
    </div>
}`,..._.parameters?.docs?.source},description:{story:`The two states in the bar they belong to, one under the other: what the
arrow through a door could not say, and the reason this component exists.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...v.parameters?.docs?.source},description:{story:`Still asking: neither state, at the width the mark will take.`,...v.parameters?.docs?.description}}},b=[`SignedIn`,`MenuOpened`,`SignedOut`,`NamesWhoSignsIn`,`WithAccountPages`,`BothStatesInTheBar`,`StillAsking`]})))()}x();export{_ as BothStatesInTheBar,p as MenuOpened,h as NamesWhoSignsIn,f as SignedIn,m as SignedOut,v as StillAsking,g as WithAccountPages,b as __namedExportsOrder,d as default};