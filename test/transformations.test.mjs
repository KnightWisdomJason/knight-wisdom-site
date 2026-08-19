import test from "node:test";
import assert from "node:assert/strict";
globalThis.btoa = (value) => Buffer.from(value, "binary").toString("base64");
globalThis.atob = (value) => Buffer.from(value, "base64").toString("binary");
const { getTextStats, convertCase, formatJson, encodeBase64, decodeBase64 } = await import("../.test-build/transformations.js");
test("counts words and characters", () => { const stats = getTextStats("Hello world.\n\nAgain!"); assert.equal(stats.words, 3); assert.equal(stats.characters, 20); assert.equal(stats.sentences, 2); assert.equal(stats.paragraphs, 2); });
test("converts common case formats", () => { assert.equal(convertCase("hello world", "camel"), "helloWorld"); assert.equal(convertCase("hello world", "snake"), "hello_world"); assert.equal(convertCase("hello world", "upper"), "HELLO WORLD"); });
test("formats valid JSON and rejects invalid JSON", () => { assert.equal(formatJson('{"a":1}'), '{\n  "a": 1\n}'); assert.throws(() => formatJson('{"a":}')); });
test("encodes and decodes UTF-8 Base64", () => { const encoded = encodeBase64("你好 Knight"); assert.equal(decodeBase64(encoded), "你好 Knight"); assert.throws(() => decodeBase64("not valid!")); });
