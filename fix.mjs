import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = getFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove duplicate imports
  if (file.endsWith('Login.tsx')) {
    content = content.replace(/Input,\s*InputGroup/g, 'InputGroup');
  }
  if (file.endsWith('ModalCompartilhar.tsx')) {
    content = content.replace(/Badge,\s*List,\s*ListItem,\s*ListIcon,/g, 'List, ListItem,');
    content = content.replace(/const ShareIcon = [\s\S]*?\);\n/g, '');
  }
  if (file.endsWith('Dashboard.tsx')) {
    content = content.replace(/StatHelpText,\s*/g, '');
    content = content.replace(/Tag,\s*/g, '');
    content = content.replace(/useClipboard,\s*/g, '');
    content = content.replace(/import \{ AtualizarPlacar \} from '\.\.\/components\/AtualizarPlacar';\n/g, '');
    content = content.replace(/import \{ CadastroJogador \} from '\.\.\/components\/CadastroJogador';\n/g, '');
    content = content.replace(/const INVITE_URL = `\$\{window\.location\.origin\}\/convite\/\$\{CAMPEONATO_ID\}`;/g, '');
    content = content.replace(/const CAMPEONATO_ID = 'camp-2025-eafc';/g, '');
    content = content.replace(/const statsData = \[\s*\{[\s\S]*?\],\s*\];\n/g, '');
  }
  if (file.endsWith('Convite.tsx')) {
    content = content.replace(/const \{ torneio, participantes, carregarTorneioPublico, resetarTorneio \} = useTorneioStore\(\);/g, 'const { torneio, participantes, carregarTorneioPublico } = useTorneioStore();');
  }
  if (file.endsWith('theme.ts')) {
    content = content.replace(/const components = \{\n  Button: \{\n    baseStyle: \(props: any\) => \(\{\n/g, 'const components = {\n  Button: {\n    baseStyle: () => ({\n');
  }
  if (file.endsWith('main.tsx')) {
    content = content.replace(/, extendTheme /g, ' ');
  }

  // 2. Remove variant from NumberInputField in ModalPlacar.tsx
  if (file.endsWith('ModalPlacar.tsx')) {
    content = content.replace(/<NumberInputField([^>]*?)variant="outline"([^>]*?)>/g, '<NumberInputField$1$2>');
  }

  // 3. Fix double _dark props.
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // If the line has two _dark props
    if ((lines[i].match(/_dark=\{/g) || []).length > 1) {
      // Find all _dark props
      const matches = [...lines[i].matchAll(/_dark=\{\{\s*([a-zA-Z]+):\s*'([^']+)'\s*\}\}/g)];
      if (matches.length > 1) {
        let combined = '';
        matches.forEach(m => {
          combined += `${m[1]}: '${m[2]}', `;
        });
        combined = `_dark={{ ${combined.slice(0, -2)} }}`;
        
        // Remove all old _dark props from the line
        let newLine = lines[i];
        matches.forEach(m => {
          newLine = newLine.replace(m[0], '');
        });
        
        // Append the combined one
        newLine = newLine.trimRight() + ' ' + combined;
        lines[i] = newLine;
      }
    }
  }
  content = lines.join('\n');

  // Format B (multiline)
  content = content.replace(/_dark=\{\{\s*borderColor:\s*'([^']+)'\s*\}\}\s*\n\s*bg=\{?([^}\n]+)\}?\s*\n\s*_dark=\{\{\s*bg:\s*'([^']+)'\s*\}\}/g, 
    'bg={$2}\n        _dark={{ borderColor: \'$1\', bg: \'$3\' }}');
  
  content = content.replace(/_dark=\{\{\s*bg:\s*'([^']+)'\s*\}\}\s*\n\s*borderRadius="([^"]+)"\s*\n\s*borderWidth=\{([^}]+)\}\s*\n\s*borderColor="([^"]+)"\s*\n\s*_dark=\{\{\s*borderColor:\s*'([^']+)'\s*\}\}/g, 
    'borderRadius="$2"\n        borderWidth={$3}\n        borderColor="$4"\n        _dark={{ bg: \'$1\', borderColor: \'$5\' }}');

  // Specific fixes
  if (file.endsWith('Chaveamento.tsx')) {
    content = content.replace(/_dark=\{\{\s*borderColor:\s*partida\.finalizada \? 'whiteAlpha\.300' : 'whiteAlpha\.400'\s*\}\}\s*\n\s*bg=\{partida\.finalizada \? 'blackAlpha\.50' : 'brand\.surfaceLight'\}\s*\n\s*_dark=\{\{\s*bg:\s*partida\.finalizada \? 'whiteAlpha\.50' : 'brand\.surfaceDark'\s*\}\}/g,
      "bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}\n      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400', bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}");
  }

  // Same line replacement alternative for other lines
  // Sometimes it's like this:
  // _dark={{ borderColor: 'whiteAlpha.300' }}
  // overflow="hidden"
  // mx={4}
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
