import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./CopyButton-BZcjuK-Y.js";import{n as r,r as i,t as a}from"./moleculeTable-CmKVt629.js";function o(){let e=[a.join(`	`)];for(let t of r)e.push(t.join(`	`));return e.join(`
`)}var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),i(),s=`CN1C=NC2=C1C(=O)N(C)C(=O)N2C`,c=`InChI=1S/C8H10N4O2/c1-10-4-9-6-5(10)7(13)12(3)8(14)11(2)6/h4H,1-3H3`,l={title:`Clipboard/CopyButton`,component:n,args:{content:s,label:`Copy SMILES`},argTypes:{content:{control:`text`},label:{control:`text`},copiedLabel:{control:`text`},title:{control:`text`},minimal:{control:`boolean`},small:{control:`boolean`},disabled:{control:`boolean`},resetAfter:{control:{type:`range`,min:300,max:5e3,step:100}}},parameters:{docs:{description:{component:`A button that puts a piece of text on the clipboard and confirms it with a tick for a moment.`}}}},u={},d={args:{minimal:!0,small:!0}},f={args:{label:void 0,title:`Copy the SMILES`,minimal:!0}},p={args:{content:c,label:`Copy the InChI`,copiedLabel:`On the clipboard`,icon:`clipboard`}},m={args:{content:o,label:`Copy 5 rows`},parameters:{controls:{exclude:[`content`]}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    minimal: true,
    small: true
  }
}`,...d.parameters?.docs?.source},description:{story:`Without its background, which is what a toolbar or a code block wants.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: undefined,
    title: 'Copy the SMILES',
    minimal: true
  }
}`,...f.parameters?.docs?.source},description:{story:`No label at all: a dense row of them, each saying what it copies on hover.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    content: CAFFEINE_INCHI,
    label: 'Copy the InChI',
    copiedLabel: 'On the clipboard',
    icon: 'clipboard'
  }
}`,...p.parameters?.docs?.source},description:{story:`The label and its confirmation are both the site's own words.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    content: hitList,
    label: 'Copy 5 rows'
  },
  parameters: {
    controls: {
      exclude: ['content']
    }
  }
}`,...m.parameters?.docs?.source},description:{story:`The lazy form: the table is only written out once the button is pressed.`,...m.parameters?.docs?.description}}},h=[`Default`,`Minimal`,`IconOnly`,`CustomLabel`,`LazyContent`]})))()}g();export{p as CustomLabel,u as Default,f as IconOnly,m as LazyContent,d as Minimal,h as __namedExportsOrder,l as default};