import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-BDQJEmVY.js";import{t as r}from"./react-dom-BGp2GrMB.js";import{i,n as a,r as o,t as s}from"./lookup-BebdeTGz.js";function c(e){let t=a(e),n=l(t),r=[`--brand: ${t.brand};`,`--brand-alt: ${n};`];return t.brandAlt!==n&&r.push(`--brand-alt-text: ${t.brandAlt};`),r.push(`--accent: var(--brand);`),`:root {\n  ${r.join(`
  `)}\n}\n`}function l(e){return e.mark.accent===e.brand?e.mark.plate:e.mark.accent}function u(){return(u=e((()=>{s()})))()}function d(e){return(0,f.jsx)(`style`,{children:c(e.siteId)})}var f;function p(){return(p=e((()=>{u(),f=n(),d.__docgenInfo={description:`The two colours a site owns, put on the page as custom properties.

Everything of the family that reads \`--brand\`, \`--brand-alt\` or \`--accent\` —
a mark drawn in token colours, a current menu item, a focus ring — follows
from here, so a site declares its palette once and never repeats a hex code
in a component.
@param props - The site whose palette is injected.
@returns The rule, as a style element that applies wherever it is rendered.`,methods:[],displayName:`SiteTheme`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site whose palette the page takes.`}}}})))()}function m(e){let{siteId:t,height:n,children:r}=e,[i,a]=(0,_.useState)(null),o=(0,_.useCallback)(e=>{a(e.currentTarget.contentDocument?.body??null)},[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`iframe`,{title:`${t}, on a page of its own`,srcDoc:b,onLoad:o,style:{...k,height:n}}),i===null?null:(0,v.createPortal)((0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(d,{siteId:t}),r]}),i)]})}function h(){return(0,y.jsxs)(`div`,{style:A,children:[(0,y.jsxs)(`div`,{style:j,children:[(0,y.jsx)(`span`,{style:M,children:`Caffeine`}),(0,y.jsx)(`span`,{style:N,children:`alkaloid`})]}),(0,y.jsx)(`div`,{style:P,children:`C₈H₁₀N₄O₂ · 194.0804 Da`}),(0,y.jsxs)(`div`,{style:F,children:[(0,y.jsx)(`button`,{type:`button`,style:I,children:`Isotopic distribution`}),(0,y.jsx)(`span`,{style:L,children:`Open in ChemCalc`})]})]})}function g(){return(0,y.jsx)(`div`,{style:A,children:T.map(e=>(0,y.jsxs)(`div`,{style:R,children:[(0,y.jsx)(`span`,{style:{...z,background:e.paint}}),(0,y.jsx)(`code`,{style:B,children:e.name})]},e.name))})}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{_=t(),v=r(),i(),p(),y=n(),b=`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
body { margin: 0; padding: 16px; background: #f5f7fa; color: #16202c;
  font: 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
button { font: inherit; }
</style></head><body></body></html>`,x={title:`Ecosystem/SiteTheme`,component:d,args:{siteId:`surge`},argTypes:{siteId:{control:`select`,options:o.map(e=>e.id)}},parameters:{layout:`padded`,docs:{description:{component:"The two colours a site owns, put on the page as the custom properties every component of the family reads. Each pane below is a page of its own, because the rule it writes is a `:root` one."}}},render:e=>(0,y.jsx)(`div`,{style:{width:`min(26rem, 92vw)`},children:(0,y.jsx)(m,{siteId:e.siteId,height:D,children:(0,y.jsx)(h,{})})})},S={},C={render:()=>(0,y.jsx)(`div`,{style:E,children:[`surge`,`pt`].map(e=>(0,y.jsx)(m,{siteId:e,height:D,children:(0,y.jsx)(h,{})},e))})},w={render:e=>(0,y.jsx)(`div`,{style:{width:`min(26rem, 92vw)`},children:(0,y.jsx)(m,{siteId:e.siteId,height:O,children:(0,y.jsx)(g,{})})})},T=[{name:`--brand`,paint:`var(--brand)`},{name:`--brand-alt`,paint:`var(--brand-alt)`},{name:`--brand-alt-text`,paint:`var(--brand-alt-text, var(--brand-alt))`},{name:`--accent`,paint:`var(--accent)`}],E={display:`grid`,gap:16,gridTemplateColumns:`repeat(auto-fit, minmax(18rem, 1fr))`},D=155,O=195,k={display:`block`,width:`100%`,border:`1px solid var(--border, #dfe3e8)`,borderRadius:`var(--radius, 10px)`,background:`#f5f7fa`},A={padding:14,border:`1px solid #dfe3e8`,borderRadius:10,background:`#fff`,boxShadow:`0 1px 2px rgb(16 32 48 / 8%)`},j={display:`flex`,alignItems:`baseline`,gap:8},M={color:`var(--brand)`,fontSize:`1.0625rem`,fontWeight:700,letterSpacing:`-0.01em`},N={padding:`1px 7px`,borderRadius:999,background:`color-mix(in oklab, var(--brand-alt) 16%, white)`,color:`var(--brand-alt-text, var(--brand-alt))`,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.03em`,textTransform:`uppercase`},P={color:`#5b6875`,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.8125rem`},F={display:`flex`,alignItems:`center`,marginTop:14,gap:12},I={padding:`6px 12px`,border:0,borderRadius:8,background:`var(--accent)`,color:`#fff`,fontSize:`0.8125rem`,fontWeight:600,cursor:`pointer`},L={color:`var(--accent)`,fontSize:`0.8125rem`,fontWeight:600,textDecoration:`underline`},R={display:`flex`,alignItems:`center`,padding:`4px 0`,gap:10},z={display:`inline-block`,width:40,height:20,borderRadius:6,boxShadow:`inset 0 0 0 1px rgb(16 32 48 / 12%)`},B={fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.8125rem`},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div style={PANES_STYLE}>
      {(['surge', 'pt'] as const).map(siteId => <ThemedPage key={siteId} siteId={siteId} height={CARD_FRAME_HEIGHT}>
          <ResultCard />
        </ThemedPage>)}
    </div>
}`,...C.parameters?.docs?.source},description:{story:`The same card under two sites: not one colour is written on it, so what
separates the two panes is the pair of tokens and nothing else.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 'min(26rem, 92vw)'
  }}>
      <ThemedPage siteId={args.siteId} height={SWATCH_FRAME_HEIGHT}>
        <TokenSwatches />
      </ThemedPage>
    </div>
}`,...w.parameters?.docs?.source},description:{story:`The declarations themselves. \`--brand-alt-text\` only appears for a site
whose answering colour is a yellow or an amber that would be unreadable as
text, so on the others the swatch falls back to the answering colour it
would have darkened.`,...w.parameters?.docs?.description}}},V=[`Default`,`SideBySide`,`Tokens`]})))()}H();export{S as Default,C as SideBySide,w as Tokens,V as __namedExportsOrder,x as default};