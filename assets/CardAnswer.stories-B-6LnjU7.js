import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-C326WbYZ.js";import{n as r,t as i}from"./useT-wLhIGO0u.js";import{n as a,t as o}from"./callout-Daq30fgR.js";import{r as s,t as c}from"./spinner-CUXhkrQ2.js";import{n as l}from"./joinClassNames-BbK_6p9Z.js";import{n as u,t as d}from"./CardDetailsButton-Vt3pSV48.js";import{n as f,t as p}from"./ClickToCopy-ClJ3BHoH.js";import{i as m,n as h,r as g,t as _}from"./CardFrame-D-Jcicyx.js";import{a as v,i as y,n as b,o as x,r as S,t as C}from"./cardFixtures-BPBMMG3e.js";function w(e){let{summary:t,children:n,defaultOpen:r=!1,onToggle:i,stack:a=!1}=e;return(0,T.jsxs)(`details`,{className:`card-fold`,open:r||void 0,onToggle:i===void 0?void 0:e=>i(e.currentTarget.open),children:[(0,T.jsx)(`summary`,{children:t}),(0,T.jsx)(`div`,{className:l(`card-fold__body`,a&&`card-fold__body--stack`),children:n})]})}var T;function E(){return(E=e((()=>{T=n(),w.__docgenInfo={description:`A section of a card closed until the reader opens it, behind one muted line
saying what it holds. Put in a \`CardFoot\`, its line sits beside the
card's actions, and what it opens on starts below them, the card's whole
width.
@param props - See {@link CardFoldProps}.
@returns The fold, \`details.card-fold\`.`,methods:[],displayName:`CardFold`,props:{summary:{required:!0,tsType:{name:`ReactNode`},description:"The line the closed fold shows, e.g. `All 26 known isotopes`."},children:{required:!0,tsType:{name:`ReactNode`},description:`What it opens on.`},defaultOpen:{required:!1,tsType:{name:`boolean`},description:`Open the fold when the card is drawn.
@default false - closed until the reader opens it`},onToggle:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(open: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`open`}],return:{name:`void`}}},description:`Told when the reader opens or closes the fold.
@default undefined`},stack:{required:!1,tsType:{name:`boolean`},description:`Lay what it opens on out as a column, its parts 6px apart, for parts that
carry no margin of their own.
@default false - the parts are blocks, spaced by their own margins`}}}})))()}function D(e){let{lead:t,children:n,more:r,table:i,leadClassName:a,className:o,stack:s=!1,testId:c=`answer-card`,...u}=e,[d,f]=(0,O.useState)(!1),p=i??(d?r?.table:void 0);return(0,k.jsxs)(_,{className:o,stack:s,testId:c,children:[(0,k.jsx)(`div`,{className:l(`card__header`,a),children:t}),n,(0,k.jsx)(g,{...u,table:p,folds:r===void 0?void 0:(0,k.jsx)(w,{summary:r.summary,stack:r.stack,onToggle:f,children:r.content})})]})}var O,k;function A(){return(A=e((()=>{O=t(),E(),m(),h(),k=n(),D.__docgenInfo={description:`A whole card: the answer first, on the line that leaves the chat's corner
free, what comes under it, then the last row — the details folded away, the
copy of the card's table and the way to the site's page. The table copied is
the card's own when it has one, else the one the open fold shows.
@param props - See {@link CardAnswerProps}.
@returns The card, fitted to the frame a chat shows it in.`,methods:[],displayName:`CardAnswer`,props:{lead:{required:!0,tsType:{name:`ReactNode`},description:`The answer itself, read first, on the card's first line.`},children:{required:!1,tsType:{name:`ReactNode`},description:`What comes under it, e.g. a figure.
@default undefined`},more:{required:!1,tsType:{name:`CardMore`},description:`The secondary information, closed until the reader opens it.
@default undefined - nothing is folded away`},leadClassName:{required:!1,tsType:{name:`string`},description:"Class beside `card__header` on the lead, so a site can lay it out.\n@default undefined"},className:{required:!1,tsType:{name:`string`},description:"Class beside `card`, so a site can reach the card from its stylesheet.\n@default undefined"},stack:{required:!1,tsType:{name:`boolean`},description:`Lay the card out as a column, its parts 8px apart.
@default false - the parts are blocks, spaced by their own margins`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the card.\n@default 'answer-card'"}},composes:[`Omit`]}})))()}function j(e){let{facts:t}=e;return t.length===0?null:(0,M.jsx)(`div`,{className:`card-facts`,children:t.map(e=>(0,M.jsxs)(`span`,{className:`card-fact`,children:[(0,M.jsx)(`span`,{className:`card-fact__label`,children:e.label}),e.copy===!1?(0,M.jsx)(`span`,{className:`card-fact__value`,children:e.value}):(0,M.jsx)(p,{value:e.value,label:e.label.toLowerCase(),className:`card-fact__value`,children:e.value}),e.detail===void 0?null:(0,M.jsx)(`span`,{className:`card-fact__detail`,children:e.detail})]},e.label))})}var M;function N(){return(N=e((()=>{f(),M=n(),j.__docgenInfo={description:`The key numbers a card leads with, in one line that wraps on a narrow frame.
A value a student quotes is copied by a click on it, its hover text naming
it after its label; a count is not.
@param props - See {@link CardFactsProps}.
@returns The line, \`card-facts\`, or nothing when there is no value to give.`,methods:[],displayName:`CardFacts`,props:{facts:{required:!0,tsType:{name:`unknown`},description:`The values, in the order they are read.`}}}})))()}function P(e){return(0,F.jsxs)(`div`,{className:`card__wait`,children:[(0,F.jsx)(c,{size:16,"aria-hidden":!0}),e.children]})}var F;function I(){return(I=e((()=>{s(),F=n(),P.__docgenInfo={description:`A card's line while its answer is computed: a small spinner, and a few
muted words saying what is being done.
@param props - See {@link CardWaitingProps}.
@returns The line, \`card__wait\`.`,methods:[],displayName:`CardWaiting`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:"What is being done, e.g. `Converting…`."}}}})))()}function L(e){let{failure:t,waiting:n,address:i,details:a=!0}=e,s=r(),l=t===void 0?n===void 0?(0,R.jsx)(c,{size:20,"aria-label":s(`card.loading`)}):(0,R.jsx)(P,{children:n}):(0,R.jsx)(o,{intent:`warning`,icon:`search`,compact:!0,children:typeof t==`string`?t:t.message});return a?(0,R.jsxs)(`div`,{className:`card__end card__header`,children:[(0,R.jsx)(`div`,{className:`card__status`,children:l}),(0,R.jsx)(d,{address:i})]}):l}var R;function z(){return(z=e((()=>{a(),s(),i(),u(),I(),R=n(),L.__docgenInfo={description:`A card whose answer is on its way, or could not be had: a spinner, with
what is being done when it says so, then what went wrong, and the way to
the site's page either way, since the page may answer where the card could
not. Its row is the card's first line, so it leaves the chat's corner empty.
@param props - See {@link CardStatusProps}.
@returns The card's content until its answer comes.`,methods:[],displayName:`CardStatus`,props:{failure:{required:!1,tsType:{name:`union`,raw:`Error | string`,elements:[{name:`Error`},{name:`string`}]},description:`Why the answer could not be had: an error, or the reason in words.
@default undefined - the answer is on its way`},waiting:{required:!1,tsType:{name:`ReactNode`},description:`What is being done while the answer is on its way, e.g. \`Converting…\`,
written beside the spinner.
@default undefined - the spinner alone, named for a screen reader`},address:{required:!1,tsType:{name:`SitePageOptions`},description:"How the site's page is read off the card's address.\n@default {} - `card`, `embed` and `hide` are left out, and nothing else"},details:{required:!1,tsType:{name:`boolean`},description:`Whether the way to the site's page is offered beside the status. A card
nested in another one, which offers its own, leaves it out.
@default true`}}}})))()}function B(){return(0,V.jsxs)(`table`,{className:`bp6-html-table bp6-compact`,children:[(0,V.jsx)(`thead`,{children:(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`th`,{children:`Volume (mL)`}),(0,V.jsx)(`th`,{children:`pH`})]})}),(0,V.jsx)(`tbody`,{children:y.map(([e,t])=>(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`td`,{children:e}),(0,V.jsx)(`td`,{children:t})]},e))})]})}var V,H,U,W,G,K,q;function J(){return(J=e((()=>{A(),N(),E(),m(),h(),z(),S(),v(),V=n(),H={title:`Card/CardAnswer`,component:D,args:{lead:null},parameters:{layout:`fullscreen`,docs:{description:{component:"A whole card: the answer on the line that leaves the chat’s corner free, what comes under it, and the last row (`CardFoot`) — the details folded away (`CardFold`), the copy of the card’s table and the way to the site’s page, floated so what a fold opens takes the card’s whole width."}}}},U={render:()=>(0,V.jsx)(C,{children:(0,V.jsx)(D,{lead:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`div`,{className:`card__value`,children:`pH 8.72`}),(0,V.jsx)(`p`,{className:`card__line card__muted`,children:`at equivalence, 10 mL of acetic acid 0.1 M titrated with NaOH`})]}),table:{table:x,tooltip:`Copy the curve as a table, to paste into a spreadsheet`},more:{summary:`The ${y.length} points of the curve`,content:(0,V.jsx)(B,{})},children:(0,V.jsx)(b,{})})})},W={render:()=>(0,V.jsx)(C,{width:420,children:(0,V.jsxs)(_,{stack:!0,children:[(0,V.jsx)(`p`,{className:`card__header card__title`,children:`Iron · element 26`}),(0,V.jsx)(j,{facts:[{label:`Atomic weight`,value:`55.845`,detail:`Da`},{label:`Unpaired electrons`,value:`4`,copy:!1},{label:`Electronegativity`,value:`1.83`}]}),(0,V.jsx)(g,{table:{table:()=>`Isotope	Abundance
56Fe	91.75 %`},folds:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(w,{summary:`All 4 stable isotopes`,stack:!0,children:[(0,V.jsx)(`p`,{className:`card__note`,children:`⁵⁴Fe 5.85 % · ⁵⁶Fe 91.75 %`}),(0,V.jsx)(`p`,{className:`card__note`,children:`⁵⁷Fe 2.12 % · ⁵⁸Fe 0.28 %`})]}),(0,V.jsx)(w,{summary:`About these values`,children:(0,V.jsx)(`p`,{className:`card__note`,children:`From the IUPAC 2021 tables.`})})]})})]})})},G={render:()=>(0,V.jsx)(C,{width:420,children:(0,V.jsxs)(_,{stack:!0,children:[(0,V.jsx)(`p`,{className:`card__header card__title`,children:`C6H14 · 5 isomers`}),(0,V.jsx)(g,{note:`The first 5 of 5 drawn`,table:{table:()=>`SMILES
CCCCCC`}})]})})},K={render:()=>(0,V.jsx)(C,{width:420,children:(0,V.jsx)(_,{children:(0,V.jsx)(L,{waiting:`Converting…`})})})},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame>
      <CardAnswer lead={<>
            <div className="card__value">pH 8.72</div>
            <p className="card__line card__muted">
              at equivalence, 10 mL of acetic acid 0.1 M titrated with NaOH
            </p>
          </>} table={{
      table: titrationTable,
      tooltip: 'Copy the curve as a table, to paste into a spreadsheet'
    }} more={{
      summary: \`The \${TITRATION_ROWS.length} points of the curve\`,
      content: <TitrationPoints />
    }}>
        <TitrationCurve />
      </CardAnswer>
    </ChatFrame>
}`,...U.parameters?.docs?.source},description:{story:`A titration answered: the number asked for, the curve, and the points folded.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame width={420}>
      <CardFrame stack>
        <p className="card__header card__title">Iron · element 26</p>
        <CardFacts facts={[{
        label: 'Atomic weight',
        value: '55.845',
        detail: 'Da'
      }, {
        label: 'Unpaired electrons',
        value: '4',
        copy: false
      }, {
        label: 'Electronegativity',
        value: '1.83'
      }]} />
        <CardFoot table={{
        table: () => 'Isotope\\tAbundance\\n56Fe\\t91.75 %'
      }} folds={<>
              <CardFold summary="All 4 stable isotopes" stack>
                <p className="card__note">⁵⁴Fe 5.85 % · ⁵⁶Fe 91.75 %</p>
                <p className="card__note">⁵⁷Fe 2.12 % · ⁵⁸Fe 0.28 %</p>
              </CardFold>
              <CardFold summary="About these values">
                <p className="card__note">From the IUPAC 2021 tables.</p>
              </CardFold>
            </>} />
      </CardFrame>
    </ChatFrame>
}`,...W.parameters?.docs?.source},description:{story:`A column of a card: its key numbers, then two folds beside the actions.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame width={420}>
      <CardFrame stack>
        <p className="card__header card__title">C6H14 · 5 isomers</p>
        <CardFoot note="The first 5 of 5 drawn" table={{
        table: () => 'SMILES\\nCCCCCC'
      }} />
      </CardFrame>
    </ChatFrame>
}`,...G.parameters?.docs?.source},description:{story:`A remark at the start of the last row, and no fold.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame width={420}>
      <CardFrame>
        <CardStatus waiting="Converting…" />
      </CardFrame>
    </ChatFrame>
}`,...K.parameters?.docs?.source},description:{story:`While the answer is computed: what is done, beside the spinner.`,...K.parameters?.docs?.description}}},q=[`Default`,`WithFacts`,`WithNote`,`Waiting`]})))()}J();export{U as Default,K as Waiting,W as WithFacts,G as WithNote,q as __namedExportsOrder,H as default};