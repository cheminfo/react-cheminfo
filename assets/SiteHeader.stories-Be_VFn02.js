import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-NhtRTM8t.js";import{r,t as i}from"./paper-DSkDr5Uk.js";import{n as a,t as o}from"./CiteButton-KaM9KNy_.js";import{i as s,n as c,r as l,t as u}from"./lookup-D4naSy63.js";import{n as d,t as ee}from"./marks-CInxm7M3.js";import{n as te,t as ne}from"./EcosystemButton-CjpbgL5R.js";import{a as f,c as p,d as m,i as h,l as g,o as re,s as ie,t as _}from"./chromeFixtures-BV7_jyNw.js";import"./chrome-DvEgqYt1.js";import{n as ae,t as oe}from"./NavMenuButton-Bn76fqcB.js";import{n as se,t as v}from"./ShareButton-XoNqYKqU.js";import{n as ce,t as le}from"./SiteFooter-CFW3UVA4.js";import{n as ue,t as y}from"./Wordmark-D0TRnEAv.js";function b(e){let{siteId:t,nav:n,activeId:r,actions:i,renderNavItem:a,embedded:o=!1,homeHref:s=`/`,onHome:l,markSize:u=28}=e;if(o)return null;let d=c(t);return(0,S.jsx)(`header`,{className:`app-header no-print`,children:(0,S.jsxs)(`div`,{className:`app-header__inner`,children:[(0,S.jsxs)(`a`,{className:`brand`,href:s,title:d.host,onClick:e=>{l===void 0||m(e)||(e.preventDefault(),l())},children:[(0,S.jsx)(ee,{siteId:t,size:u}),(0,S.jsx)(y,{siteId:t})]}),(0,S.jsx)(`nav`,{className:`app-header-nav`,children:n.map(e=>(0,S.jsx)(x.Fragment,{children:a===void 0?(0,S.jsx)(p,{item:e,active:e.id===r}):a(e,e.id===r)},e.id))}),(0,S.jsx)(`span`,{className:`spacer`}),i===void 0?null:(0,S.jsx)(`div`,{className:`app-header-actions`,children:i})]})})}var x,S;function C(){return(C=e((()=>{x=t(),u(),ue(),d(),g(),S=n(),b.__docgenInfo={description:`The bar every site of the family carries: the brand linking home at the left,
the pages next to it, and the utilities pushed to the right edge by the
spacer.
@param props - The site, its pages, its utilities, and whether the page is
framed in another site.
@returns The bar, or nothing at all on an embedded page.`,methods:[],displayName:`SiteHeader`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'derepflow'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`}]},description:`The site the bar belongs to, which draws its mark and writes its name.`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them.`},activeId:{required:!1,tsType:{name:`string`},description:"Which of the pages is on show, named by its `id`.\n@default undefined"},actions:{required:!1,tsType:{name:`ReactNode`},description:"The utilities pushed to the right edge — Cite, Tools, Share, sign in. They\narrive dressed as bar items, so a plain `nav-link` and a `CiteButton` read\nalike beside each other.\n@default undefined"},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way, for a bar whose entries need a tooltip
or a wrapper of their own.
@default undefined`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site, in which case no bar is drawn
at all — what a host page frames already carries its own navigation.
@default false`},homeHref:{required:!1,tsType:{name:`string`},description:`Where the brand leads.
@default '/'`},onHome:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the brand is picked, for a page that routes in
place. A modified click is left to the browser.
@default undefined`},markSize:{required:!1,tsType:{name:`number`},description:`Edge of the site's mark, in pixels.
@default 28`}}}})))()}function w(e,t={}){let{maxWidth:n=k}=t,r=(0,O.useCallback)(t=>E(e?.current??null,t),[e]),i=(0,O.useCallback)(()=>T(e?.current??null,n),[e,n]);return(0,O.useSyncExternalStore)(r,i,D)}function T(e,t=k){let n=e===null?0:e.clientWidth,r=n>0?n:globalThis.innerWidth;return!Number.isFinite(r)||r<=0?!1:r<=t}function E(e,t){if(e!==null&&typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return globalThis.addEventListener(`resize`,t),()=>globalThis.removeEventListener(`resize`,t)}function D(){return!1}var O,k;function A(){return(A=e((()=>{O=t(),k=1e3})))()}function de(e){let t=(0,N.useRef)(null),n=w(t,{maxWidth:640}),{nav:r,activeId:i,siteId:a}=e;return(0,P.jsx)(M,{siteId:a,children:(0,P.jsxs)(`div`,{style:{padding:`1.25rem`},children:[(0,P.jsx)(`div`,{ref:t,style:X,children:(0,P.jsx)(b,{...e,nav:n?[Z]:r,actions:(0,P.jsx)(j,{siteId:a,compact:n}),renderNavItem:n?()=>(0,P.jsx)(oe,{label:`Pages`,icon:`menu`,items:r,activeId:i}):void 0})}),(0,P.jsxs)(`p`,{style:{...L,padding:`0.75rem 0 0`},children:[`useCompactHeader: `,(0,P.jsx)(`code`,{children:String(n)}),` — drag the right edge of the bar past 640 px.`]})]})})}function j(e){let{siteId:t,compact:n=!1}=e;return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(o,{reference:i,compact:n}),(0,P.jsx)(ne,{currentSiteId:t,compact:n}),(0,P.jsx)(v,{onClick:ie,compact:n})]})}function M(e){let t=c(e.siteId),n={"--brand":t.brand,"--brand-alt":t.brandAlt,"--accent":t.brand};return(0,P.jsx)(`div`,{style:n,children:e.children})}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{N=t(),g(),ae(),ce(),C(),A(),a(),u(),s(),te(),se(),re(),r(),P=n(),F=l.map(e=>e.id),I=`
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`,L={padding:`0.75rem 1.25rem 0`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},R={title:`Chrome/SiteHeader`,component:b,args:{siteId:`smiles`,nav:f,activeId:`draw`,markSize:28,homeHref:`/`,embedded:!1},argTypes:{siteId:{control:`select`,options:F},activeId:{control:`select`,options:f.map(e=>e.id)},markSize:{control:{type:`range`,min:16,max:48,step:2}},homeHref:{control:`text`},embedded:{control:`boolean`},nav:{control:!1},actions:{control:!1},renderNavItem:{control:!1},onHome:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.`}}},render:e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})})})},z={},B={render:()=>(0,P.jsx)(`div`,{style:G,children:h.map(e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsx)(b,{siteId:e.siteId,nav:e.nav,activeId:e.activeId,actions:(0,P.jsx)(j,{siteId:e.siteId})})},e.siteId))})},V={render:e=>(0,P.jsxs)(M,{siteId:e.siteId,children:[(0,P.jsx)(`style`,{children:I}),(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId}),renderNavItem:(e,t)=>(0,P.jsx)(p,{item:e,active:t,className:e.id===`tutorial`?`sb-hovered`:void 0})}),(0,P.jsx)(`p`,{style:L,children:`Draw is the page on show; Tutorial is drawn as the pointer leaves it.`})]})},H={render:e=>(0,P.jsx)(de,{...e})},U={render:e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsxs)(`div`,{style:K,children:[(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})}),(0,P.jsx)(`main`,{style:q,children:(0,P.jsxs)(`div`,{style:J,children:[(0,P.jsx)(`h1`,{style:{margin:0,fontSize:`1.25rem`},children:_.name}),(0,P.jsxs)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:[`Monoisotopic mass `,_.monoisotopicMass]}),(0,P.jsx)(`code`,{style:Y,children:_.smiles}),(0,P.jsx)(`code`,{style:Y,children:_.inchiKey})]})}),(0,P.jsx)(le,{siteId:e.siteId,layout:`row`})]})})},W={render:e=>(0,P.jsxs)(M,{siteId:e.siteId,children:[(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})}),(0,P.jsxs)(`p`,{style:L,children:[`Above, the bar. Below, the same bar with `,(0,P.jsx)(`code`,{children:`embedded`}),`, which draws nothing.`]}),(0,P.jsx)(b,{...e,embedded:!0})]})},G={display:`flex`,minHeight:`100vh`,flexDirection:`column`,padding:`1.5rem`,background:`var(--surface-sunken)`,gap:`1.5rem`},K={display:`flex`,minHeight:`100vh`,flexDirection:`column`,background:`var(--surface-sunken)`},q={width:`100%`,maxWidth:`var(--page-max)`,flex:`1 1 auto`,padding:`1.5rem 1.25rem`,margin:`0 auto`},J={display:`flex`,maxWidth:`32rem`,flexDirection:`column`,padding:`1rem 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.5rem`},Y={overflowWrap:`anywhere`,fontSize:`0.8125rem`},X={overflow:`auto`,width:520,minWidth:320,maxWidth:`100%`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,resize:`horizontal`},Z={id:`pages`,label:`Pages`},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div style={STACK_STYLE}>
      {SITE_BARS.map(bar => <SiteTokens key={bar.siteId} siteId={bar.siteId}>
          <SiteHeader siteId={bar.siteId} nav={bar.nav} activeId={bar.activeId} actions={<Utilities siteId={bar.siteId} />} />
        </SiteTokens>)}
    </div>
}`,...B.parameters?.docs?.source},description:{story:`The same bar on four sites, one under the other: the geometry, the type and
the neutrals never move — only the two colours and the pages do.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={args.siteId}>
      <style>{HOVER_RULE}</style>
      <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} renderNavItem={(item, isActive) => <NavLink item={item} active={isActive} className={item.id === 'tutorial' ? 'sb-hovered' : undefined} />} />
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
  render: args => <SiteTokens siteId={args.siteId}>
      <div style={PAGE_STYLE}>
        <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} />
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
        <SiteFooter siteId={args.siteId} layout="row" />
      </div>
    </SiteTokens>
}`,...U.parameters?.docs?.source},description:{story:`Header, page and footer together — the whole chrome a site imports.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={args.siteId}>
      <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} />
      <p style={CAPTION_STYLE}>
        Above, the bar. Below, the same bar with <code>embedded</code>, which
        draws nothing.
      </p>
      <SiteHeader {...args} embedded />
    </SiteTokens>
}`,...W.parameters?.docs?.source},description:{story:`A framed page is given no bar at all: what frames it carries its own.`,...W.parameters?.docs?.description}}},Q=[`Default`,`EverySite`,`ActiveAndHovered`,`Narrow`,`WholePage`,`Embedded`]})))()}$();export{V as ActiveAndHovered,z as Default,W as Embedded,B as EverySite,H as Narrow,U as WholePage,Q as __namedExportsOrder,R as default};