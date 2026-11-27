import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-C4B6tZb1.js";import{n as r,t as i}from"./useT-MSalwyhn.js";import{n as a,t as o}from"./htmlSelect-CGA0IxsK.js";import{n as s,r as c}from"./buttons-DnEcx8Hx.js";import{n as l,t as u}from"./dialog-B0JQZ_nA.js";import{n as d,t as f}from"./dialogBody-CC0fLTh-.js";import{n as p,r as m}from"./familyTokens-DsQXXJV4.js";import{l as h,o as g}from"./structureFixtures-CJ3OPkrl.js";import{i as _,n as v,r as y,t as b}from"./StructureSearchPanel-CPAul0OG.js";function x(e){let{isOpen:t,value:n,onClose:i,modes:a=y,examples:o,thresholds:s,similarityControls:c,usePortal:l=!0}=e,d=r(),p=S(t),m=(0,C.useRef)(n),h={...n,mode:a.includes(n.mode)?n.mode:a[0]??n.mode};return(0,w.jsx)(u,{isOpen:t,onOpening:()=>{m.current=h},onClose:()=>i(m.current),usePortal:l,title:d(`structure.search.title`),className:`structure-search`,children:(0,w.jsx)(f,{children:(0,w.jsx)(b,{value:h,modes:a,...o&&{examples:o},...s&&{thresholds:s},similarityControls:c,onChange:e=>{m.current=e},onSearch:i},p)})})}function S(e){let[t,n]=(0,C.useState)({wasOpen:e,count:0});if(t.wasOpen===e)return t.count;let r=e?t.count+1:t.count;return n({wasOpen:e,count:r}),r}var C,w;function T(){return(T=e((()=>{l(),d(),C=t(),i(),_(),v(),w=n(),x.__docgenInfo={description:`Draw a structure and press how it is matched: contained, similar, or the
same compound with or without its stereochemistry and tautomerism. Pressing
a mode closes the dialog with it.
@param props - See {@link StructureSearchDialogProps}.
@returns The dialog.`,methods:[],displayName:`StructureSearchDialog`,props:{isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the dialog is on screen.`},value:{required:!0,tsType:{name:`StructureSearchQuery`},description:`The question the dialog opens on; its drawing is loaded into the canvas.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(query: StructureSearchQuery) => void`,signature:{arguments:[{type:{name:`StructureSearchQuery`},name:`query`}],return:{name:`void`}}},description:`Called when the dialog closes — by a mode, by Escape or by its × alike —
with what it then holds, so no drawing is lost to a stray Escape. A mode
hands back that mode; Escape and × the one the dialog opened on. The
idCode is empty when the canvas was cleared.`},modes:{required:!1,tsType:{name:`unknown`},description:`The modes offered, in order.
@default STRUCTURE_SEARCH_MODES`},examples:{required:!1,tsType:{name:`unknown`},description:`The fragments offered under the canvas.
@default benzene, pyridine, amide, sulfonamide and trifluoromethyl`},thresholds:{required:!1,tsType:{name:`unknown`},description:`The least similarities offered, ascending.
@default SIMILARITY_THRESHOLDS`},similarityControls:{required:!1,tsType:{name:`ReactNode`},description:`More controls under the least similarity, such as the fingerprint a site
compares.
@default undefined`},usePortal:{required:!1,tsType:{name:`boolean`},description:"Whether the dialog is rendered through a portal on `document.body`.\n@default true"}}}})))()}function E(e){let[t,n]=(0,D.useState)(e.isOpen),[r,i]=(0,D.useState)(e.value);return(0,O.jsxs)(`div`,{style:N,children:[(0,O.jsx)(s,{text:`Draw a structure`,onClick:()=>n(!0)}),(0,O.jsx)(`output`,{"data-testid":`structure-search-result`,style:P,children:r.idCode===``?`nothing drawn`:`${r.mode} ≥ ${r.threshold} ${r.idCode.split(` `,1)[0]}`}),(0,O.jsx)(x,{...e,isOpen:t,value:r,onClose:e=>{i(e),n(!1)}})]})}var D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{c(),a(),D=t(),T(),m(),h(),O=n(),k={title:`Structure/StructureSearchDialog`,component:x,args:{isOpen:!0,value:{idCode:``,mode:`substructure`,threshold:.7},onClose:()=>{}},parameters:{layout:`padded`,docs:{description:{component:`Draw a structure and press how it is matched: contained, similar, or the same compound with or without its stereochemistry and tautomerism. Each mode is a large button saying what it finds; pressing it closes the dialog with that mode. Escape hands back what is drawn in the mode the dialog opened on.`}}},render:e=>(0,O.jsx)(E,{...e})},A={},j={args:{value:{idCode:g,mode:`similarity`,threshold:.8},similarityControls:(0,O.jsx)(o,{minimal:!0,"aria-label":`Fingerprint`,options:[`FragFp`]})}},M={args:{modes:[`substructure`,`exact`],examples:[{label:`Tropane`,smiles:`CN1C2CCC1CCC2`,help:`Cocaine`},{label:`Indole`,smiles:`c1ccc2[nH]ccc2c1`,help:`Tryptamines`}]}},N={display:`flex`,alignItems:`center`,gap:12},P={color:p.textMuted,fontFamily:`monospace`},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{}`,...A.parameters?.docs?.source},description:{story:`An empty canvas, ready for a first query.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    value: {
      idCode: BENZENE_QUERY,
      mode: 'similarity',
      threshold: 0.8
    },
    similarityControls: <HTMLSelect minimal aria-label="Fingerprint" options={['FragFp']} />
  }
}`,...j.parameters?.docs?.source},description:{story:`A similarity search reopened on its benzene, with a control of the site's
own beside the threshold.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    modes: ['substructure', 'exact'],
    examples: [{
      label: 'Tropane',
      smiles: 'CN1C2CCC1CCC2',
      help: 'Cocaine'
    }, {
      label: 'Indole',
      smiles: 'c1ccc2[nH]ccc2c1',
      help: 'Tryptamines'
    }]
  }
}`,...M.parameters?.docs?.source},description:{story:`A site offering two modes and fragments of its own subject.`,...M.parameters?.docs?.description}}},F=[`Default`,`Similarity`,`SiteModes`]})))()}I();export{A as Default,j as Similarity,M as SiteModes,F as __namedExportsOrder,k as default};