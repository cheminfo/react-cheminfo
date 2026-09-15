import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Bh_4mKxw.js";import{n}from"./joinClassNames-BbK_6p9Z.js";import{n as r,r as i}from"./familyTokens-DsQXXJV4.js";import{p as a,u as o,v as s}from"./pedagogyFixtures-CJW_gw23.js";import{n as c,t as l}from"./ReferenceSectionBlock-Br0LRBBu.js";function u(e){let{sections:t,minColumnWidth:r=320,syntaxWidth:i=150,className:a}=e;return(0,f.jsx)(`div`,{className:n(`reference-grid`,a),style:d(r),children:t.map(e=>(0,f.jsx)(l,{section:e,syntaxWidth:i},e.id))})}function d(e){return{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(${e}px, 1fr))`,gap:`10px 24px`,alignItems:`start`}}var f;function p(){return(p=e((()=>{c(),f=t(),u.__docgenInfo={description:`The whole cheatsheet: as many columns as the paper or the window allows.

Students print this page and take it into an exam room, so the columns
reflow to the sheet and every block is kept off a page break.
@param props - The sections, and how they are laid out.
@returns The grid.`,methods:[],displayName:`ReferenceGrid`,props:{sections:{required:!0,tsType:{name:`unknown`},description:`The blocks of the cheatsheet, in reading order.`},minColumnWidth:{required:!1,tsType:{name:`number`},description:`Width under which a column wraps to the next line, in pixels.
@default 320`},syntaxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the syntax column of every block, so they line up across columns.
@default 150`},className:{required:!1,tsType:{name:`string`},description:"Class the grid carries, in addition to `reference-grid`.\n@default undefined"}}}})))()}var m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{p(),i(),s(),m=t(),h={title:`Pedagogy/ReferenceGrid`,component:u,args:{sections:a},argTypes:{minColumnWidth:{control:{type:`range`,min:240,max:800,step:20}},syntaxWidth:{control:{type:`range`,min:60,max:260,step:10}}},parameters:{layout:`padded`,docs:{description:{component:`The whole cheatsheet: as many columns as the window or the sheet of paper allows, with each block kept off a page break. Students print this and take it into the exam room.`}}}},g={},_={render:e=>(0,m.jsxs)(`article`,{style:x,children:[(0,m.jsxs)(`header`,{style:S,children:[(0,m.jsx)(`h3`,{style:{margin:0},children:`SMILES cheatsheet`}),(0,m.jsx)(`span`,{style:C,children:`smiles.cheminfo.org`})]}),(0,m.jsx)(u,{...e})]})},v={args:{sections:[...a,o]}},y={args:{minColumnWidth:720}},b={args:{syntaxWidth:220,minColumnWidth:420}},x={background:r.surface,border:`1px solid ${r.border}`,borderRadius:10,boxShadow:`0 1px 2px rgb(16 32 48 / 8%)`,display:`flex`,flexDirection:`column`,gap:12,padding:`18px 20px`},S={alignItems:`baseline`,display:`flex`,gap:8},C={color:r.textMuted,fontSize:12},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source},description:{story:`Five blocks of SMILES syntax; the dotted rows open the long description.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => <article style={SHEET_STYLE}>
      <header style={SHEET_HEADER_STYLE}>
        <h3 style={{
        margin: 0
      }}>SMILES cheatsheet</h3>
        <span style={SUBTITLE_STYLE}>smiles.cheminfo.org</span>
      </header>
      <ReferenceGrid {...args} />
    </article>
}`,..._.parameters?.docs?.source},description:{story:`The page as it prints: a titled white sheet, and nothing else on it.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [...SMILES_REFERENCE, SCREEN_ONLY_SECTION]
  }
}`,...v.parameters?.docs?.source},description:{story:"A block marked `noPrint` carries the `no-print` class, so the sheet drops it\nwhile the screen keeps it.",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    minColumnWidth: 720
  }
}`,...y.parameters?.docs?.source},description:{story:`On a narrow page — or a phone — the columns fall into one.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    syntaxWidth: 220,
    minColumnWidth: 420
  }
}`,...b.parameters?.docs?.source},description:{story:`A wider syntax column, for a dialect whose constructs are long.`,...b.parameters?.docs?.description}}},w=[`Default`,`CheatsheetPage`,`WithAScreenOnlyBlock`,`OneColumn`,`WideSyntaxColumn`]})))()}T();export{_ as CheatsheetPage,g as Default,y as OneColumn,b as WideSyntaxColumn,v as WithAScreenOnlyBlock,w as __namedExportsOrder,h as default};