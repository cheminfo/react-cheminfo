import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./CopyButton-B959YBr5.js";import{i as r,o as i}from"./structureFixtures-DYs_uddm.js";import{n as a,r as o,t as s}from"./moleculeTable-CmKVt629.js";function c(){let e=[s.join(`	`)];for(let t of a)e.push(t.join(`	`));return e.join(`
`)}var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),o(),i(),l=`InChI=1S/C8H10N4O2/c1-10-4-9-6-5(10)7(13)12(3)8(14)11(2)6/h4H,1-3H3`,u={title:`Clipboard/CopyButton`,component:n,args:{content:r,label:`Copy SMILES`},argTypes:{content:{control:`text`},label:{control:`text`},copiedLabel:{control:`text`},title:{control:`text`},minimal:{control:`boolean`},small:{control:`boolean`},disabled:{control:`boolean`},resetAfter:{control:{type:`range`,min:300,max:5e3,step:100}}},parameters:{docs:{description:{component:`A button that puts a piece of text on the clipboard and confirms it with a tick for a moment.`}}}},d={},f={args:{minimal:!0,small:!0}},p={args:{label:void 0,title:`Copy the SMILES`,minimal:!0}},m={args:{content:l,label:`Copy the InChI`,copiedLabel:`On the clipboard`,icon:`paperclip`}},h={args:{content:c,label:`Copy 5 rows`},parameters:{controls:{exclude:[`content`]}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    minimal: true,
    small: true
  }
}`,...f.parameters?.docs?.source},description:{story:`Without its background, which is what a toolbar or a code block wants.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: undefined,
    title: 'Copy the SMILES',
    minimal: true
  }
}`,...p.parameters?.docs?.source},description:{story:`No label at all: a dense row of them, each saying what it copies on hover.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    content: CAFFEINE_INCHI,
    label: 'Copy the InChI',
    copiedLabel: 'On the clipboard',
    icon: 'paperclip'
  }
}`,...m.parameters?.docs?.source},description:{story:`The label and its confirmation are both the site's own words.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    content: hitList,
    label: 'Copy 5 rows'
  },
  parameters: {
    controls: {
      exclude: ['content']
    }
  }
}`,...h.parameters?.docs?.source},description:{story:`The lazy form: the table is only written out once the button is pressed.`,...h.parameters?.docs?.description}}},g=[`Default`,`Minimal`,`IconOnly`,`CustomLabel`,`LazyContent`]})))()}_();export{m as CustomLabel,d as Default,p as IconOnly,h as LazyContent,f as Minimal,g as __namedExportsOrder,u as default};