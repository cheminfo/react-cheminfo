import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,r as n}from"./lookup-DyT08g1J.js";import{h as r,n as i}from"./iframe-tcjnLE2W.js";import{n as a,t as o}from"./useT-iBUPBC9A.js";import{n as s,t as c}from"./ShareDialog-VSsu9JQS.js";import{n as l,t as u}from"./ShareButton-CDG9RUrB.js";function d(e){let{siteId:n,frameTitle:r,search:i,compact:o=!1,buttonLabel:s,buttonTitle:l,variant:d,open:h,onOpenChange:g,onOpen:_,title:v,...y}=e,b=a(),[x,S]=(0,p.useState)(!1),C=h??x;function w(e){h===void 0&&S(e),g?.(e)}let T=n===void 0?void 0:t(n).host,E=r??(T===void 0?v:b(`share.frameTitle`,{site:T,title:v}));return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(u,{compact:o,label:s,title:l,variant:d,onClick:()=>{_?.(),w(!0)}}),(0,m.jsx)(c,{...y,title:v,frameTitle:E,search:C&&typeof i==`function`?i():f(i),isOpen:C,onClose:()=>{w(!1)}})]})}function f(e){return typeof e==`string`?e:void 0}var p,m;function h(){return(h=e((()=>{p=r(),n(),o(),l(),s(),m=i(),d.__docgenInfo={description:`The Share entry of a header and the dialog it opens: the page handed out as a
link, or as the iframe that frames it in somebody else's site.

It is what a header's \`share\` prop takes, so the entry lands after Contact on
every site. Everything the dialog can be told is passed straight through; the
control adds the open state, and the frame's name read off the site.
@param props - The dialog's props, and how the button is dressed.
@returns The button, and the dialog while it is open.`,methods:[],displayName:`ShareControl`,props:{siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'iupac-name'
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
| 'molecules'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'powerpoint'
| 'chembio'
| 'wikidata'
| 'mz'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'powerpoint'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`}]},description:"The site the page belongs to, which names the frame `<host> — <title>`.\n@default undefined — the frame is named by the title alone"},frameTitle:{required:!1,tsType:{name:`string`},description:"What a screen reader announces the frame as.\n@default `<host> — <title>` with a `siteId`, the title without one"},search:{required:!1,tsType:{name:`union`,raw:`string | (() => string | undefined)`,elements:[{name:`string`},{name:`unknown`}]},description:`The address as it stands, so the tool's inputs travel with the link. A
function is called only while the dialog is open, so a value that is costly
to write — a pinned preference, a list of molecules — is written when a
link is asked for and not on every render of the header.
@default the query string of the page`},compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button keeps only its icon, in a bar that has run out of room.
@default false`},buttonLabel:{required:!1,tsType:{name:`string`},description:`Text of the button.
@default the chrome's own word for it, in the language of the page`},buttonTitle:{required:!1,tsType:{name:`string`},description:`What the pointer is told over the button.
@default the chrome's own line, in the language of the page`},variant:{required:!1,tsType:{name:`union`,raw:`'nav-link' | 'blueprint'`,elements:[{name:`literal`,value:`'nav-link'`},{name:`literal`,value:`'blueprint'`}]},description:`A plain bar entry, or a Blueprint button for a toolbar made of them.
@default 'nav-link'`},open:{required:!1,tsType:{name:`boolean`},description:`Whether the dialog is open, for a page that has to know — to compute what
the dialog shows only while it is. Pass it with \`onOpenChange\`.
@default undefined — the control keeps the state itself`},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(open: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`open`}],return:{name:`void`}}},description:`Called when the dialog opens or closes.
@default undefined`},onOpen:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called as the button is pressed, before the dialog opens — to write the
page's state into the address the link is read from.
@default undefined`}},composes:[`Omit`]}})))()}export{h as n,d as t};