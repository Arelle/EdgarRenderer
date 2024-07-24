import webpack from 'webpack';
import path from 'path';

// import config from webpackConfig
import webpackConfig from './webpack.config';

webpack({
    webpackConfig, env: {copy: false}, argv: { mode: 'production'}
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log('err', err)
    }
    // Done processing
});