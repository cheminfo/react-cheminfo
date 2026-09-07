import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DqpBrNIF.js";import{n,t as r}from"./lookup-h4-Yw8WY.js";function i(e){let t=n(e),r=a(t),i=[`--brand: ${t.brand};`,`--brand-alt: ${r};`];return t.brandAlt!==r&&i.push(`--brand-alt-text: ${t.brandAlt};`),i.push(`--accent: var(--brand);`),`:root {\n  ${i.join(`
  `)}\n}\n`}function a(e){return e.mark.accent===e.brand?e.mark.plate:e.mark.accent}function o(){return(o=e((()=>{r()})))()}function s(e){return(0,c.jsx)(`style`,{children:i(e.siteId)})}var c;function l(){return(l=e((()=>{o(),c=t(),s.__docgenInfo={description:`The two colours a site owns, put on the page as custom properties.

Everything of the family that reads \`--brand\`, \`--brand-alt\` or \`--accent\` —
a mark drawn in token colours, a current menu item, a focus ring — follows
from here, so a site declares its palette once and never repeats a hex code
in a component.
@param props - The site whose palette is injected.
@returns The rule, as a style element that applies wherever it is rendered.`,methods:[],displayName:`SiteTheme`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
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
| 'database'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`}]},description:`The site whose palette the page takes.`}}}})))()}export{l as n,s as t};