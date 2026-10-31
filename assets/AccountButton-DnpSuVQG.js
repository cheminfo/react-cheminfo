import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BREZSgVw.js";import{n,t as r}from"./useT-CYnDXP0o.js";import{i,n as a,r as o,t as s}from"./menuItem-CYRKxNZ1.js";import{i as c,r as l}from"./popoverNextMigrationUtils-C08sFL3h.js";import{n as u,t as d}from"./menuDivider-Bzq1kBP2.js";import{n as f}from"./navItem-6b8YIPQN.js";import{n as p,t as m}from"./NavLink-BE1AFL8U.js";function h(e){let{identity:t,loading:r=!1,signInHref:i,onSignIn:a,onSignOut:c,signInLabel:u,items:p=[]}=e,h=n();if(r)return(0,v.jsx)(`span`,{className:`account-button__pending`,"aria-hidden":`true`});if(t===null)return(0,v.jsx)(m,{className:`account-button account-button--out`,item:{id:`account`,label:u??h(`account.signIn`),href:i,onSelect:a}});let{name:_,detail:y,initials:b=g(_)}=t;return(0,v.jsx)(l,{placement:`bottom-end`,content:(0,v.jsxs)(o,{className:`nav-menu account-menu`,children:[(0,v.jsxs)(`li`,{className:`account-menu__identity`,children:[(0,v.jsx)(`span`,{className:`account-menu__name`,children:_}),y===void 0?null:(0,v.jsx)(`span`,{className:`account-menu__detail`,children:y})]}),(0,v.jsx)(d,{}),p.map(e=>(0,v.jsx)(s,{icon:e.icon,text:e.label,href:e.href,target:e.external?`_blank`:void 0,onClick:t=>{e.onSelect===void 0||f(t)||(t.preventDefault(),e.onSelect())}},e.id)),p.length===0?null:(0,v.jsx)(d,{}),(0,v.jsx)(s,{icon:`log-out`,text:h(`account.signOut`),onClick:c})]}),children:(0,v.jsx)(`button`,{type:`button`,className:`nav-link nav-link--icon account-button account-button--in`,title:h(`account.signedInAs`,{name:_}),"aria-label":h(`account.signedInAs`,{name:_}),children:(0,v.jsx)(`span`,{className:`account-mark`,children:b})})})}function g(e){let[t,n]=e.split(/\s+/).filter(e=>e!==``);return t===void 0?`?`:n===void 0?_(t):`${t.charAt(0)}${n.charAt(0)}`.toUpperCase()}function _(e){let[t=``]=e.split(`@`);return(t===``?e:t).slice(0,2).toUpperCase()}var v;function y(){return(y=e((()=>{i(),u(),a(),c(),r(),p(),v=t(),h.__docgenInfo={description:`The one utility of the bar that says who the site is answering to: an
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
@default undefined`}}}})))()}export{y as n,h as t};