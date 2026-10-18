const fs = require('fs');
const path = require('path');

const chatDir = '/Users/adsuriya/athena-ai/client/src/pages/chat';

const structure = {
  components: [
    'ChatCategoriesPanel.jsx',
    'ChatHeader.jsx',
    'ChatInputForm.jsx',
    'ChatMainView.jsx',
    'ChatMessageList.jsx',
    'ChatModals.jsx',
    'ChatUIComponents.jsx'
  ],
  hooks: [
    { old: 'ChatHandlers.jsx', new: 'useChatHandlers.jsx' },
    'useChatManager.jsx',
    'useVoiceRecording.jsx'
  ],
  utils: [
    'ChatUtils.jsx'
  ],
  data: [
    'ChatCategoriesData.js'
  ]
};

// Create dirs
Object.keys(structure).forEach(dir => {
  const dirPath = path.join(chatDir, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// Helper to get file type
const getFileType = (fileName) => {
  for (const [dir, files] of Object.entries(structure)) {
    for (const file of files) {
      const name = typeof file === 'string' ? file : file.old;
      if (name === fileName) return dir;
    }
  }
  return null;
};

// Update import paths
const updateImports = (content, currentDir) => {
  // Update parent imports: ../../ something -> ../../../ something
  content = content.replace(/from '(\.\.\/\.\.\/[^']+)'/g, "from '../$1'");
  content = content.replace(/from "(\.\.\/\.\.\/[^"]+)"/g, 'from "../$1"');
  
  // Update sibling imports: ../ something -> ../../ something
  content = content.replace(/from '(\.\.\/[a-zA-Z0-9]+[^']+)'/g, "from '../$1'");
  content = content.replace(/from "(\.\.\/[a-zA-Z0-9]+[^"]+)"/g, 'from "../$1"');

  // Update local sibling imports: ./something
  const importRegex = /from '(\.\/[^']+)'/g;
  content = content.replace(importRegex, (match, p1) => {
    let importedFile = p1.replace('./', '');
    if (!importedFile.endsWith('.jsx') && !importedFile.endsWith('.js') && !importedFile.endsWith('.css')) {
      // It might lack extension, try to guess
      if (fs.existsSync(path.join(chatDir, importedFile + '.jsx'))) importedFile += '.jsx';
      else if (fs.existsSync(path.join(chatDir, importedFile + '.js'))) importedFile += '.js';
    }

    if (importedFile === 'ChatHandlers.jsx') importedFile = 'useChatHandlers.jsx';

    const importedType = getFileType(importedFile);
    
    if (importedType) {
      if (currentDir === importedType) {
        return `from './${importedFile}'`;
      } else {
        return `from '../${importedType}/${importedFile}'`;
      }
    } else {
      return `from '../${importedFile}'`;
    }
  });

  return content;
};

// Move files and update content
Object.entries(structure).forEach(([dir, ObjectOrStrings]) => {
  ObjectOrStrings.forEach(fileObj => {
    const oldName = typeof fileObj === 'string' ? fileObj : fileObj.old;
    const newName = typeof fileObj === 'string' ? fileObj : fileObj.new;
    
    const oldPath = path.join(chatDir, oldName);
    const newPath = path.join(chatDir, dir, newName);

    if (fs.existsSync(oldPath)) {
      let content = fs.readFileSync(oldPath, 'utf8');
      content = updateImports(content, dir);
      fs.writeFileSync(newPath, content);
      fs.unlinkSync(oldPath);
    }
  });
});

// Update chat.jsx
const chatJsxPath = path.join(chatDir, 'chat.jsx');
if (fs.existsSync(chatJsxPath)) {
  let content = fs.readFileSync(chatJsxPath, 'utf8');
  content = updateImports(content, '.');
  fs.writeFileSync(chatJsxPath, content);
}

