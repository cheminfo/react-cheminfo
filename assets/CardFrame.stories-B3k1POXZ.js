import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-aRVavQD_.js";import{n,t as r}from"./Structure-DSnXe3D6.js";import{i,n as a,r as o,t as s}from"./CardFrame-W7LooRCC.js";import{a as c,n as l,o as u,r as d,t as f}from"./cardFixtures-DjxQWIWq.js";import{n as p,t as m}from"./CardFigure-GWqud2q-.js";import{n as h,t as g}from"./StructureExportButton-D9l-E2B8.js";import{l as _,s as v}from"./structureFixtures-CJ3OPkrl.js";var y,b,x,S,C;function w(){return(w=e((()=>{p(),i(),a(),n(),h(),d(),_(),c(),y=t(),b={title:`Card/CardFrame`,component:s,args:{children:null},parameters:{layout:`fullscreen`,docs:{description:{component:"The page a chat frames inline for one answer — a site page under `?embed=1&card=1` — drawn by `react-cheminfo/styles/card.css`. Framed, it reports its height so the frame fits it, and grows while a panel it opened is open. Its first line leaves the chat’s corner free (`card__header`), and its last row (`CardFoot`) holds the copy of its table and the way to the site’s page."}}}},x={render:()=>(0,y.jsx)(f,{children:(0,y.jsxs)(s,{children:[(0,y.jsx)(`p`,{className:`card__header card__title`,children:`pH 8.72 at equivalence`}),(0,y.jsx)(`p`,{className:`card__muted`,children:`10 mL of acetic acid 0.1 M titrated with NaOH 0.1 M`}),(0,y.jsx)(m,{fileName:`acetic-acid-titration`,children:(0,y.jsx)(l,{})}),(0,y.jsx)(o,{note:`Phenolphthalein marks the equivalence.`,table:{table:u,tooltip:`Copy the curve as a table, to paste into a spreadsheet`}})]})})},S={render:()=>(0,y.jsx)(f,{width:420,children:(0,y.jsxs)(s,{children:[(0,y.jsx)(`p`,{className:`card__header card__title`,children:`Caffeine`}),(0,y.jsx)(`p`,{className:`card__muted`,children:`C8H10N4O2 · 194.19 g/mol`}),(0,y.jsx)(m,{fileName:`caffeine`,tools:(0,y.jsx)(g,{smiles:v,name:`caffeine`}),children:(0,y.jsx)(r,{smiles:v,width:240,height:160})}),(0,y.jsx)(o,{})]})})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame>
      <CardFrame>
        <p className="card__header card__title">pH 8.72 at equivalence</p>
        <p className="card__muted">
          10 mL of acetic acid 0.1 M titrated with NaOH 0.1 M
        </p>
        <CardFigure fileName="acetic-acid-titration">
          <TitrationCurve />
        </CardFigure>
        <CardFoot note="Phenolphthalein marks the equivalence." table={{
        table: titrationTable,
        tooltip: 'Copy the curve as a table, to paste into a spreadsheet'
      }} />
      </CardFrame>
    </ChatFrame>
}`,...x.parameters?.docs?.source},description:{story:`A titration answered: the number asked for, the curve, and the way out.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame width={420}>
      <CardFrame>
        <p className="card__header card__title">Caffeine</p>
        <p className="card__muted">C8H10N4O2 · 194.19 g/mol</p>
        <CardFigure fileName="caffeine" tools={<StructureExportButton smiles={CAFFEINE} name="caffeine" />}>
          <Structure smiles={CAFFEINE} width={240} height={160} />
        </CardFigure>
        <CardFoot />
      </CardFrame>
    </ChatFrame>
}`,...S.parameters?.docs?.source},description:{story:`A structure answered, its notations one glyph away beside its picture.`,...S.parameters?.docs?.description}}},C=[`Default`,`WithStructure`]})))()}w();export{x as Default,S as WithStructure,C as __namedExportsOrder,b as default};