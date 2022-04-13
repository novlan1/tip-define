/**
 * 跳转到定义示例，本示例支持package.json中dependencies、devDependencies跳转到对应依赖包。
 */
 const vscode = require('vscode');
 const path = require('path');
 const fs = require('fs');
 const util = require('./util');

 
 /**
  * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
  * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
  * @param {*} document 
  * @param {*} position 
  * @param {*} token 
  */
 function provideDefinition(document, position, token) {
   const fileName	= document.fileName;
   const workDir	 = path.dirname(fileName);
   const word		= document.getText(document.getWordRangeAtPosition(position));
   const line		= document.lineAt(position);
   const projectPath = util.getProjectPath(document);
 
   console.log('====== 进入 provideDefinition 方法 ======');
   console.log('fileName: ' + fileName); // 当前文件完整路径
   console.log('workDir: ' + workDir); // 当前文件所在目录
   console.log('word: ' + word); // 当前光标所在单词
   console.log('line: ' + line.text); // 当前光标所在行
   console.log('projectPath: ' + projectPath); // 当前工程目录

   const reg = /import\s+.*\s+from\s+'(.*)'/;
   const lineText = line.text;

   console.log('reg.test(lineText)', reg.test(lineText));

  if (!lineText.match(reg)) {
    return;
  }
  const iPath = lineText.match(reg)[1];
  const index = workDir.indexOf('/src');
  let nPath = path.resolve(workDir.slice(0, index), iPath);

  const postfixReg = /\.(js|ts|tsx|jsx|vue)$/;

  if (!postfixReg.test(nPath)) {
    const jsPath = `${nPath}.js`; 
    const vuePath = `${nPath}.vue`; 
    const tsPath = `${nPath}.ts`; 
    const indexJSPath = path.resolve(nPath, 'index.js');
    const indexVuePath = path.resolve(nPath, 'index.vue');
    const indexTsPath = path.resolve(nPath, 'index.ts');

    const checkList = [jsPath, vuePath, tsPath, indexJSPath, indexVuePath, indexTsPath];
    
    for (const item of checkList) {
      if (fs.existsSync(item)) {
        nPath = item;
        break;
      }
    }
    if (!postfixReg.test(nPath)) { return; }
  }
  if (fs.existsSync(nPath)) {
    console.log('existsSync');
    // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
    return new vscode.Location(vscode.Uri.file(nPath), new vscode.Position(0, 0));
  } 
}
 
 module.exports = function(context) {
   // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
   context.subscriptions.push(vscode.languages.registerDefinitionProvider(
    { scheme: 'file', pattern: '**/*.{js,jsx,ts,tsx,vue}' }, {
     provideDefinition
   }));
 };
 