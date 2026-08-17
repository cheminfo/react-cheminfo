import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DqsyC3lB.js";import{n,t as r}from"./icon-Di2Qa_lt.js";import{c as i,g as a,v as o}from"./pedagogyFixtures-SRQjvSWn.js";function s(e){let{results:t,label:n,pending:i=!1,className:a}=e;if(t.length===0)return null;let o=[];for(let e=0;e<t.length;e++){let a=t[e];o.push((0,d.jsxs)(`li`,{style:u(a.passed,i),children:[(0,d.jsx)(r,{icon:c(a.passed,i),intent:l(a.passed,i)}),(0,d.jsxs)(`span`,{children:[n!==void 0&&(0,d.jsx)(`strong`,{style:p,children:n(a,e)}),a.reason!==``&&(0,d.jsx)(`span`,{style:m,children:a.reason})]})]},`case-${e}`))}return(0,d.jsx)(`ul`,{className:a,style:f,children:o})}function c(e,t){return e?`tick-circle`:t?`circle`:`cross-circle`}function l(e,t){return e?`success`:t?`none`:`danger`}function u(e,t){let n=!e&&!t;return{display:`flex`,alignItems:`start`,gap:8,padding:`4px 8px`,borderRadius:3,borderLeft:`3px solid ${e?`#1c6e42`:n?`#cd4246`:`#c5cbd3`}`,background:e?`rgb(236 253 245)`:n?`rgb(254 243 242)`:`rgb(245 248 250)`}}var d,f,p,m;function h(){return(h=e((()=>{n(),d=t(),f={display:`flex`,flexDirection:`column`,gap:4,listStyle:`none`,margin:0,padding:0},p={marginRight:6},m={display:`block`,color:`rgb(65 75 90)`,lineHeight:1.4},s.__docgenInfo={description:`One row per graded case: whether it passes, and the sentence saying why not.

The sentence is the validator's own — \`match was "cat", expected "cats"\` —
and is never rewritten here: the explanation is the teaching, and a
paraphrase would drop the value the student has to compare.
@param props - The cases, and whether they could be graded at all.
@returns The list, or nothing when there is no case to show.`,methods:[],displayName:`TestCaseList`,props:{results:{required:!0,tsType:{name:`unknown`},description:`The graded cases, in the order the validator returned them.`},label:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(result: TCase, position: number) => ReactNode`,signature:{arguments:[{type:{name:`TCase`},name:`result`},{type:{name:`number`},name:`position`}],return:{name:`ReactNode`}}},description:`What names a case: the input it was run on, the atom it asked about. A
tool that carries no such name lets the sentence speak for itself.
@default undefined — the row shows only the reason`},pending:{required:!1,tsType:{name:`boolean`},description:`Whether the answer could not be graded at all — it does not compile, or
there is nothing to mark yet. Every case is then drawn neutral rather than
red, since none of them actually failed.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class the list carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}var g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{h(),o(),g=t(),_=e=>(0,g.jsx)(`div`,{style:{width:`min(40rem, 92vw)`},children:(0,g.jsx)(e,{})}),v={title:`Pedagogy/TestCaseList`,component:s,decorators:[_],args:{results:i},argTypes:{pending:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:"One row per graded case, each carrying the validator’s own sentence. The sentence is the teaching — `matched, but an ester is not an acid` is what a student can act on, where `assertion failed` is not — so it is never paraphrased here."}}}},y={},b={render:e=>(0,g.jsx)(s,{results:i,pending:e.pending,label:e=>(0,g.jsxs)(g.Fragment,{children:[e.name,(0,g.jsx)(`code`,{style:C,children:e.smiles})]})})},x={args:{results:a}},S={args:{pending:!0}},C={color:`#5b6875`,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,fontWeight:400,marginLeft:8},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source},description:{story:'`C(=O)O` typed for "every carboxylic acid and nothing else": four cases pass,\nand the two that fail say exactly what to change.',...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => <TestCaseList results={QUERY_TEST_CASES} pending={args.pending} label={result => <>
          {result.name}
          <code style={SMILES_STYLE}>{result.smiles}</code>
        </>} />
}`,...b.parameters?.docs?.source},description:{story:`Naming the molecule turns the list into the chemistry problem it is.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    results: SOLVED_TEST_CASES
  }
}`,...x.parameters?.docs?.source},description:{story:"The same six once the query reads `[CX3](=O)[OX2H1]` — green all the way down.",...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    pending: true
  }
}`,...S.parameters?.docs?.source},description:{story:`The answer did not compile, so nothing actually failed: every case is drawn
neutral rather than red, and a student is not told they got six wrong.`,...S.parameters?.docs?.description}}},w=[`Default`,`WithTheMoleculeNamed`,`AllPassing`,`NotGradedYet`]})))()}T();export{x as AllPassing,y as Default,S as NotGradedYet,b as WithTheMoleculeNamed,w as __namedExportsOrder,v as default};