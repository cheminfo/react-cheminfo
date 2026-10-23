import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-4Zysk6mk.js";import{n,r}from"./familyTokens-DsQXXJV4.js";import{c as i,g as a,v as o}from"./pedagogyFixtures-CJW_gw23.js";import{n as s,t as c}from"./TestCaseList-9QCRqjN_.js";var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{s(),r(),o(),l=t(),u=e=>(0,l.jsx)(`div`,{style:{width:`min(40rem, 92vw)`},children:(0,l.jsx)(e,{})}),d={title:`Pedagogy/TestCaseList`,component:c,decorators:[u],args:{results:i},argTypes:{pending:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:"One row per graded case, each carrying the validator’s own sentence. The sentence is the teaching — `matched, but an ester is not an acid` is what a student can act on, where `assertion failed` is not — so it is never paraphrased here."}}}},f={},p={render:e=>(0,l.jsx)(c,{results:i,pending:e.pending,label:e=>(0,l.jsxs)(l.Fragment,{children:[e.name,(0,l.jsx)(`code`,{style:g,children:e.smiles})]})})},m={args:{results:a}},h={args:{pending:!0}},g={color:n.textMuted,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,fontWeight:400,marginLeft:8},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:'`C(=O)O` typed for "every carboxylic acid and nothing else": four cases pass,\nand the two that fail say exactly what to change.',...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <TestCaseList results={QUERY_TEST_CASES} pending={args.pending} label={result => <>
          {result.name}
          <code style={SMILES_STYLE}>{result.smiles}</code>
        </>} />
}`,...p.parameters?.docs?.source},description:{story:`Naming the molecule turns the list into the chemistry problem it is.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    results: SOLVED_TEST_CASES
  }
}`,...m.parameters?.docs?.source},description:{story:"The same six once the query reads `[CX3](=O)[OX2H1]` — green all the way down.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    pending: true
  }
}`,...h.parameters?.docs?.source},description:{story:`The answer did not compile, so nothing actually failed: every case is drawn
neutral rather than red, and a student is not told they got six wrong.`,...h.parameters?.docs?.description}}},_=[`Default`,`WithTheMoleculeNamed`,`AllPassing`,`NotGradedYet`]})))()}v();export{m as AllPassing,f as Default,h as NotGradedYet,p as WithTheMoleculeNamed,_ as __namedExportsOrder,d as default};