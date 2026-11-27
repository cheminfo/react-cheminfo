import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-BWTG3juY.js";import{n as r,r as i}from"./familyTokens-CGGRwh4r.js";import{l as a,o}from"./structureFixtures-CJ3OPkrl.js";import{n as s,t as c}from"./StructureSearchPanel-lOXr3gL9.js";function l(e){let[t,n]=(0,u.useState)(null);return(0,d.jsxs)(`div`,{style:h,children:[(0,d.jsx)(c,{...e,onSearch:n}),(0,d.jsx)(`output`,{"data-testid":`structure-search-result`,style:g,children:t===null?`nothing searched`:`${t.mode} ≥ ${t.threshold} ${t.idCode.split(` `,1)[0]}`})]})}var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{u=t(),s(),i(),a(),d=n(),f={title:`Structure/StructureSearchPanel`,component:c,args:{value:{idCode:``,mode:`substructure`,threshold:.8},onSearch:()=>{}},parameters:{layout:`padded`,docs:{description:{component:`The body of the structure search dialog, for a page that holds it inline: the canvas with fragments to start from under it, and one large button per mode beside it, which searches. Under 38rem of room the modes go under the canvas.`}}},render:e=>(0,d.jsx)(l,{...e})},p={args:{requireDrawing:!0}},m={args:{value:{idCode:o,mode:`similarity`,threshold:.8},thresholds:[.7,.8,.9,1],requireDrawing:!0}},h={display:`grid`,gap:12,maxWidth:`60rem`},g={color:r.textMuted,fontFamily:`monospace`},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    requireDrawing: true
  }
}`,...p.parameters?.docs?.source},description:{story:`An empty canvas, which a search page refuses to search.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: {
      idCode: BENZENE_QUERY,
      mode: 'similarity',
      threshold: 0.8
    },
    thresholds: [0.7, 0.8, 0.9, 1],
    requireDrawing: true
  }
}`,...m.parameters?.docs?.source},description:{story:`A similarity search reopened on its benzene, with a site's own steps of
similarity.`,...m.parameters?.docs?.description}}},_=[`Default`,`SiteThresholds`]})))()}v();export{p as Default,m as SiteThresholds,_ as __namedExportsOrder,f as default};