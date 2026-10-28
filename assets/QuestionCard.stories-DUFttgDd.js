import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Bf7Xc74g.js";import{a as n,d as r,f as i,i as a,n as o,o as s,s as c,t as l}from"./seriesFixtures-DePWuU4x.js";var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{i(),c(),o(),u=t(),d=l.pool[2],f=`electrons/42/Fe(3+)`,p={title:`Pedagogy/QuestionCard`,component:s,args:{tool:l,question:d,store:n(),storageKey:f,number:3,total:10,prompt:a,onNext:()=>void 0},decorators:[e=>(0,u.jsx)(`div`,{style:{width:`min(40rem, 92vw)`},children:(0,u.jsx)(e,{})})],parameters:{layout:`padded`,docs:{description:{component:`One question of a graded series: the statement, the boxes, the four actions, and — once checked — the verdict case by case.`}}}},m={},h={args:{store:n({[f]:{...r(),status:`attempted`,answers:{electrons:`26`},checked:JSON.stringify({electrons:`26`})}})}},g={args:{store:n({[f]:{...r(),status:`solved`,answers:{electrons:`23`},checked:JSON.stringify({electrons:`23`}),hintsRevealed:2}})}},_={args:{store:n({[f]:{...r(),showSolution:!0}})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`Nothing typed yet, so Check is dead.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`A wrong answer, checked: the verdict says what came back.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Right, after two hints: the hints stay open under the verdict.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        showSolution: true
      }
    })
  }
}`,..._.parameters?.docs?.source},description:{story:`The solution asked for, which is always one click away.`,..._.parameters?.docs?.description}}},v=[`Default`,`CheckedWrong`,`SolvedWithHints`,`SolutionShowing`]})))()}y();export{h as CheckedWrong,m as Default,_ as SolutionShowing,g as SolvedWithHints,v as __namedExportsOrder,p as default};