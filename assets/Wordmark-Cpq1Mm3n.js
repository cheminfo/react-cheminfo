import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,r as n}from"./lookup-3sQpxIQz.js";import{n as r}from"./iframe-DCXFBtgt.js";import{n as i}from"./joinClassNames-BbK_6p9Z.js";import{n as a,t as o}from"./nameColors-BYPKGqj-.js";function s(e){let{siteId:n,size:r=17,className:o}=e,s=t(n),{lead:u,alt:d,dot:f}=s.name,p=a(s);return(0,c.jsxs)(`span`,{className:i(`wordmark`,o),style:{...l,fontSize:r},children:[(0,c.jsx)(`span`,{className:`wordmark__lead`,style:{color:p.lead},children:u}),f?(0,c.jsx)(`span`,{className:`wordmark__dot`,style:{color:p.dot},children:`.`}):null,(0,c.jsx)(`span`,{className:`wordmark__alt`,style:{color:p.alt},children:d})]})}var c,l;function u(){return(u=e((()=>{n(),o(),c=r(),l={letterSpacing:`-0.01em`,whiteSpace:`nowrap`},s.__docgenInfo={description:"The name of a site, written in the two colours it owns.\n\nA name that splits on itself — `ChemCalc`, `EquiLibrium`, `PolyCarp` —\ncarries no domain and no dot; a one-word name takes `.cheminfo` after a faint\ndot. The `.org` is never written, because the name is the site rather than\nits address.\n@param props - The site, the size of the name, and extra class names.\n@returns The name, as one inline element that never wraps mid-address.",methods:[],displayName:`Wordmark`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'openbabel'
| 'chemcalc'
| 'nmrium'
| 'metabo'
| 'derepflow'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`}]},description:`The site whose name is written.`},size:{required:!1,tsType:{name:`number`},description:`Size of the name, in pixels. The weight comes from the surrounding
context, so the same wordmark suits a header bar and a heading.
@default 17`},className:{required:!1,tsType:{name:`string`},description:`Extra class names, for spacing at the place it is used. \`wordmark\` is
always carried as well.
@default undefined`}}}})))()}export{u as n,s as t};