import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DVwYlzDU.js";import{i as n,n as r,t as i}from"./AboutPage-BAHK8smQ.js";import{n as a,r as o}from"./platformPaper-OTvVVe2g.js";import{n as s,t as c}from"./SiteTheme-Bv-RMe0g.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{r(),n(),o(),s(),l=t(),u={siteId:`smiles`,what:`Draw a structure and read its SMILES, or write SMILES and see the structure.`,can:[`Convert in both directions, in the browser.`,`Search a library by substructure.`,`Learn the notation from the tutorial and its exercises.`,`Share a structure as a link, or embed it in a course.`],credits:[`openchemlib`,`react-ocl`,`blueprint`,`react`,`vite`]},d={...u,cite:[a],build:{version:`1.4.0`,builtAt:`2026-09-16T09:41:07Z`,commit:`a1b2c3d4e5f60718293a4b5c6d7e8f9012345678`}},f=[{name:`mf-parser`,version:`3.4.0`,license:`MIT`,own:!0},{name:`react-cheminfo`,version:`0.94.0`,license:`MIT`,own:!0},{name:`react`,version:`19.3.0`,license:`MIT`,own:!1},{name:`tslib`,version:`2.8.1`,license:`0BSD`,own:!1}],p={title:`About/AboutPage`,component:i,args:{content:u},beforeEach:()=>{let{fetch:e}=globalThis;return globalThis.fetch=(t,n)=>typeof t==`string`&&t.endsWith(`/packages.json`)?Promise.resolve(Response.json(f)):e(t,n),()=>{globalThis.fetch=e}},parameters:{layout:`fullscreen`,docs:{description:{component:`The About every site of the family shows at /about: the same sections, in the same order, from a record the site writes and a registry it does not.`}}},render:e=>(0,l.jsxs)(`div`,{style:{background:`var(--surface-sunken)`,padding:24},children:[(0,l.jsx)(c,{siteId:`smiles`}),(0,l.jsx)(i,{...e})]})},m={},h={args:{content:d}},g={args:{content:d,signIn:{href:`/admin`}}},_={args:{content:{...d,build:{version:`0.0.0`,builtAt:`2026-09-16T09:41:07Z`,commit:`a1b2c3d4e5f60718293a4b5c6d7e8f9012345678`}}}},v={args:{content:{...d,people:[{name:`Luc Patiny`}],providedBy:[`epfl`]}}},y={args:{content:{...d,credits:[`openchemlib`,`react-science`,`blueprint`,`react`,`vite`],people:[{name:`Luc Patiny`}],providedBy:[`epfl`]}}},b={args:{content:{...d,people:[{name:`Luc Patiny`}],contributors:[{name:`Daniel Kostro`,role:`wrote chem-equilibrium, the solver every page runs on.`},{name:`Régis Turin`,role:`wrote the exercises and the worked examples.`}],providedBy:[`epfl`]}}},x={args:{content:{...u,siteId:`regexp`,what:`Learn regular expressions by writing them against live text.`,can:[`Test a pattern against your own text, as you type.`,`Walk the tutorial, then solve the exercises.`,`Look a construct up on the cheatsheet.`],credits:[`blueprint`,`react`,`vite`]}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    content: CITED
  }
}`,...h.parameters?.docs?.source},description:{story:`A site with a paper of its own, and a version it knows.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    content: CITED,
    signIn: {
      href: '/admin'
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`A site with accounts: signing in starts under the version, never in the bar.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      build: {
        version: '0.0.0',
        builtAt: '2026-09-16T09:41:07Z',
        commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
      }
    }
  }
}`,..._.parameters?.docs?.source},description:{story:`A site with no release yet is named by the commit it was built from.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      people: [{
        name: 'Luc Patiny'
      }],
      providedBy: ['epfl']
    }
  }
}`,...v.parameters?.docs?.source},description:{story:`A site provided by Luc Patiny at EPFL. The list under the names is the
family's: Luc Patiny first, then Michaël Zasso, who maintains OpenChemLib —
credited here — and the tooling, at Zakodium.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      credits: ['openchemlib', 'react-science', 'blueprint', 'react', 'vite'],
      people: [{
        name: 'Luc Patiny'
      }],
      providedBy: ['epfl']
    }
  }
}`,...y.parameters?.docs?.source},description:{story:`A site whose design is react-science: Daniel Kostro, who maintains it at
Zakodium, comes second.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      people: [{
        name: 'Luc Patiny'
      }],
      contributors: [{
        name: 'Daniel Kostro',
        role: 'wrote chem-equilibrium, the solver every page runs on.'
      }, {
        name: 'Régis Turin',
        role: 'wrote the exercises and the worked examples.'
      }],
      providedBy: ['epfl']
    }
  }
}`,...b.parameters?.docs?.source},description:{story:`A site some others worked on: they follow the family, each with one line.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...SMILES,
      siteId: 'regexp',
      what: 'Learn regular expressions by writing them against live text.',
      can: ['Test a pattern against your own text, as you type.', 'Walk the tutorial, then solve the exercises.', 'Look a construct up on the cheatsheet.'],
      credits: ['blueprint', 'react', 'vite']
    }
  }
}`,...x.parameters?.docs?.source},description:{story:`Another site, to show that only the two colours and the words change.`,...x.parameters?.docs?.description}}},S=[`Default`,`WithCitation`,`WithSignIn`,`NeverReleased`,`ProvidedBy`,`ProvidedWithReactScience`,`ProvidedByATeam`,`AnotherSite`]})))()}C();export{x as AnotherSite,m as Default,_ as NeverReleased,v as ProvidedBy,b as ProvidedByATeam,y as ProvidedWithReactScience,h as WithCitation,g as WithSignIn,S as __namedExportsOrder,p as default};