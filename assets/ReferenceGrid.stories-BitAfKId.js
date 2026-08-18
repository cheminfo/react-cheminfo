import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-NhtRTM8t.js";import{p as n,u as r,v as i}from"./pedagogyFixtures-SRQjvSWn.js";import{n as a,t as o}from"./ReferenceSectionBlock-BGLvtB8B.js";function s(e){let{sections:t,minColumnWidth:n=320,syntaxWidth:r=150,className:i}=e;return(0,l.jsx)(`div`,{className:i===void 0?`reference-grid`:`reference-grid ${i}`,style:c(n),children:t.map(e=>(0,l.jsx)(o,{section:e,syntaxWidth:r},e.id))})}function c(e){return{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(${e}px, 1fr))`,gap:`10px 24px`,alignItems:`start`}}var l;function u(){return(u=e((()=>{a(),l=t(),s.__docgenInfo={description:`The whole cheatsheet: as many columns as the paper or the window allows.

Students print this page and take it into an exam room, so the columns
reflow to the sheet and every block is kept off a page break.
@param props - The sections, and how they are laid out.
@returns The grid.`,methods:[],displayName:`ReferenceGrid`,props:{sections:{required:!0,tsType:{name:`unknown`},description:`The blocks of the cheatsheet, in reading order.`},minColumnWidth:{required:!1,tsType:{name:`number`},description:`Width under which a column wraps to the next line, in pixels.
@default 320`},syntaxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the syntax column of every block, so they line up across columns.
@default 150`},className:{required:!1,tsType:{name:`string`},description:"Class the grid carries, in addition to `reference-grid`.\n@default undefined"}}}})))()}var d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{u(),i(),d=t(),f={title:`Pedagogy/ReferenceGrid`,component:s,args:{sections:n},argTypes:{minColumnWidth:{control:{type:`range`,min:240,max:800,step:20}},syntaxWidth:{control:{type:`range`,min:60,max:260,step:10}}},parameters:{layout:`padded`,docs:{description:{component:`The whole cheatsheet: as many columns as the window or the sheet of paper allows, with each block kept off a page break. Students print this and take it into the exam room.`}}}},p={},m={render:e=>(0,d.jsxs)(`article`,{style:v,children:[(0,d.jsxs)(`header`,{style:y,children:[(0,d.jsx)(`h3`,{style:{margin:0},children:`SMILES cheatsheet`}),(0,d.jsx)(`span`,{style:b,children:`smiles.cheminfo.org`})]}),(0,d.jsx)(s,{...e})]})},h={args:{sections:[...n,r]}},g={args:{minColumnWidth:720}},_={args:{syntaxWidth:220,minColumnWidth:420}},v={background:`var(--surface, #fff)`,border:`1px solid var(--border, #dfe3e8)`,borderRadius:10,boxShadow:`0 1px 2px rgb(16 32 48 / 8%)`,display:`flex`,flexDirection:`column`,gap:12,padding:`18px 20px`},y={alignItems:`baseline`,display:`flex`,gap:8},b={color:`var(--text-muted, #5b6875)`,fontSize:12},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source},description:{story:`Five blocks of SMILES syntax; the dotted rows open the long description.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <article style={SHEET_STYLE}>
      <header style={SHEET_HEADER_STYLE}>
        <h3 style={{
        margin: 0
      }}>SMILES cheatsheet</h3>
        <span style={SUBTITLE_STYLE}>smiles.cheminfo.org</span>
      </header>
      <ReferenceGrid {...args} />
    </article>
}`,...m.parameters?.docs?.source},description:{story:`The page as it prints: a titled white sheet, and nothing else on it.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [...SMILES_REFERENCE, SCREEN_ONLY_SECTION]
  }
}`,...h.parameters?.docs?.source},description:{story:"A block marked `noPrint` carries the `no-print` class, so the sheet drops it\nwhile the screen keeps it.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    minColumnWidth: 720
  }
}`,...g.parameters?.docs?.source},description:{story:`On a narrow page — or a phone — the columns fall into one.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    syntaxWidth: 220,
    minColumnWidth: 420
  }
}`,..._.parameters?.docs?.source},description:{story:`A wider syntax column, for a dialect whose constructs are long.`,..._.parameters?.docs?.description}}},x=[`Default`,`CheatsheetPage`,`WithAScreenOnlyBlock`,`OneColumn`,`WideSyntaxColumn`]})))()}S();export{m as CheatsheetPage,p as Default,g as OneColumn,_ as WideSyntaxColumn,h as WithAScreenOnlyBlock,x as __namedExportsOrder,f as default};