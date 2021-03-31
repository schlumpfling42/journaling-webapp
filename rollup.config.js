import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import html from "@rollup/plugin-html";
import copy from 'rollup-plugin-copy';
import cleaner from 'rollup-plugin-cleaner';
import dotenv from "dotenv";
dotenv.config();

const production = !process.env.ROLLUP_WATCH;

const version = new Date().toISOString().replace(/[\-\:\.ZT]+/g, "");

  const htmlOptions = {
	publicPath: "./build/",
	fileName: 'index.html',
	template: async ({ attributes, files, meta, publicPath, title }) => {
	  const script = (files.js || [])
		.map(({ fileName }) => {
		  return `<script defer src='${fileName}'></script>`;
		})
		.join("\n");
  
	  const css = (files.css || [])
		.map(({ fileName }) => {
		  return `<link rel='stylesheet' href='${fileName}'>`;
		})
		.join("\n");
	  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset='utf-8'>
		<meta name='viewport' content='width=device-width,initial-scale=1'>

		<title>Wins and Journal</title>

		<link rel='icon' type='image/png' href='/favicon.png'>
		<link rel='stylesheet' href='/global.${version}.css'>
		${css}
		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">

		${script}

	</head>
	<body>
	</body>
</html>`;
	},
  };

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		format: 'iife',
		name: 'app',
		file: production ? `public/build/bundle.${version}.js` : `public/build/bundle.js`,
		sourcemap: true
	},
	plugins: [
		production && cleaner({
			targets: [
				'public/build/'
			]
		}),
		replace({
			__myapp: JSON.stringify({
				env: {
					apiKey: process.env.firebase_apiKey,
					appId: process.env.firebase_appId,
					authDomain: process.env.firebase_authDomain,
					databaseURL: process.env.firebase_databaseURL,
					measurementId: process.env.firebase_measurementId,
					messagingSenderId: process.env.firebase_messagingSenderId,
					projectId: process.env.firebase_projectId,
					storageBucket: process.env.firebase_storageBucket,
					
				}
			}),
		}),
		svelte({
			preprocess: sveltePreprocess({ 
				sourceMap: !production,
				
			}),
			preprocess: [
				sveltePreprocess({ 
					sourceMap: !production,
					
				}),
			],
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: production ? `bundle.${version}.css` : `bundle.css` }),
		
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs({
			"requireReturnsDefault": true
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		copy({
			targets: [
			  { src: 'public/images/*', dest: 'public/build/images' },
			  { src: 'public/favicon.png', dest: 'public/build' },
			  { src: 'public/global.css', dest: 'public/build', rename: production ? `global.${version}.css` : `global.css` },
			]
		}),

		html(htmlOptions),
		
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	},
};
