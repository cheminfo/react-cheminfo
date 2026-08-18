import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DOiypc2O.js";import{n,t as r}from"./DelimitedTextPanel-aKE07uo_.js";import{n as i,r as a,t as o}from"./moleculeTable-CmKVt629.js";var s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),a(),s=t(),c={title:`Delimited/DelimitedTextPanel`,component:r,args:{rows:i,header:o,fileName:`molecules`},argTypes:{defaultDelimiter:{control:`inline-radio`,options:[`tab`,`comma`,`semicolon`]},downloadable:{control:`boolean`},fileName:{control:`text`},label:{control:`text`},height:{control:{type:`range`,min:120,max:480,step:20}}},parameters:{layout:`padded`,docs:{description:{component:`A whole table as text: read it, switch the separator, then copy it or save it. Every cell is escaped for the separator in force, so what a spreadsheet opens holds the columns the page shows.`}}},render:e=>(0,s.jsx)(`div`,{style:{width:`min(46rem, 92vw)`},children:(0,s.jsx)(r,{...e})})},l={},u={args:{defaultDelimiter:`comma`}},d={args:{defaultDelimiter:`semicolon`}},f={args:{description:`Five compounds, with the monoisotopic mass of the neutral molecule.`}},p={args:{downloadable:!1,height:200}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source},description:{story:`Tab separated: only the two notes holding a quote have to be escaped.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    defaultDelimiter: 'comma'
  }
}`,...u.parameters?.docs?.source},description:{story:"The comma quotes the cells that carry one — the name `2,4-D` and the note\nspelling it out — which is the file a naive `join(',')` corrupts.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    defaultDelimiter: 'semicolon'
  }
}`,...d.parameters?.docs?.source},description:{story:`The separator a spreadsheet set to a European locale expects.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Five compounds, with the monoisotopic mass of the neutral molecule.'
  }
}`,...f.parameters?.docs?.source},description:{story:`A sentence saying what the table holds, in place of the row count.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    downloadable: false,
    height: 200
  }
}`,...p.parameters?.docs?.source},description:{story:`Framed in a course page, where a download cannot start: copy is the way out.`,...p.parameters?.docs?.description}}},m=[`Default`,`CommaSeparated`,`SemicolonSeparated`,`OwnDescription`,`WithoutSave`]})))()}h();export{u as CommaSeparated,l as Default,f as OwnDescription,d as SemicolonSeparated,p as WithoutSave,m as __namedExportsOrder,c as default};