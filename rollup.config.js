import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

var map = {'BaseManage': {
  entry: 'src/js/BaseManage.js',
  dest: 'dist/BaseCarousel.js',
  moduleName: 'BaseManage',
  format: 'umd',
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}, 'AsyncManage': {
  entry: 'src/js/AsyncManage.js',
  dest: 'dist/AsyncManage.js',
  moduleName: 'AsyncManage',
  format: 'umd',
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}};

// export default map['BaseCarousel'];
export default map['AsyncManage'];
// export default map['ParallelCarousel'];
