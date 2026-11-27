import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BWTG3juY.js";import{n,r,t as i}from"./EmptyGuide-Rh1eAPoq.js";import{n as a,r as o}from"./ShortcutList-BswsNmYX.js";var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),o(),s=t(),c={position:`relative`,height:420,border:`1px solid var(--border)`,background:`var(--surface)`},l=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2226%22%20r%3D%2212%22%20fill%3D%22%232f8fd6%22%2F%3E%3Crect%20x%3D%2217%22%20y%3D%222%22%20width%3D%226%22%20height%3D%2214%22%20fill%3D%22%232f8fd6%22%2F%3E%3C%2Fsvg%3E`,u={title:`Guide/EmptyGuide`,component:i,decorators:[e=>(0,s.jsx)(`div`,{style:c,children:(0,s.jsx)(e,{})})],parameters:{docs:{description:{component:`What a tool shows while it holds nothing: help that stays, a hint that changes, and faint pictures of what the tool can make. The pointer goes through it, and the site stops rendering it at the first stroke.`}}}},d={args:{actions:[{label:`Start drawing`,icon:`draw`,onSelect:()=>void 0}],figuresTitle:`or click a figure to copy it to your page`,help:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n,{title:`Draw`,children:(0,s.jsx)(a,{rows:[{keys:[`Click`],label:`Draw a bond`},{keys:[`Drag`],label:`Aim it`}]})}),(0,s.jsx)(n,{title:`Point at an atom and press`,children:(0,s.jsx)(a,{rows:[{keys:[`c`,`n`,`o`],label:`Set the element`},{keys:[`+`,`-`],label:`Change the charge`}]})})]}),linksTitle:`Learn`,links:[{label:`From a blank page to a figure`,href:`#talk`}],hints:[`Paste a SMILES to add it to the drawing.`,`Drop a molfile on the page to open it.`],hintInterval:3e3,figures:[{src:l,alt:`A flask`,share:2},{src:`${l}#clicked`,alt:`Another flask`,title:`Copy it to the page`,onSelect:()=>void 0}]}},f={args:{figures:[{src:l,alt:`A flask`,share:2},{stack:[{src:`${l}#top`,alt:`A flask above`},{src:`${l}#bottom`,alt:`A flask below`}]}]}},p={args:{help:(0,s.jsx)(n,{title:`Start`,children:`Type a formula, and its isotopic distribution appears here.`})}},m={args:{hints:[`Type a formula such as C6H12O6 to see its isotopic distribution.`]}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    actions: [{
      label: 'Start drawing',
      icon: 'draw',
      onSelect: () => undefined
    }],
    figuresTitle: 'or click a figure to copy it to your page',
    help: <>
        <EmptyGuideSection title="Draw">
          <ShortcutList rows={[{
          keys: ['Click'],
          label: 'Draw a bond'
        }, {
          keys: ['Drag'],
          label: 'Aim it'
        }]} />
        </EmptyGuideSection>
        <EmptyGuideSection title="Point at an atom and press">
          <ShortcutList rows={[{
          keys: ['c', 'n', 'o'],
          label: 'Set the element'
        }, {
          keys: ['+', '-'],
          label: 'Change the charge'
        }]} />
        </EmptyGuideSection>
      </>,
    linksTitle: 'Learn',
    links: [{
      label: 'From a blank page to a figure',
      href: '#talk'
    }],
    hints: ['Paste a SMILES to add it to the drawing.', 'Drop a molfile on the page to open it.'],
    hintInterval: 3000,
    figures: [{
      src: FLASK,
      alt: 'A flask',
      share: 2
    }, {
      src: \`\${FLASK}#clicked\`,
      alt: 'Another flask',
      title: 'Copy it to the page',
      onSelect: () => undefined
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    figures: [{
      src: FLASK,
      alt: 'A flask',
      share: 2
    }, {
      stack: [{
        src: \`\${FLASK}#top\`,
        alt: 'A flask above'
      }, {
        src: \`\${FLASK}#bottom\`,
        alt: 'A flask below'
      }]
    }]
  }
}`,...f.parameters?.docs?.source},description:{story:`Figures stacked in one place of the row, beside one that takes the height.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    help: <EmptyGuideSection title="Start">
        Type a formula, and its isotopic distribution appears here.
      </EmptyGuideSection>
  }
}`,...p.parameters?.docs?.source},description:{story:`Help alone: a tool with nothing to show off and nothing that changes.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    hints: ['Type a formula such as C6H12O6 to see its isotopic distribution.']
  }
}`,...m.parameters?.docs?.source},description:{story:`A hint alone, at the bottom of the empty space.`,...m.parameters?.docs?.description}}},h=[`Default`,`StackedFigures`,`HelpOnly`,`HintOnly`]})))()}g();export{d as Default,p as HelpOnly,m as HintOnly,f as StackedFigures,h as __namedExportsOrder,u as default};