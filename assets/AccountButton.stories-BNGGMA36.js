import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Cy89bvdA.js";import{n,t as r}from"./useT--7w_Ff17.js";import{i,n as a,r as o,t as s}from"./menuItem-BWYGYghH.js";import{i as c,r as l}from"./popoverNextMigrationUtils-DB3KyRhI.js";import{n as u,t as d}from"./menuDivider-DSyvalmH.js";import{n as f}from"./navItem-6b8YIPQN.js";import{c as p,l as m,o as h,s as g}from"./chromeFixtures-UUnsH0uT.js";function _(e){let{identity:t,loading:r=!1,signInHref:i,onSignIn:a,onSignOut:c,signInLabel:u,items:m=[]}=e,h=n();if(r)return(0,b.jsx)(`span`,{className:`account-button__pending`,"aria-hidden":`true`});if(t===null)return(0,b.jsx)(p,{className:`account-button account-button--out`,item:{id:`account`,label:u??h(`account.signIn`),href:i,onSelect:a}});let{name:g,detail:_,initials:y=v(g)}=t;return(0,b.jsx)(l,{placement:`bottom-end`,content:(0,b.jsxs)(o,{className:`nav-menu account-menu`,children:[(0,b.jsxs)(`li`,{className:`account-menu__identity`,children:[(0,b.jsx)(`span`,{className:`account-menu__name`,children:g}),_===void 0?null:(0,b.jsx)(`span`,{className:`account-menu__detail`,children:_})]}),(0,b.jsx)(d,{}),m.map(e=>(0,b.jsx)(s,{icon:e.icon,text:e.label,href:e.href,target:e.external?`_blank`:void 0,onClick:t=>{e.onSelect===void 0||f(t)||(t.preventDefault(),e.onSelect())}},e.id)),m.length===0?null:(0,b.jsx)(d,{}),(0,b.jsx)(s,{icon:`log-out`,text:h(`account.signOut`),onClick:c})]}),children:(0,b.jsx)(`button`,{type:`button`,className:`nav-link nav-link--icon account-button account-button--in`,title:h(`account.signedInAs`,{name:g}),"aria-label":h(`account.signedInAs`,{name:g}),children:(0,b.jsx)(`span`,{className:`account-mark`,children:y})})})}function v(e){let[t,n]=e.split(/\s+/).filter(e=>e!==``);return t===void 0?`?`:n===void 0?y(t):`${t.charAt(0)}${n.charAt(0)}`.toUpperCase()}function y(e){let[t=``]=e.split(`@`);return(t===``?e:t).slice(0,2).toUpperCase()}var b;function x(){return(x=e((()=>{i(),u(),a(),c(),r(),m(),b=t(),_.__docgenInfo={description:`The one utility of the bar that says who the site is answering to: an
invitation when nobody is signed in, and the account's mark when somebody is.

The two states are told apart by whether an identity is on screen, never by
the direction of an arrow. Blueprint's \`log-in\` and \`log-out\` are the same
arrow either side of the same door, and at 14 px among four other monochrome
glyphs nobody reads which side it is on — a site drawing one reports the
visitor as signed in while they are signed out. So the invitation is the
words \`Sign in\`, which no mark can be mistaken for, and being signed in is
the person's own initials.
@param props - Who is signed in, what signing in and out do, and the pages
the account's menu lists.
@returns The entry, or nothing while the site is still asking.`,methods:[],displayName:`AccountButton`,props:{identity:{required:!0,tsType:{name:`union`,raw:`AccountIdentity | null`,elements:[{name:`AccountIdentity`},{name:`null`}]},description:"Who is signed in, or `null` when nobody is."},loading:{required:!1,tsType:{name:`boolean`},description:`Whether the site has not heard back yet. Neither state is drawn until it
has: a bar that offers to sign in and then turns into a name has told the
visitor something false, and it is the state they act on first.
@default false`},signInHref:{required:!1,tsType:{name:`string`},description:`The address signing in happens at, for a site with a page of its own for
it. Writing it keeps the entry a real link, so a middle click opens a tab.
@default undefined`},onSignIn:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the invitation is picked — route to that page, or
open a credentials dialog for a site that has no page.
@default undefined`},onSignOut:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when Sign out is picked.
@default undefined`},signInLabel:{required:!1,tsType:{name:`string`},description:`What the invitation reads, for a site whose accounts are for one kind of
person — "Teacher sign in". Two words: it is written out in the bar rather
than folded into a glyph.
@default the chrome's own word for it, in the language of the page`},items:{required:!1,tsType:{name:`unknown`},description:`The account's own pages, listed above Sign out — a profile, a settings
page.
@default undefined`}}}})))()}async function S(e){e.canvasElement.querySelector(`button`)?.click(),await new Promise(e=>{setTimeout(e,50)});let t=document.activeElement;t instanceof HTMLElement&&t.blur()}var C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{x(),m(),h(),C=t(),w={display:`flex`,height:`var(--header-height)`,alignItems:`center`,padding:`0 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.15rem`},T={title:`Chrome/AccountButton`,component:_,args:{identity:{name:`Ada Lovelace`,detail:`ada.lovelace@epfl.ch`},onSignIn:g,onSignOut:g,signInHref:`/login`},argTypes:{signInLabel:{control:`text`},loading:{control:`boolean`},identity:{control:!1},items:{control:!1}},parameters:{docs:{description:{component:`The utility that says who the site is answering to. The two states are told apart by whether an identity is on screen, never by the direction of an arrow: the invitation is written out in words, and being signed in is the person's own initials.`}}}},E={},D={parameters:{layout:`padded`},play:S},O={args:{identity:null}},k={args:{identity:null,signInLabel:`Teacher sign in`}},A={parameters:{layout:`padded`},args:{items:[{id:`settings`,label:`Settings`,href:`/settings`,icon:`cog`}]},play:S},j={parameters:{layout:`padded`},render:e=>(0,C.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,C.jsxs)(`div`,{style:w,className:`app-header-actions`,children:[(0,C.jsx)(p,{item:N}),(0,C.jsx)(_,{...e,identity:null})]}),(0,C.jsxs)(`div`,{style:w,className:`app-header-actions`,children:[(0,C.jsx)(p,{item:N}),(0,C.jsx)(_,{...e})]})]})},M={args:{loading:!0}},N={id:`about`,label:`About`,icon:`info-sign`,href:`/about`},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source},description:{story:`Somebody is signed in: their initials, and their name on hover.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  play: openMenu
}`,...D.parameters?.docs?.source},description:{story:`The menu the mark opens: who it belongs to, and the way out.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    identity: null
  }
}`,...O.parameters?.docs?.source},description:{story:`Nobody is signed in, and the bar says so in words no mark can impersonate.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    identity: null,
    signInLabel: 'Teacher sign in'
  }
}`,...k.parameters?.docs?.source},description:{story:`A site whose accounts are for one kind of person says so in the invitation.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`The account's own pages, listed above Sign out.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`The two states in the bar they belong to, one under the other: what the
arrow through a door could not say, and the reason this component exists.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...M.parameters?.docs?.source},description:{story:`Still asking: neither state, at the width the mark will take.`,...M.parameters?.docs?.description}}},P=[`SignedIn`,`MenuOpened`,`SignedOut`,`NamesWhoSignsIn`,`WithAccountPages`,`BothStatesInTheBar`,`StillAsking`]})))()}F();export{j as BothStatesInTheBar,D as MenuOpened,k as NamesWhoSignsIn,E as SignedIn,O as SignedOut,M as StillAsking,A as WithAccountPages,P as __namedExportsOrder,T as default};