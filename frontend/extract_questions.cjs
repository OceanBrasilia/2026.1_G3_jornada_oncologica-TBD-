const fs = require('fs');
const path = require('path');

const formsDir = '/Users/felipemarinho/Documents/GitHub/Jornada_Oncologica/frontend/src/app/components/forms';
const files = fs.readdirSync(formsDir).filter(f => f.endsWith('Form.tsx') && f !== 'DefaultForm.tsx');

let markdown = '# Lista de Perguntas, Campos e Opções por Formulário\n\n';

files.forEach(file => {
  const filePath = path.join(formsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  markdown += `## ${file.replace('.tsx', '')}\n\n`;
  
  const componentNames = ['Input', 'Select', 'Textarea', 'RadioPills', 'CheckboxGroup', 'MultiSelect', 'ScaleCard', 'SearchableSelect'];
  
  let found = false;
  
  for (const component of componentNames) {
    const regex = new RegExp(`<${component}\\b([^>]*?)>`, 'gs');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const propsStr = match[1];
      
      const labelMatch = propsStr.match(/label=(?:["']([^"']+)["']|\{["']([^"']+)["']\})/);
      if (!labelMatch) continue;
      
      const label = labelMatch[1] || labelMatch[2];
      
      let optionsStr = "";
      const optMatch = propsStr.match(/options=\{\[\s*(.*?)\s*\]\}/s);
      if (optMatch) {
          const rawOpts = optMatch[1];
          // Simple split, handles most inline arrays of strings
          const optionsArray = rawOpts.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
          if (optionsArray.length > 0) {
              optionsStr = `\n  - **Opções:** ${optionsArray.join(', ')}`;
          }
      } else {
         // Maybe options={optionsVariable}
         const varMatch = propsStr.match(/options=\{([^\[\]]+?)\}/);
         if (varMatch) {
             optionsStr = `\n  - **Opções:** Variável '${varMatch[1]}'`;
         }
      }
      
      markdown += `- **[${component}]** ${label.trim()}${optionsStr}\n`;
      found = true;
    }
  }
  
  if (!found) {
    const fallbackRegex = /label=(?:["']([^"']+)["']|\{["']([^"']+)["']\})/g;
    let match2;
    while ((match2 = fallbackRegex.exec(content)) !== null) {
      const label = match2[1] || match2[2];
      markdown += `- **[Campo]** ${label.trim()}\n`;
      found = true;
    }
    if (!found) {
        markdown += "Nenhum campo encontrado.\n";
    }
  }
  
  markdown += '\n';
});

fs.writeFileSync('/Users/felipemarinho/Documents/GitHub/Jornada_Oncologica/frontend/perguntas_formularios_com_opcoes.md', markdown);
console.log('Markdown generated.');
