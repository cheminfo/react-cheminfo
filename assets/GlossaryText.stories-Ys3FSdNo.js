import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CGFjf9cs.js";import{d as n,f as r,m as i,v as a}from"./pedagogyFixtures-SRQjvSWn.js";import{i as o,n as s,r as c,t as l}from"./GlossaryText-D-NZe1Fn.js";var u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{o(),s(),a(),u=t(),d=[`bottom`,`top`,`right`,`left`],f=e=>(0,u.jsx)(c,{glossary:n,children:(0,u.jsx)(`p`,{style:{maxWidth:`42rem`,margin:0,lineHeight:1.55},children:(0,u.jsx)(e,{})})}),p={title:`Pedagogy/GlossaryText`,component:l,decorators:[f],args:{text:r},argTypes:{text:{control:`text`},placement:{control:`select`,options:d},className:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:"Authored prose whose `[[term]]` markers become hoverable definitions — the cheapest contextual help there is, and the one most tools forget."}}}},m={},h={args:{text:i}},g={args:{text:`A [[smarts|SMARTS]] pattern is a query, not a molecule: [[branch]] means the same thing in both, but this page defines only the query words.`,glossary:{smarts:{title:`SMARTS`,summary:`The query dialect of SMILES: the same syntax, plus the atom and bond properties a substructure search asks about.`,examples:[{code:`[CX3](=O)[OX2H1]`,note:`a carboxylic acid, and no ester`},{code:`[#6]`,note:`any carbon, aromatic or not`}]}}}},_={args:{glossary:{}}},v={args:{placement:`right`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`Four terms are linked and hoverable; \`canonicalisation\` is deliberately not
in the glossary and renders as its plain word, never as the brackets — prose
may link a term months before anybody writes its definition.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    text: SMILES_SENTENCE
  }
}`,...h.parameters?.docs?.source},description:{story:"`[[term|displayed text]]` keeps the sentence readable while the lookup stays the glossary key.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'A [[smarts|SMARTS]] pattern is a query, not a molecule: [[branch]] means the same thing in both, but this page defines only the query words.',
    glossary: {
      smarts: {
        title: 'SMARTS',
        summary: 'The query dialect of SMILES: the same syntax, plus the atom and bond properties a substructure search asks about.',
        examples: [{
          code: '[CX3](=O)[OX2H1]',
          note: 'a carboxylic acid, and no ester'
        }, {
          code: '[#6]',
          note: 'any carbon, aromatic or not'
        }]
      }
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`A page showing a second vocabulary passes its own terms instead of the provider's.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    glossary: {}
  }
}`,..._.parameters?.docs?.source},description:{story:`Nothing defined at all: every marker falls back to plain prose.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'right'
  }
}`,...v.parameters?.docs?.source},description:{story:`A definition that would fall off the bottom of a card opens to the right.`,...v.parameters?.docs?.description}}},y=[`Default`,`RenamedInTheSentence`,`OwnGlossary`,`NoGlossary`,`OpensToTheRight`]})))()}b();export{m as Default,_ as NoGlossary,v as OpensToTheRight,g as OwnGlossary,h as RenamedInTheSentence,y as __namedExportsOrder,p as default};