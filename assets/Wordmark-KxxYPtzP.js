import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,r as n}from"./lookup-DCkzqGBz.js";import{n as r}from"./iframe-BHqnBZ87.js";import{n as i}from"./joinClassNames-BbK_6p9Z.js";import{n as a,t as o}from"./nameColors-BYPKGqj-.js";function s(e){let{site:n,siteId:r,size:o=17,className:s}=e,u=n??(r===void 0?void 0:t(r));if(u===void 0)throw Error("Wordmark needs one of its `site` and `siteId` props");let{lead:d,alt:f,dot:p}=u.name,m=a(u);return(0,c.jsxs)(`span`,{className:i(`wordmark`,s),style:{...l,fontSize:o},children:[(0,c.jsx)(`span`,{className:`wordmark__lead`,style:{color:m.lead},children:d}),p?(0,c.jsx)(`span`,{className:`wordmark__dot`,style:{color:m.dot},children:`.`}):null,(0,c.jsx)(`span`,{className:`wordmark__alt`,style:{color:m.alt},children:f})]})}var c,l;function u(){return(u=e((()=>{n(),o(),c=r(),l={letterSpacing:`-0.01em`,whiteSpace:`nowrap`},s.__docgenInfo={description:"The name of a site, written in the two colours it owns.\n\nA name that splits on itself — `ChemCalc`, `EquiLibrium`, `PolyCarp` —\ncarries no domain and no dot; a one-word name takes `.cheminfo` after a faint\ndot. The `.org` is never written, because the name is the site rather than\nits address.\n@param props - The site, the size of the name, and extra class names.\n@returns The name, as one inline element that never wraps mid-address.\n@throws {Error} When neither `site` nor `siteId` is given.",methods:[],displayName:`Wordmark`,props:{site:{required:!1,tsType:{name:`EcosystemSite`},description:"The site whose name is written, passed rather than named — for a site that\nis deliberately not one of `ECOSYSTEM_SITES`. One of `site` and `siteId` is\nrequired.\n@default undefined"},siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'openbabel'
| 'chemcalc'
| 'dbe'
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
| 'database'
| 'symmetry'
| 'osiris'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`}]},description:`The same site, named rather than passed, which is what a header knows.
@default undefined`},size:{required:!1,tsType:{name:`number`},description:`Size of the name, in pixels. The weight comes from the surrounding
context, so the same wordmark suits a header bar and a heading.
@default 17`},className:{required:!1,tsType:{name:`string`},description:`Extra class names, for spacing at the place it is used. \`wordmark\` is
always carried as well.
@default undefined`}}}})))()}export{u as n,s as t};