const Compiler = require("./compiler");
const options = require("../tinypack.config");

const compiler = new Compiler(options);
compiler.run();
