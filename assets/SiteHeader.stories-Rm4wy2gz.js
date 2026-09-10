import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CsLeyY0n.js";import{i as r,n as i,r as a,t as o}from"./lookup-Ba1XjkcU.js";import{n as s,t as ee}from"./Wordmark-D4buKD1O.js";import{n as c,t as te}from"./marks-B2TWaG6u.js";import"./chrome-DCqwiraY.js";import{r as l,t as u}from"./paper-tEyk6iyN.js";import{n as d,t as f}from"./CiteButton-CFtDyqBG.js";import{n as ne,t as p}from"./EcosystemButton-JrERtQT_.js";import{n as m}from"./navItem-6b8YIPQN.js";import{a as h,c as g,i as re,l as _,o as ie,s as ae,t as v}from"./chromeFixtures-vgvhMRbp.js";import{n as oe,t as y}from"./NavMenuButton-D5bpiAkx.js";import{n as se,t as ce}from"./ShareButton-Z7O-8Hmx.js";import{n as le,t as ue}from"./SiteFooter-DpbaJ4Sh.js";function b(e){let{siteId:t,nav:n,activeId:r,actions:a,renderNavItem:o,embedded:s=!1,homeHref:c=`/`,onHome:l,markSize:u=28,width:d=`page`}=e;if(s)return null;let f=i(t);return(0,S.jsx)(`header`,{className:`app-header no-print`,children:(0,S.jsxs)(`div`,{className:C[d],children:[(0,S.jsxs)(`a`,{className:`brand`,href:c,title:f.host,onClick:e=>{l===void 0||m(e)||(e.preventDefault(),l())},children:[(0,S.jsx)(te,{siteId:t,size:u}),(0,S.jsx)(ee,{siteId:t})]}),(0,S.jsx)(`nav`,{className:`app-header-nav`,children:n.map(e=>(0,S.jsx)(x.Fragment,{children:o===void 0?(0,S.jsx)(g,{item:e,active:e.id===r}):o(e,e.id===r)},e.id))}),(0,S.jsx)(`span`,{className:`spacer`}),a===void 0?null:(0,S.jsx)(`div`,{className:`app-header-actions`,children:a})]})})}var x,S,C;function w(){return(w=e((()=>{x=t(),o(),s(),c(),_(),S=n(),C={page:`app-header__inner`,full:`app-header__inner app-header__inner--full`},b.__docgenInfo={description:`The bar every site of the family carries: the brand linking home at the left,
the pages next to it, and the utilities pushed to the right edge by the
spacer.
@param props - The site, its pages, its utilities, and whether the page is
framed in another site.
@returns The bar, or nothing at all on an embedded page.`,methods:[],displayName:`SiteHeader`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'metabo'
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
| 'periodic-table'
| 'database'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`}]},description:`The site the bar belongs to, which draws its mark and writes its name.`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them.`},activeId:{required:!1,tsType:{name:`string`},description:"Which of the pages is on show, named by its `id`.\n@default undefined"},actions:{required:!1,tsType:{name:`ReactNode`},description:"The utilities pushed to the right edge — Cite, Tools, Share, sign in. They\narrive dressed as bar items, so a plain `nav-link` and a `CiteButton` read\nalike beside each other.\n@default undefined"},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way, for a bar whose entries need a tooltip
or a wrapper of their own.
@default undefined`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site, in which case no bar is drawn
at all — what a host page frames already carries its own navigation.
@default false`},homeHref:{required:!1,tsType:{name:`string`},description:`Where the brand leads.
@default '/'`},onHome:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the brand is picked, for a page that routes in
place. A modified click is left to the browser.
@default undefined`},markSize:{required:!1,tsType:{name:`number`},description:`Edge of the site's mark, in pixels.
@default 28`},width:{required:!1,tsType:{name:`union`,raw:`'page' | 'full'`,elements:[{name:`literal`,value:`'page'`},{name:`literal`,value:`'full'`}]},description:`How wide the bar's contents run.

\`page\` caps them at \`--page-max\` and centres them, so the brand sits over
the first word of a page that is capped the same way — which is what a
site of reading matter wants. \`full\` runs them to both edges, for a tool
that fills the window: there the cap leaves the brand floating inwards
with the tool running past it on both sides, and reads as a fault.
@default 'page'`}}}})))()}function de(e,t={}){let{maxWidth:n=k}=t,r=(0,O.useCallback)(t=>E(e?.current??null,t),[e]),i=(0,O.useCallback)(()=>T(e?.current??null,n),[e,n]);return(0,O.useSyncExternalStore)(r,i,D)}function T(e,t=k){let n=e===null?0:e.clientWidth,r=n>0?n:globalThis.innerWidth;return!Number.isFinite(r)||r<=0?!1:r<=t}function E(e,t){if(e!==null&&typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return globalThis.addEventListener(`resize`,t),()=>globalThis.removeEventListener(`resize`,t)}function D(){return!1}var O,k;function A(){return(A=e((()=>{O=t(),k=1e3})))()}function fe(e){let t=(0,N.useRef)(null),n=de(t,{maxWidth:640}),{nav:r,activeId:i,siteId:a}=e;return(0,P.jsx)(M,{siteId:a,children:(0,P.jsxs)(`div`,{style:{padding:`1.25rem`},children:[(0,P.jsx)(`div`,{ref:t,style:X,children:(0,P.jsx)(b,{...e,nav:n?[Z]:r,actions:(0,P.jsx)(j,{siteId:a,compact:n}),renderNavItem:n?()=>(0,P.jsx)(y,{label:`Pages`,icon:`menu`,items:r,activeId:i}):void 0})}),(0,P.jsxs)(`p`,{style:{...L,padding:`0.75rem 0 0`},children:[`useCompactHeader: `,(0,P.jsx)(`code`,{children:String(n)}),` — drag the right edge of the bar past 640 px.`]})]})})}function j(e){let{siteId:t,compact:n=!1}=e;return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(f,{reference:u,compact:n}),(0,P.jsx)(p,{currentSiteId:t,compact:n}),(0,P.jsx)(ce,{onClick:ae,compact:n})]})}function M(e){let t=i(e.siteId),n={"--brand":t.brand,"--brand-alt":t.brandAlt,"--accent":t.brand};return(0,P.jsx)(`div`,{style:n,children:e.children})}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{N=t(),_(),oe(),le(),w(),A(),d(),o(),r(),ne(),se(),ie(),l(),P=n(),F=a.map(e=>e.id),I=`
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`,L={padding:`0.75rem 1.25rem 0`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},R={title:`Chrome/SiteHeader`,component:b,args:{siteId:`smiles`,nav:h,activeId:`draw`,markSize:28,homeHref:`/`,embedded:!1},argTypes:{siteId:{control:`select`,options:F},activeId:{control:`select`,options:h.map(e=>e.id)},markSize:{control:{type:`range`,min:16,max:48,step:2}},homeHref:{control:`text`},embedded:{control:`boolean`},nav:{control:!1},actions:{control:!1},renderNavItem:{control:!1},onHome:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.`}}},render:e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})})})},z={},B={render:()=>(0,P.jsx)(`div`,{style:G,children:re.map(e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsx)(b,{siteId:e.siteId,nav:e.nav,activeId:e.activeId,actions:(0,P.jsx)(j,{siteId:e.siteId})})},e.siteId))})},V={render:e=>(0,P.jsxs)(M,{siteId:e.siteId,children:[(0,P.jsx)(`style`,{children:I}),(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId}),renderNavItem:(e,t)=>(0,P.jsx)(g,{item:e,active:t,className:e.id===`tutorial`?`sb-hovered`:void 0})}),(0,P.jsx)(`p`,{style:L,children:`Draw is the page on show; Tutorial is drawn as the pointer leaves it.`})]})},H={render:e=>(0,P.jsx)(fe,{...e})},U={render:e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsxs)(`div`,{style:K,children:[(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})}),(0,P.jsx)(`main`,{style:q,children:(0,P.jsxs)(`div`,{style:J,children:[(0,P.jsx)(`h1`,{style:{margin:0,fontSize:`1.25rem`},children:v.name}),(0,P.jsxs)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:[`Monoisotopic mass `,v.monoisotopicMass]}),(0,P.jsx)(`code`,{style:Y,children:v.smiles}),(0,P.jsx)(`code`,{style:Y,children:v.inchiKey})]})}),(0,P.jsx)(ue,{siteId:e.siteId,layout:`row`})]})})},W={render:e=>(0,P.jsxs)(M,{siteId:e.siteId,children:[(0,P.jsx)(b,{...e,actions:(0,P.jsx)(j,{siteId:e.siteId})}),(0,P.jsxs)(`p`,{style:L,children:[`Above, the bar. Below, the same bar with `,(0,P.jsx)(`code`,{children:`embedded`}),`, which draws nothing.`]}),(0,P.jsx)(b,{...e,embedded:!0})]})},G={display:`flex`,minHeight:`100vh`,flexDirection:`column`,padding:`1.5rem`,background:`var(--surface-sunken)`,gap:`1.5rem`},K={display:`flex`,minHeight:`100vh`,flexDirection:`column`,background:`var(--surface-sunken)`},q={width:`100%`,maxWidth:`var(--page-max)`,flex:`1 1 auto`,padding:`1.5rem 1.25rem`,margin:`0 auto`},J={display:`flex`,maxWidth:`32rem`,flexDirection:`column`,padding:`1rem 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.5rem`},Y={overflowWrap:`anywhere`,fontSize:`0.8125rem`},X={overflow:`auto`,width:520,minWidth:320,maxWidth:`100%`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,resize:`horizontal`},Z={id:`pages`,label:`Pages`},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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