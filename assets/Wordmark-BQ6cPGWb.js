import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DqsyC3lB.js";import{n,t as r}from"./lookup-RQzTL3G1.js";function i(e){let{siteId:t,size:r=17,className:i}=e,c=n(t);return(0,a.jsxs)(`span`,{className:i?`wordmark ${i}`:`wordmark`,style:{...s,fontSize:r},children:[(0,a.jsx)(`span`,{className:`wordmark__lead`,style:{color:c.brand},children:c.name.lead}),c.name.dot?(0,a.jsx)(`span`,{className:`wordmark__dot`,style:{color:o},children:`.`}):null,(0,a.jsx)(`span`,{className:`wordmark__alt`,style:{color:c.brandAlt},children:c.name.alt})]})}var a,o,s;function c(){return(c=e((()=>{r(),a=t(),o=`var(--text-faint, #8a96a3)`,s={letterSpacing:`-0.01em`,whiteSpace:`nowrap`},i.__docgenInfo={description:"The name of a site, written in the two colours it owns.\n\nA name that splits on itself — `ChemCalc`, `EquiLibrium`, `PolyCarp` —\ncarries no domain and no dot; a one-word name takes `.cheminfo` after a faint\ndot. The `.org` is never written, because the name is the site rather than\nits address.\n@param props - The site, the size of the name, and extra class names.\n@returns The name, as one inline element that never wraps mid-address.",methods:[],displayName:`Wordmark`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`}]},description:`The site whose name is written.`},size:{required:!1,tsType:{name:`number`},description:`Size of the name, in pixels. The weight comes from the surrounding
context, so the same wordmark suits a header bar and a heading.
@default 17`},className:{required:!1,tsType:{name:`string`},description:`Extra class names, for spacing at the place it is used. \`wordmark\` is
always carried as well.
@default undefined`}}}})))()}export{c as n,i as t};