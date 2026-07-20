const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const sourceFiles = walk(path.resolve('src'))
  .filter((file) => /\.(?:ts|tsx)$/.test(file))
  .map((file) => ({
    file,
    sourceFile: ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ),
  }));

function getObjectPropertyNames(node) {
  const names = new Set();
  for (const property of node.properties) {
    if (ts.isShorthandPropertyAssignment(property)) names.add(property.name.text);
    else if (ts.isPropertyAssignment(property) && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)))
      names.add(property.name.text);
  }
  return names;
}

function getBindingNames(pattern) {
  const names = new Set();
  if (!ts.isObjectBindingPattern(pattern)) return names;
  for (const element of pattern.elements) {
    if (!ts.isIdentifier(element.name)) continue;
    names.add(
      element.propertyName && ts.isIdentifier(element.propertyName) ? element.propertyName.text : element.name.text,
    );
  }
  return names;
}

const definitions = [];
const JSX_INTRINSIC_NAMES = new Set([
  'aside',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'header',
  'label',
  'main',
  'section',
  'span',
]);
for (const { file, sourceFile } of sourceFiles) {
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.parameters.length === 1) {
      const parameter = node.parameters[0];
      if (parameter.type?.getText(sourceFile).replaceAll(' ', '') === 'Record<string,any>') {
        const required = getBindingNames(parameter.name);
        if (ts.isIdentifier(parameter.name) && node.body) {
          const scopeName = parameter.name.text;
          function collectScopeDestructures(child) {
            if (
              ts.isVariableDeclaration(child) &&
              ts.isObjectBindingPattern(child.name) &&
              child.initializer?.getText(sourceFile) === scopeName
            )
              for (const name of getBindingNames(child.name)) required.add(name);
            ts.forEachChild(child, collectScopeDestructures);
          }
          collectScopeDestructures(node.body);
        }
        definitions.push({ name: node.name.text, file, required });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

const violations = [];
for (const definition of definitions) {
  const calls = [];
  for (const { file, sourceFile } of sourceFiles) {
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(sourceFile) === definition.name &&
        node.arguments[0] &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        calls.push({
          file,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          provided: getObjectPropertyNames(node.arguments[0]),
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
  if (calls.length === 0) violations.push(`${definition.name}: no object-literal call site found`);
  for (const call of calls) {
    const missing = [...definition.required].filter((name) => !call.provided.has(name));
    const meaningfulMissing = missing.filter((name) => !JSX_INTRINSIC_NAMES.has(name));
    if (meaningfulMissing.length)
      violations.push(
        `${definition.name} at ${path.relative(process.cwd(), call.file)}:${call.line}: ${meaningfulMissing.join(', ')}`,
      );
  }
}

console.log(`Extracted scope bridges: ${definitions.length} checked`);
if (violations.length) {
  console.error('Extracted scope bridge mismatch:\n' + violations.map((item) => `  ${item}`).join('\n'));
  process.exitCode = 1;
}
