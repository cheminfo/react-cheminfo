import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Dlg4JU8y.js";import{n,t as r}from"./useT-BFqx69Ef.js";import{n as i}from"./joinClassNames-BbK_6p9Z.js";import{n as a,t as o}from"./MenuButton-D7BSeVhH.js";import{n as s,t as c}from"./EcosystemMenu-C7MR6Sd1.js";function l(e){let{currentSiteId:t,atHome:r,label:a,className:s,...l}=e,d=n();return(0,u.jsx)(o,{...l,className:i(`ecosystem-button`,s),icon:`grid-view`,label:a??d(`ecosystem.tools`),menu:(0,u.jsx)(c,{currentSiteId:t,atHome:r})})}var u;function d(){return(d=e((()=>{r(),a(),s(),u=t(),l.__docgenInfo={description:`The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo.
@param props - The site it sits on, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`EcosystemButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the text is left out of the button altogether, rather than only
hidden: a bar that has run out of room drops the caret with it. The glyph
names itself through its tooltip either way.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'iupac-name'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'metabo'
| 'derepflow'
| 'isomers'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'spectroscopy'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'
| 'molecules'
| 'fair'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'slides'
| 'chembio'
| 'wikidata'
| 'mz'
| 'plot'
| 'ml'
| 'vibrations'
| 'uv-vis'
| 'xps'
| 'cell'
| 'diagram'
| 'peptide'
| 'optics'
| 'circuits'
| 'mechanics'
| 'draw'
| 'plate'
| 'glassware'
| 'write'
| 'nmr'
| 'electrochemistry'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'fair'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'plot'`},{name:`literal`,value:`'ml'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'uv-vis'`},{name:`literal`,value:`'xps'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'diagram'`},{name:`literal`,value:`'peptide'`},{name:`literal`,value:`'optics'`},{name:`literal`,value:`'circuits'`},{name:`literal`,value:`'mechanics'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'plate'`},{name:`literal`,value:`'glassware'`},{name:`literal`,value:`'write'`},{name:`literal`,value:`'nmr'`},{name:`literal`,value:`'electrochemistry'`}]},description:`The site this button sits on, which is shown but never linked.
@default undefined`},atHome:{required:!1,tsType:{name:`boolean`},description:`Whether the button sits on the family's entrance, www.cheminfo.org, which
its menu then does not link back to.
@default false`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default the chrome's own word for it, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}export{d as n,l as t};