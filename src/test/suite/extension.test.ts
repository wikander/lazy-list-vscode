import * as assert from "assert";
import { parseLine, constructLine, LazyListSymbol } from "../../extension";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", async () => {
  vscode.window.showInformationMessage("Start all tests.");

  let lazyListConfiguration = vscode.workspace.getConfiguration("lazyList");
  const listItemPaddingLength: number | undefined =
    lazyListConfiguration.get("listItemPadding");
  const commentPaddingLength: number | undefined =
    lazyListConfiguration.get("commentPadding");

  const listItemPadding = " ".repeat(listItemPaddingLength ?? 0);
  const commentPadding = " ".repeat(commentPaddingLength ?? 0);
  // await lazyListConfiguration.update("listItemPadding", 1, true);
  // await lazyListConfiguration.update("commentPadding", 1, true);

  test("Open list item", () => {
    const line = `  Test`;
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.open);
      assert.strictEqual(
        newLine,
        `  ${LazyListSymbol.open}${listItemPadding}Test`
      );
    } else {
      assert.fail();
    }
  });

  test("Open list item, add padding", () => {
    const line = `Test`;
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.open);
      assert.strictEqual(
        newLine,
        `${LazyListSymbol.open}${listItemPadding}Test`
      );
    } else {
      assert.fail();
    }
  });

  test("Remove list item", () => {
    const line = `${LazyListSymbol.open}${listItemPadding}Test`;
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.none);
      assert.strictEqual(newLine, `Test`);
    } else {
      assert.fail();
    }
  });

  test("Remove list item with comment", () => {
    const line = `//${commentPadding}${LazyListSymbol.open}${listItemPadding}Test`;
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.none);
      assert.strictEqual(newLine, `// Test`);
    } else {
      assert.fail();
    }
  });

  test("Open list item with comment", () => {
    const line = "  // Test";
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.open);
      assert.strictEqual(
        newLine,
        `  //${commentPadding}${LazyListSymbol.open}${listItemPadding}Test`
      );
    } else {
      assert.fail();
    }
  });

  test("Open list item with comment, add padding", () => {
    const line = "//Test";
    const parsedLine = parseLine(line);
    if (parsedLine) {
      const newLine = constructLine(parsedLine, LazyListSymbol.open);
      assert.strictEqual(
        newLine,
        `//${commentPadding}${LazyListSymbol.open}${listItemPadding}Test`
      );
    } else {
      assert.fail();
    }
  });
});
