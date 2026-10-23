import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-D4120jJg.js";import{n,t as r}from"./SiteTheme-ZkwSZdXh.js";function i(e){let{name:t,label:n=t,color:r,logo:i=null,identifier:o=null,count:s=1,href:c=null,compact:l=!1}=e,u=e.title??(o===null?t:`${t} ${o}`),d=[`source-badge`,l?`source-badge--compact`:``,r===void 0?`source-badge--neutral`:``].filter(Boolean).join(` `),f=typeof r==`string`?{"--source":r}:void 0,p=(0,a.jsxs)(a.Fragment,{children:[i===null?null:(0,a.jsx)(`span`,{className:`source-badge__logo`,children:(0,a.jsx)(`img`,{src:i,alt:``})}),(0,a.jsx)(`span`,{className:`source-badge__name`,children:n}),l||o===null?null:(0,a.jsx)(`span`,{className:`source-badge__id`,children:o}),s>1?(0,a.jsx)(`span`,{className:`source-badge__count`,children:s}):null]});return c===null?(0,a.jsx)(`span`,{className:d,style:f,title:u,children:p}):(0,a.jsx)(`a`,{className:d,style:f,href:c,target:`_blank`,rel:`noopener noreferrer`,title:u,children:p})}var a;function o(){return(o=e((()=>{a=t(),i.__docgenInfo={description:`A source, as a badge: its name in its own colour, its little logo on a white
chip, and the entry it holds — the same badge on every site of the family
that names where a molecule comes from.
@param props - See {@link SourceBadgeProps}.
@returns The badge.`,methods:[],displayName:`SourceBadge`,props:{name:{required:!0,tsType:{name:`string`},description:`What the source is called, read in the badge's tooltip.`},label:{required:!1,tsType:{name:`ReactNode`},description:`What the badge says.
@default name`},color:{required:!1,tsType:{name:`union`,raw:`string | null`,elements:[{name:`string`},{name:`null`}]},description:"The source's own colour, as `#rrggbb`. `null` draws it in the site's own\ncolour, which is how a site marks a source that is itself.\n@default undefined — a neutral grey, for a source with no look"},logo:{required:!1,tsType:{name:`union`,raw:`string | null`,elements:[{name:`string`},{name:`null`}]},description:`The absolute address of its little logo.
@default null`},identifier:{required:!1,tsType:{name:`union`,raw:`string | null`,elements:[{name:`string`},{name:`null`}]},description:`The entry's identifier there, written after the name.
@default null`},count:{required:!1,tsType:{name:`number`},description:`How many entries the source holds, written after the name when more than
one.
@default 1`},href:{required:!1,tsType:{name:`union`,raw:`string | null`,elements:[{name:`string`},{name:`null`}]},description:`Where the badge leads, opened in a new tab.
@default null — the badge names the source and leads nowhere`},title:{required:!1,tsType:{name:`string`},description:`The tooltip.
@default the name, then the identifier`},compact:{required:!1,tsType:{name:`boolean`},description:`The smaller badge of a dense list, whose identifier goes in the tooltip
only.
@default false`}}}})))()}var s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),o(),s=t(),c=`https://molecules.cheminfo.org/v1/sources`,l={title:`Sources/SourceBadge`,component:i,args:{name:`ChEBI`,color:`#18974c`,logo:`${c}/chebi/logo.svg`,identifier:`CHEBI:15377`,href:`https://www.ebi.ac.uk/chebi/CHEBI:15377`},decorators:[e=>(0,s.jsx)(`div`,{children:(0,s.jsx)(e,{})})],parameters:{docs:{description:{component:`Where a molecule comes from, drawn the same way on every site of the family: the colour and the logo come from molecules.cheminfo.org.`}}},render:e=>(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r,{siteId:`smiles`}),(0,s.jsx)(i,{...e})]})},u={},d={render:()=>(0,s.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:6},children:[(0,s.jsx)(r,{siteId:`smiles`}),(0,s.jsx)(i,{name:`PubChem`,color:`#0071bc`,logo:`${c}/pubchem/logo.svg`,identifier:`962`}),(0,s.jsx)(i,{name:`COCONUT`,color:`#a07050`,logo:`${c}/coconut/logo.svg`,count:3}),(0,s.jsx)(i,{name:`KEGG`,identifier:`C00001`}),(0,s.jsx)(i,{name:`web`,label:`added here`,color:null})]})},f={args:{compact:!0}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  }}>
      <SiteTheme siteId="smiles" />
      <SourceBadge name="PubChem" color="#0071bc" logo={\`\${LOGO}/pubchem/logo.svg\`} identifier="962" />
      <SourceBadge name="COCONUT" color="#a07050" logo={\`\${LOGO}/coconut/logo.svg\`} count={3} />
      <SourceBadge name="KEGG" identifier="C00001" />
      <SourceBadge name="web" label="added here" color={null} />
    </div>
}`,...d.parameters?.docs?.source},description:{story:`A row of them, as a molecule's card lists its sources.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...f.parameters?.docs?.source},description:{story:`The smaller badge of a dense grid cell.`,...f.parameters?.docs?.description}}},p=[`Default`,`Row`,`Compact`]})))()}m();export{f as Compact,u as Default,d as Row,p as __namedExportsOrder,l as default};