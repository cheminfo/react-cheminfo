import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,r,s as i}from"./lookup-BEihzhtr.js";import{h as a,n as o}from"./iframe-Bf7Xc74g.js";import{n as s,t as c}from"./CiteButton-Cu2NrKTZ.js";import{n as l,t as ee}from"./NavLink-BN_XRxmY.js";import{n as te,t as u}from"./AccountButton-DtmCzS6f.js";import{a as d,i as ne,o as re,s as f,t as p}from"./chromeFixtures-DGilVrnk.js";import{r as m,t as h}from"./paper-hlNfT5ST.js";import{n as g,t as _}from"./EcosystemButton-CMyVvOsv.js";import{n as v,t as y}from"./NavMenuButton-CO2i6rxx.js";import{n as b,t as x}from"./ShareButton-D4rY1Set.js";import{n as S,t as C}from"./SiteFooter-D9_FyqCK.js";import{i as w,n as T,r as E,t as D}from"./useCompactHeader-sPqDlb2P.js";function O(e){return e.siteId??`smiles`}function ie(e){let t=(0,M.useRef)(null),n=T(t,{maxWidth:640}),{nav:r,activeId:i}=e,a=O(e);return(0,N.jsx)(j,{siteId:a,children:(0,N.jsxs)(`div`,{style:{padding:`1.25rem`},children:[(0,N.jsx)(`div`,{ref:t,style:X,children:(0,N.jsx)(E,{...e,nav:n?[Z]:r,actions:(0,N.jsx)(k,{siteId:a,compact:n}),share:(0,N.jsx)(A,{compact:n}),renderNavItem:n?()=>(0,N.jsx)(y,{label:`Pages`,icon:`menu`,items:r,activeId:i}):void 0})}),(0,N.jsxs)(`p`,{style:{...I,padding:`0.75rem 0 0`},children:[`useCompactHeader: `,(0,N.jsx)(`code`,{children:String(n)}),` — drag the right edge of the bar past 640 px.`]})]})})}function k(e){let{siteId:t,compact:n=!1}=e;return(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)(c,{reference:h,compact:n}),(0,N.jsx)(_,{currentSiteId:t,compact:n})]})}function A(e){let{compact:t=!1}=e;return(0,N.jsx)(x,{onClick:f,compact:t})}function j(e){let t=n(e.siteId),r={"--brand":t.brand,"--brand-alt":t.brandAlt,"--accent":t.brand};return(0,N.jsx)(`div`,{style:r,children:e.children})}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{M=a(),te(),l(),v(),S(),w(),D(),s(),r(),t(),g(),b(),re(),m(),N=o(),P=i.map(e=>e.id),F=`
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`,I={padding:`0.75rem 1.25rem 0`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},L={title:`Chrome/SiteHeader`,component:E,args:{siteId:`smiles`,nav:d,activeId:`draw`,markSize:28,homeHref:`/`,embedded:!1},argTypes:{siteId:{control:`select`,options:P},activeId:{control:`select`,options:d.map(e=>e.id)},markSize:{control:{type:`range`,min:16,max:48,step:2}},homeHref:{control:`text`},embedded:{control:`boolean`},nav:{control:!1},actions:{control:!1},share:{control:!1},account:{control:!1},renderNavItem:{control:!1},onHome:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.`}}},render:e=>(0,N.jsx)(j,{siteId:O(e),children:(0,N.jsx)(E,{...e,actions:(0,N.jsx)(k,{siteId:O(e)}),share:(0,N.jsx)(A,{})})})},R={},z={render:e=>(0,N.jsx)(j,{siteId:O(e),children:(0,N.jsx)(E,{...e,actions:(0,N.jsx)(k,{siteId:O(e)}),share:(0,N.jsx)(A,{}),account:(0,N.jsx)(u,{identity:{name:`Luc Patiny`,detail:`admin`},onSignOut:f})})})},B={render:()=>(0,N.jsx)(`div`,{style:G,children:ne.map(e=>(0,N.jsx)(j,{siteId:e.siteId,children:(0,N.jsx)(E,{siteId:e.siteId,nav:e.nav,activeId:e.activeId,actions:(0,N.jsx)(k,{siteId:e.siteId}),share:(0,N.jsx)(A,{})})},e.siteId))})},V={render:e=>(0,N.jsxs)(j,{siteId:O(e),children:[(0,N.jsx)(`style`,{children:F}),(0,N.jsx)(E,{...e,actions:(0,N.jsx)(k,{siteId:O(e)}),share:(0,N.jsx)(A,{}),renderNavItem:(e,t)=>(0,N.jsx)(ee,{item:e,active:t,className:e.id===`tutorial`?`sb-hovered`:void 0})}),(0,N.jsx)(`p`,{style:I,children:`Draw is the page on show; Tutorial is drawn as the pointer leaves it.`})]})},H={render:e=>(0,N.jsx)(ie,{...e})},U={render:e=>(0,N.jsx)(j,{siteId:O(e),children:(0,N.jsxs)(`div`,{style:K,children:[(0,N.jsx)(E,{...e,actions:(0,N.jsx)(k,{siteId:O(e)}),share:(0,N.jsx)(A,{})}),(0,N.jsx)(`main`,{style:q,children:(0,N.jsxs)(`div`,{style:J,children:[(0,N.jsx)(`h1`,{style:{margin:0,fontSize:`1.25rem`},children:p.name}),(0,N.jsxs)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:[`Monoisotopic mass `,p.monoisotopicMass]}),(0,N.jsx)(`code`,{style:Y,children:p.smiles}),(0,N.jsx)(`code`,{style:Y,children:p.inchiKey})]})}),(0,N.jsx)(C,{siteId:O(e),layout:`row`})]})})},W={render:e=>(0,N.jsxs)(j,{siteId:O(e),children:[(0,N.jsx)(E,{...e,actions:(0,N.jsx)(k,{siteId:O(e)}),share:(0,N.jsx)(A,{})}),(0,N.jsxs)(`p`,{style:I,children:[`Above, the bar. Below, the same bar with `,(0,N.jsx)(`code`,{children:`embedded`}),`, which draws nothing.`]}),(0,N.jsx)(E,{...e,embedded:!0})]})},G={display:`flex`,minHeight:`100vh`,flexDirection:`column`,padding:`1.5rem`,background:`var(--surface-sunken)`,gap:`1.5rem`},K={display:`flex`,minHeight:`100vh`,flexDirection:`column`,background:`var(--surface-sunken)`},q={width:`100%`,maxWidth:`var(--page-max)`,flex:`1 1 auto`,padding:`1.5rem 1.25rem`,margin:`0 auto`},J={display:`flex`,maxWidth:`32rem`,flexDirection:`column`,padding:`1rem 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.5rem`},Y={overflowWrap:`anywhere`,fontSize:`0.8125rem`},X={overflow:`auto`,width:520,minWidth:320,maxWidth:`100%`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,resize:`horizontal`},Z={id:`pages`,label:`Pages`},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} account={<AccountButton identity={{
      name: 'Luc Patiny',
      detail: 'admin'
    }} onSignOut={noop} />} />
    </SiteTokens>
}`,...z.parameters?.docs?.source},description:{story:`Signed in: the account's mark closes the bar, after Share.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div style={STACK_STYLE}>
      {SITE_BARS.map(bar => <SiteTokens key={bar.siteId} siteId={bar.siteId}>
          <SiteHeader siteId={bar.siteId} nav={bar.nav} activeId={bar.activeId} actions={<Utilities siteId={bar.siteId} />} share={<Share />} />
        </SiteTokens>)}
    </div>
}`,...B.parameters?.docs?.source},description:{story:`The same bar on four sites, one under the other: the geometry, the type and
the neutrals never move — only the two colours and the pages do.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <style>{HOVER_RULE}</style>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} renderNavItem={(item, isActive) => <NavLink item={item} active={isActive} className={item.id === 'tutorial' ? 'sb-hovered' : undefined} />} />
      <p style={CAPTION_STYLE}>
        Draw is the page on show; Tutorial is drawn as the pointer leaves it.
      </p>
    </SiteTokens>
}`,...V.parameters?.docs?.source},description:{story:`The page on show, in the brand tint, beside a page under the pointer: the
hover is the neutral wash, so it never impersonates where you are.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => <NarrowBar {...args} />
}`,...H.parameters?.docs?.source},description:{story:`A bar with no room left: \`useCompactHeader\` measures the bar itself, so the
utilities give up their labels and the pages fold into one menu rather than
being pushed off the edge. Drag the right edge to widen it.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <div style={PAGE_STYLE}>
        <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} />
        <main style={MAIN_STYLE}>
          <div style={CARD_STYLE}>
            <h1 style={{
            margin: 0,
            fontSize: '1.25rem'
          }}>{CAFFEINE.name}</h1>
            <p style={{
            margin: 0,
            color: 'var(--text-muted)'
          }}>
              Monoisotopic mass {CAFFEINE.monoisotopicMass}
            </p>
            <code style={CODE_STYLE}>{CAFFEINE.smiles}</code>
            <code style={CODE_STYLE}>{CAFFEINE.inchiKey}</code>
          </div>
        </main>
        <SiteFooter siteId={familySite(args)} layout="row" />
      </div>
    </SiteTokens>
}`,...U.parameters?.docs?.source},description:{story:`Header, page and footer together — the whole chrome a site imports.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} />
      <p style={CAPTION_STYLE}>
        Above, the bar. Below, the same bar with <code>embedded</code>, which
        draws nothing.
      </p>
      <SiteHeader {...args} embedded />
    </SiteTokens>
}`,...W.parameters?.docs?.source},description:{story:`A framed page is given no bar at all: what frames it carries its own.`,...W.parameters?.docs?.description}}},Q=[`Default`,`SignedIn`,`EverySite`,`ActiveAndHovered`,`Narrow`,`WholePage`,`Embedded`]})))()}$();export{V as ActiveAndHovered,R as Default,W as Embedded,B as EverySite,H as Narrow,z as SignedIn,U as WholePage,Q as __namedExportsOrder,L as default};