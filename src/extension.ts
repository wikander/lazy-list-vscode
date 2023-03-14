import { setUncaughtExceptionCaptureCallback } from "process";
import * as vscode from "vscode";

const llConfig = vscode.workspace.getConfiguration("lazyList");

const configuration = {
  paddingRightLength: llConfig.get("listItemPadding") as number,
  paddingLeftLength: llConfig.get("commentPadding") as number,
};

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
    const currentLineNumber = editor.selection.active.line;
    const currentColNumber = editor.selection.active.character;
    const currentLine: vscode.TextLine =
      editor.document.lineAt(currentLineNumber);
    const parsedLine: LazyListLine | null = parseLine(currentLine.text);

    if (parsedLine) {
      const newLine = constructLine(parsedLine, sym);
      const lengthDiff = newLine.length - currentLine.text.length;
      const newColNumber = Math.max(currentColNumber + lengthDiff, 0);
      editor
        .edit((textEditorEdit: vscode.TextEditorEdit) => {
          textEditorEdit.replace(currentLine.range, newLine);
        })
        .then((success) => {
          if (success) {
            const newPostion = new vscode.Position(
              currentLineNumber,
              newColNumber
            );
            editor.selection = new vscode.Selection(newPostion, newPostion);
          }
        });
    } else {
      throw new Error("fail");
    }
  }
}

export enum LazyListSymbol {
  open = "[_]", //TODO
  done = "[x]",
  wontdo = "[#]",
  started = "[>]",
  paused = "[=]",
  important = "[!]",
  specify = "[~]",
  idea = "[y]",
  positive = "[)]",
  neutral = "[|]",
  negative = "[(]",
  none = "",
}

const commentSymbols = ["--", "//", "%", "#"];
const commentSymbolsRegex = ["--", "\\/\\/", "%", "#"];
const lazyListSymbolsRegex = [
  "\\[_\\]",
  "\\[x\\]",
  "\\[#\\]",
  "\\[>\\]",
  "\\[=\\]",
  "\\[!\\]",
  "\\[~\\]",
];

export function constructLine(
  parsedLine: LazyListLine,
  newSymbol: LazyListSymbol
): string {
  let leftPadding = parsedLine.padding.left ?? "";
  let rightPadding = parsedLine.padding.right ?? "";
  let comment = parsedLine.comment ?? "";

  if (newSymbol !== LazyListSymbol.none) {
    if (leftPadding.length < configuration.paddingLeftLength) {
      leftPadding = " ".repeat(configuration.paddingLeftLength);
    }

    if (rightPadding.length < configuration.paddingRightLength) {
      rightPadding = " ".repeat(configuration.paddingRightLength);
    }
  } else {
    if (rightPadding.length >= configuration.paddingRightLength) {
      rightPadding = rightPadding.substring(
        0,
        rightPadding.length - configuration.paddingRightLength
      );
    }
  }

  if (comment.length > 0) {
    comment += leftPadding;
  }

  return `${parsedLine.start ?? ""}\
${comment}\
${newSymbol ?? ""}\
${rightPadding}\
${parsedLine.end ?? ""}`;
}

export function parseLine(textLine: string): LazyListLine | null {
  const regexp = `^(?<start>\\\s*)(?<comment>${commentSymbolsRegex.join(
    "|"
  )})?(?<leftPadding>\\\s*)(?<symbol>${lazyListSymbolsRegex.join(
    "|"
  )})?(?<rightPadding>\\\s*)(?<end>.*)$`;
  const rx = new RegExp(regexp);

  const lineMatch = textLine.match(rx);

  if (lineMatch && lineMatch.groups) {
    return {
      start: lineMatch.groups.start,
      comment: lineMatch.groups.comment,
      symbol: lineMatch.groups.symbol,
      end: lineMatch.groups.end,
      padding: {
        left: lineMatch.groups.leftPadding,
        right: lineMatch.groups.rightPadding,
      },
    };
  } else {
    return null;
  }
}

function startsWithSymbols(text: string, symbols: string[]): string | null {
  for (const sym of symbols) {
    if (text.startsWith(sym)) {
      return sym;
    }
  }
  return null;
}

interface LazyListLine {
  start: string;
  symbol: string | null;
  padding: LazyListSymbolPadding;
  comment: string | null;
  end: string;
}

interface LazyListSymbolPadding {
  left: string;
  right: string;
}

// this method is called when your extension is deactivated
export function deactivate() {}
