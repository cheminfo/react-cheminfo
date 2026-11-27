import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C4B6tZb1.js";import{n,t as r}from"./lib-PjwIRrcN.js";import{a as i,c as a,f as o,n as s,o as c,p as l,r as u,s as d,t as f}from"./seriesFixtures-Ch28XFJD.js";import{n as p,t as m}from"./GlossaryProvider-_ePK7MbT.js";function h(e){return(0,g.jsx)(n,{mf:e})}var g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{r(),l(),p(),a(),u(),g=t(),_=s.pool[2],v=`electrons/42/Fe(3+)`,y=s.pool[0],b=`signs/42/Na+`,x={title:`Pedagogy/QuestionCard`,component:d,args:{tool:s,question:_,store:c(),storageKey:v,number:3,total:10,prompt:i,onNext:()=>void 0},decorators:[e=>(0,g.jsx)(`div`,{style:{width:`min(40rem, 92vw)`},children:(0,g.jsx)(e,{})})],parameters:{layout:`padded`,docs:{description:{component:`One question of a graded series: the statement, the boxes, the four actions, and — once checked — the verdict case by case.`}}}},S={},C={args:{store:c({[v]:{...o(),status:`attempted`,answers:{electrons:`26`},checked:JSON.stringify({electrons:`26`})}})}},w={args:{store:c({[v]:{...o(),status:`solved`,answers:{electrons:`23`},checked:JSON.stringify({electrons:`23`}),hintsRevealed:2}})}},T={args:{store:c({[v]:{...o(),showSolution:!0}})}},E={args:{tool:f,question:y,storageKey:b,prompt:e=>(0,g.jsxs)(`p`,{children:[`What is `,e.name,`?`]}),store:c({[b]:{...o(),answers:{sign:`anion`}}})},decorators:[e=>(0,g.jsx)(m,{glossary:{},renderMf:h,children:(0,g.jsx)(e,{})})]},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source},description:{story:`Nothing typed yet, so Check is dead.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        status: 'attempted',
        answers: {
          electrons: '26'
        },
        checked: JSON.stringify({
          electrons: '26'
        })
      }
    })
  }
}`,...C.parameters?.docs?.source},description:{story:`A wrong answer, checked: the verdict says what came back.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        status: 'solved',
        answers: {
          electrons: '23'
        },
        checked: JSON.stringify({
          electrons: '23'
        }),
        hintsRevealed: 2
      }
    })
  }
}`,...w.parameters?.docs?.source},description:{story:`Right, after two hints: the hints stay open under the verdict.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        showSolution: true
      }
    })
  }
}`,...T.parameters?.docs?.source},description:{story:`The solution asked for, which is always one click away.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    tool: CHARGE_SIGNS,
    question: SODIUM,
    storageKey: SIGN_KEY,
    prompt: ion => <p>What is {ion.name}?</p>,
    store: storyStore({
      [SIGN_KEY]: {
        ...emptyAttempt(),
        answers: {
          sign: 'anion'
        }
      }
    })
  },
  decorators: [Story => <GlossaryProvider glossary={{}} renderMf={formula}>
        <Story />
      </GlossaryProvider>]
}`,...E.parameters?.docs?.source},description:{story:`An answer picked from a row rather than typed: the arrows move the pick,
Space picks, Enter checks the answer.`,...E.parameters?.docs?.description}}},D=[`Default`,`CheckedWrong`,`SolvedWithHints`,`SolutionShowing`,`ChoiceField`]})))()}O();export{C as CheckedWrong,E as ChoiceField,S as Default,T as SolutionShowing,w as SolvedWithHints,D as __namedExportsOrder,x as default};