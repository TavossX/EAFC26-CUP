import fs from 'fs';

function replaceInFile(file, search, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replacement);
  fs.writeFileSync(file, content);
}

replaceInFile('src/components/Chaveamento.tsx', 
  `      borderColor={partida.finalizada ? 'brand.dark' : 'brand.dark'}\n      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400' }}\n      bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}\n      _dark={{ bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}`,
  `      borderColor={partida.finalizada ? 'brand.dark' : 'brand.dark'}\n      bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}\n      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400', bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}`
);

replaceInFile('src/components/Chaveamento.tsx',
  `          borderColor="brand.dark"\n          _dark={{ borderColor: 'whiteAlpha.300' }}\n          bg="brand.surfaceLight"\n          _dark={{ bg: 'brand.surfaceDark' }}`,
  `          borderColor="brand.dark"\n          bg="brand.surfaceLight"\n          _dark={{ borderColor: 'whiteAlpha.300', bg: 'brand.surfaceDark' }}`
);

replaceInFile('src/components/Chaveamento.tsx',
  `      borderColor={partida.finalizada ? 'brand.dark' : 'brand.dark'}\n      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400' }}\n      bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}\n      _dark={{ bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}`,
  `      borderColor={partida.finalizada ? 'brand.dark' : 'brand.dark'}\n      bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}\n      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400', bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}`
);

replaceInFile('src/components/Chaveamento.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} p={3} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight" p={3} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/components/ModalCompartilhar.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n        borderRadius="4px"\n        borderWidth={1}\n        borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n        borderRadius="4px"\n        borderWidth={1}\n        borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/components/ModalCompartilhar.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'whiteAlpha.50' }} borderRadius="2px" p={3} spacing={2}\n                  borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.100' }}`,
  `bg="brand.surfaceLight" borderRadius="2px" p={3} spacing={2}\n                  borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.100' }}`
);

replaceInFile('src/components/ModalPlacar.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n        borderRadius="4px"\n        borderWidth={1}\n        borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n        borderRadius="4px"\n        borderWidth={1}\n        borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/components/ModalPlacar.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight" borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/ConfigurarTorneio.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight" borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/ConfigurarTorneio.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n                borderRadius="2px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n                borderRadius="2px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Convite.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n            borderRadius="4px"\n            borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n            borderRadius="4px"\n            borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Convite.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n            borderRadius="4px"\n            borderWidth={1}\n            borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n            borderRadius="4px"\n            borderWidth={1}\n            borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Convite.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight" borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Convite.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Dashboard.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n            borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n            borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Dashboard.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n            p={10} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n            p={10} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Dashboard.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n                borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n                borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Dashboard.tsx',
  `borderTopWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}>\n                  <Button\n                    flex={1} size="sm" variant="outline" borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `borderTopWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}>\n                  <Button\n                    flex={1} size="sm" variant="outline" borderColor="brand.dark"` // Button doesn't need second _dark
);

replaceInFile('src/pages/Login.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/Register.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/TorneioLiga.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n          borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n          borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/TorneioLiga.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n            borderRadius="4px"\n            borderWidth={1}\n            borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n            borderRadius="4px"\n            borderWidth={1}\n            borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/TorneioMataMata.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight"\n          borderRadius="4px"\n          borderWidth={1}\n          borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

replaceInFile('src/pages/TorneioMataMata.tsx',
  `bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} p={4} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}`,
  `bg="brand.surfaceLight" p={4} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}`
);

console.log("Fixes complete");
