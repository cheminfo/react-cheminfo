import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-tcjnLE2W.js";import{At as r,Ln as i,Lr as a,Ot as o,Pn as s,Ur as c,Zn as l,qn as ee}from"./classnames-DF7DmqOS.js";import{n as te}from"./joinClassNames-BbK_6p9Z.js";import{n as u,t as d}from"./Structure-Ch1nLKua.js";import{a as f,i as p,n as m,r as h,t as g}from"./CardDetailsButton-nOPdYBD2.js";import{a as _,i as v,n as y,r as b,t as x}from"./cardFixtures-DamDHd5s.js";import{n as S,t as C}from"./CardFigure-BdFicmZM.js";import{n as w,t as T}from"./CopyTableButton-DbCUK4_l.js";import{n as ne,t as re}from"./StructureExportButton-PRS5OPVz.js";import{c as ie,o as E}from"./structureFixtures-JUAU2ivx.js";function ae(e,t){let n=0;for(let r of e){let e=r.height;r.kind===`popover`&&(e=t+r.height+D,r.bottom!==void 0&&r.bottom+O>e&&(e=r.bottom+O)),e>n&&(n=e)}return Math.ceil(n)}var D,O;function k(){return(k=e((()=>{D=24,O=8})))()}function A(e){let t=[],n=[],r=e.getBoundingClientRect().top;for(let e of document.querySelectorAll(I)){let{marginTop:r,marginBottom:i}=globalThis.getComputedStyle(e),a=(N(r)??0)+(N(i)??0);t.push({kind:`dialog`,height:M(e)+a}),n.push(e)}for(let e of document.querySelectorAll(F)){let i=(e.parentElement?.classList.contains(l)?e.parentElement:e).getBoundingClientRect().bottom-r;t.push({kind:`popover`,height:M(e),...i>0&&{bottom:i}}),n.push(e)}return{found:t,elements:n}}function j(e){let t=e.getBoundingClientRect().top,n=0;for(let r of e.querySelectorAll(R)){let e=r.getBoundingClientRect().bottom-t;e>n&&(n=e)}return n}function M(e){let t=e.offsetHeight;for(let n of e.querySelectorAll(L))t+=n.scrollHeight-n.clientHeight;return t}function N(e){let t=Number.parseFloat(e);return Number.isFinite(t)?t:void 0}var P,F,I,L,R;function z(){return(z=e((()=>{c(),P=`.${s}`,F=`${P} .${i}:not(.${a})`,I=`${P} .${o}`,L=`.${r}`,R=`.${ee}, [aria-expanded='true']`})))()}function B(e){let t=0,n=new Set,r=typeof ResizeObserver>`u`?void 0:new ResizeObserver(o),i=new MutationObserver(o);function a(){t=0;let i=A(e);r!==void 0&&V(r,n,i.elements);let a=document.fullscreenElement?0:ae(i.found,j(e)),o=a>0?`${a}px`:``;e.style.minHeight!==o&&(e.style.minHeight=o)}function o(){t===0&&(t=requestAnimationFrame(a))}return i.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:[`class`]}),document.addEventListener(`fullscreenchange`,o),o(),()=>{i.disconnect(),r?.disconnect(),document.removeEventListener(`fullscreenchange`,o),cancelAnimationFrame(t),e.style.minHeight=``}}function V(e,t,n){for(let r of t)n.includes(r)||(e.unobserve(r),t.delete(r));for(let r of n)t.has(r)||(e.observe(r),t.add(r))}function H(){return(H=e((()=>{k(),z()})))()}function U(e){if(e===null||!p())return;let t=B(e),n=f(e);return()=>{n(),t()}}function W(){return(W=e((()=>{h(),t(),H()})))()}function G(e){let{children:t,className:n,testId:r=`card`}=e;return(0,K.jsx)(`div`,{ref:U,className:te(`card`,n),"data-testid":r,children:t})}var K;function q(){return(q=e((()=>{W(),K=n(),G.__docgenInfo={description:`The page a chat frames inline for one answer: the card, with no header, no
footer and no form, as tall as what it shows. Framed, it reports its height
so the chat fits the frame to it, and grows while a panel it opened is open
so the frame holds that too; opened on its own, it is a page like any other.

