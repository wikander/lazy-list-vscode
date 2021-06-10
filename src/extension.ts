import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("lazyList.listItemDone", () => {
      alterListItem(vscode.window.activeTextEditor, LazyListSymbol.done);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lazyList.listItemOpen", () => {
      alterListItem(vscode.window.activeTextEditor, LazyListSymbol.open);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lazyList.listItemKill", () => {
      alterListItem(vscode.window.activeTextEditor, LazyListSymbol.none);
    })
  );
}

function alterListItem(
  editor: vscode.TextEditor | undefined,
  sym: LazyListSymbol
): void {
  if (editor) {
    const lineNumber = editor.selection.active.line;
    const currentLine: vscode.TextLine = editor.document.lineAt(lineNumber);
    const parsedLine: LazyListLine = getParsedLine(currentLine);
    const newLine = constructLine(parsedLine, sym);
    const lengthDiff = newLine.length - currentLine.text.length;

    editor
      .edit((textEditorEdit: vscode.TextEditorEdit) => {
        textEditorEdit.replace(currentLine.range, newLine);
      })
      .then((success) => {
        if (success) {
          const newPostion = new vscode.Position(
            editor.selection.active.line,
            editor.selection.active.character + lengthDiff
          );
          editor.selection = new vscode.Selection(newPostion, newPostion);
        }
      });
  }
}

enum LazyListSymbol {
  open = "[ ]",
  done = "[x]",
  none = "",
}

const lazyListSymbolList = [
  LazyListSymbol.open,
  LazyListSymbol.done,
  LazyListSymbol.none,
];

function constructLine(parsedLine: LazyListLine, newSymbol: string): string {
  let symbolWithPadding = `${newSymbol}${" ".repeat(paddingLength)}`;

  if (symbolWithPadding.length === paddingLength) {
    symbolWithPadding = "";
  }

  return `${parsedLine.start}${symbolWithPadding}${parsedLine.end}`;
}

function getParsedLine(textLine: vscode.TextLine): LazyListLine {
  const startIndex = textLine.firstNonWhitespaceCharacterIndex;

  const start = textLine.text.substring(0, startIndex);
  let end = textLine.text.substring(startIndex);

  const symbol = containsSymbol(end);
  if (symbol) {
    end = end.substring(symbol.length + paddingLength);
  }
  return {
    start,
    symbol,
    end,
  };
}

const paddingLength = 1;

function containsSymbol(text: string): string | null {
  for (const sym of lazyListSymbolList) {
    if (text.startsWith(sym)) {
      return sym;
    }
  }
  return null;
}

interface LazyListLine {
  start: string;
  symbol: string | null;
  end: string;
}

// this method is called when your extension is deactivated
export function deactivate() {}
