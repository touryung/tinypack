const fs = require("fs");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");

/**
 * 获取指定路径文件的 AST
 * @param {*} path
 * @returns
 */
const getAST = (path) => {
  const source = fs.readFileSync(path, "utf8");

  return parse(source, {
    sourceType: "module",
  });
};

/**
 * 根据 AST 获取依赖路径
 * @param {*} ast
 * @returns
 */
const getDependencies = (ast) => {
  const dependencies = [];

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });

  return dependencies;
};

/**
 * 根据 AST 生成 ES5 代码
 * @param {*} ast
 * @returns
 */
const transform = (ast) => {
  const { code } = transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return code;
};

module.exports = {
  getAST,
  getDependencies,
  transform,
};