\`react-cheminfo/styles/card.css\` draws it: no margin on the page around it,
the chat's corner left free by \`card__header\`, and the row of actions at its
end, \`card__end\`.
@param props - See {@link CardFrameProps}.
@returns The card's root element.`,methods:[],displayName:`CardFrame`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The card: the answer alone, compactly.`},className:{required:!1,tsType:{name:`string`},description:"Class beside `card`, so a site can reach the card from its stylesheet.\n@default undefined"},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default 'card'"}}}})))()}var J,Y,X,Z,Q;function $(){return($=e((()=>{m(),S(),q(),w(),u(),ne(),b(),ie(),v(),J=n(),Y={title:`Card/CardFrame`,component:G,args:{children:null},parameters:{layout:`fullscreen`,docs:{description:{component:"The page a chat frames inline for one answer — a site page under `?embed=1&card=1` — drawn by `react-cheminfo/styles/card.css`. Framed, it reports its height so the frame fits it, and grows while a panel it opened is open. Its first line leaves the chat’s corner free (`card__header`), and its last row (`card__end`) holds the copy of its table and the way to the site’s page."}}}},X={render:()=>(0,J.jsx)(x,{children:(0,J.jsxs)(G,{children:[(0,J.jsx)(`p`,{className:`card__header card__title`,children:`pH 8.72 at equivalence`}),(0,J.jsx)(`p`,{className:`card__muted`,children:`10 mL of acetic acid 0.1 M titrated with NaOH 0.1 M`}),(0,J.jsx)(C,{fileName:`acetic-acid-titration`,children:(0,J.jsx)(y,{})}),(0,J.jsxs)(`div`,{className:`card__end`,children:[(0,J.jsx)(`p`,{className:`card__note`,children:`Phenolphthalein marks the equivalence.`}),(0,J.jsx)(T,{table:_,tooltip:`Copy the curve as a table, to paste into a spreadsheet`}),(0,J.jsx)(g,{})]})]})})},Z={render:()=>(0,J.jsx)(x,{width:420,children:(0,J.jsxs)(G,{children:[(0,J.jsx)(`p`,{className:`card__header card__title`,children:`Caffeine`}),(0,J.jsx)(`p`,{className:`card__muted`,children:`C8H10N4O2 · 194.19 g/mol`}),(0,J.jsx)(C,{fileName:`caffeine`,tools:(0,J.jsx)(re,{smiles:E,name:`caffeine`}),children:(0,J.jsx)(d,{smiles:E,width:240,height:160})}),(0,J.jsx)(`div`,{className:`card__end`,children:(0,J.jsx)(g,{})})]})})},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame>
      <CardFrame>
        <p className="card__header card__title">pH 8.72 at equivalence</p>
        <p className="card__muted">
          10 mL of acetic acid 0.1 M titrated with NaOH 0.1 M
        </p>
        <CardFigure fileName="acetic-acid-titration">
          <TitrationCurve />
        </CardFigure>
        <div className="card__end">
          <p className="card__note">Phenolphthalein marks the equivalence.</p>
          <CopyTableButton table={titrationTable} tooltip="Copy the curve as a table, to paste into a spreadsheet" />
          <CardDetailsButton />
        </div>
      </CardFrame>
    </ChatFrame>
}`,...X.parameters?.docs?.source},description:{story:`A titration answered: the number asked for, the curve, and the way out.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame width={420}>
      <CardFrame>
        <p className="card__header card__title">Caffeine</p>
        <p className="card__muted">C8H10N4O2 · 194.19 g/mol</p>
        <CardFigure fileName="caffeine" tools={<StructureExportButton smiles={CAFFEINE} name="caffeine" />}>
          <Structure smiles={CAFFEINE} width={240} height={160} />
        </CardFigure>
        <div className="card__end">
          <CardDetailsButton />
        </div>
      </CardFrame>
    </ChatFrame>
}`,...Z.parameters?.docs?.source},description:{story:`A structure answered, its notations one glyph away beside its picture.`,...Z.parameters?.docs?.description}}},Q=[`Default`,`WithStructure`]})))()}$();export{X as Default,Z as WithStructure,Q as __namedExportsOrder,Y as default};