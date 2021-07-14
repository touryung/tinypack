const path = require("path");
const { getAST, getDependencies, transform } = require("./parser");
const fs = require("fs");

class Compiler {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;

    this.modules = [];
  }

  /**
   * 通过入口文件收集依赖将所有模块存起来
   */
  run() {
    const entryModule = this.buildModule(this.entry, true);
    this.modules.push(entryModule);

    for (const module of this.modules) {
      for (const dependency of module.dependencies) {
        const moduleInfo = this.buildModule(dependency, false);
        this.modules.push(moduleInfo);
      }
    }

    this.emitFile();
  }

  /**
   * 构建出指定路径模块的信息
   * @param {*} filename
   * @param {*} isEntry
   * @returns
   */
  buildModule(filename, isEntry) {
    let ast;

    if (isEntry) {
      ast = getAST(filename);
    } else {
      const absolutePath = path.join(process.cwd(), `src/${filename}`);
      ast = getAST(absolutePath);
    }

    return {
      filename,
      dependencies: getDependencies(ast),
      source: transform(ast),
    };
  }

  emitFile() {
    const outputPath = path.join(this.output.path, this.output.filename);

    let modules = "";
    for (const module of this.modules) {
      modules += `"${module.filename}": function(require, module, exports) { ${module.source} },`;
    }

    // 模仿 webpack 模块机制
    const bundle = `(function (modules) {
      function require(filename) {
        var fn = modules[filename];
        var module = { exports: {} };
    
        fn(require, module, module.exports);
    
        return module.exports;
      }
    
      require("${this.entry}");
    })({${modules}})`;

    fs.writeFileSync(outputPath, bundle, "utf8");
  }
}

module.exports = Compiler;
